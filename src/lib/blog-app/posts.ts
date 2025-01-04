import { docClient } from './db';
import { PutCommand, QueryCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Post } from './types';
import { gzipSync, gunzipSync } from "zlib";

export async function createPost(post: Post) {
  const compressedContent = gzipSync(post.content).toString('base64');

  const params = {
    TableName: "Posts",
    Item: {
      pId: post.postId,
      ttl: post.title,
      ct: compressedContent,
      aId: post.authorId,
      cAt: post.createdAt,
      uAt: post.updatedAt,
      cat: post.category ?? null,
    },
  };

  await docClient.send(new PutCommand(params));

  return post.postId;
}

export async function getPost(postId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: "Posts",
    Key: { pId: postId },
  }));

  const item = result.Item;

  if (!item) {
    return null;
  }

  const decompressedContent = gunzipSync(Buffer.from(item.ct, "base64")).toString();

  const resp = {
    postId: item.pId,
    title: item.ttl,
    content: decompressedContent,
    authorId: item.aId,
    isPublished: item.isPublished,
    category: item.cat ?? undefined,
    createdAt: item.cAt,
    updatedAt: item.uAt,
  };

  return resp;
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  const timestamp = new Date().toISOString();

  const expressionParts: string[] = [];
  const expressionValues: Record<string, any> = { ":updatedAt": timestamp };

  if (updates.content !== undefined) {
    expressionParts.push("ct = :content");
    expressionValues[":content"] = gzipSync(updates.content).toString("base64");
  }

  if (updates.title !== undefined) {
    expressionParts.push("ttl = :title");
    expressionValues[":title"] = updates.title;
  }

  if (typeof updates.isPublished !== "undefined") {
    expressionParts.push("isPublished = :isPublished");
    expressionValues[":isPublished"] = updates.isPublished;
  }

  if (updates.category !== undefined) {
    expressionParts.push("cat = :category");
    expressionValues[":category"] = updates.category ?? null;
  }

  expressionParts.push("uAt = :updatedAt");

  if (expressionParts.length === 1) {
    return;
  }

  const updateExpression = `SET ${expressionParts.join(", ")}`;

  await docClient.send(
    new UpdateCommand({
      TableName: "Posts",
      Key: { pId: postId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues,
    })
  );
}

export async function getUserPosts(userId: string) {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: "Posts",
      IndexName: "AuthorIdIndex",
      KeyConditionExpression: "authorId = :authorId",
      ExpressionAttributeValues: {
        ":authorId": userId,
      },
    }));

    const posts: Post[] = (result.Items || []).map((item) => {
      const decompressedContent = item.ct ? gunzipSync(Buffer.from(item.ct, "base64")).toString() : "";

      return {
        postId: item.pId,
        title: item.ttl,
        content: decompressedContent,
        authorId: item.aId,
        isPublished: item.isPublished,
        category: item.cat ?? undefined,
        createdAt: item.cAt,
        updatedAt: item.uAt,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching Author posts:", error);
    throw new Error("Failed to fetch author posts");
  }
}

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: "Posts",
        IndexName: "PublishedIndex",
        KeyConditionExpression: "isPublished = :isPublished",
        ExpressionAttributeValues: {
          ":isPublished": { BOOL: true },
        },
      })
    );
    const posts: Post[] = (result.Items || []).map((item) => {
      const decompressedContent = item.ct ? gunzipSync(Buffer.from(item.ct, "base64")).toString() : "";

      return {
        postId: item.pId,
        title: item.ttl,
        content: decompressedContent,
        authorId: item.aId,
        isPublished: item.isPublished,
        category: item.cat ?? undefined,
        createdAt: item.cAt,
        updatedAt: item.uAt,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching published posts:", error);
    throw new Error("Failed to fetch published posts");
  }
}