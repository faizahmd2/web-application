import { docClient } from './db';
import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from 'bcryptjs';
import { User } from './types';

export async function createUser(username: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  
  await docClient.send(new PutCommand({
    TableName: "Users",
    Item: {
      userId,
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
    ConditionExpression: "attribute_not_exists(username)",
  }));
  
  return userId;
}

export async function verifyUser(username: string, password: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: "Users",
    IndexName: "UsernameIndex",
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username,
    },
  }));

  const user = result.Items?.[0] as User | undefined;
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}