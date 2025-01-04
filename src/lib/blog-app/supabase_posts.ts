import { supabase } from './supabase';
import { gzipSync, gunzipSync } from "zlib";
import { Post } from './types';

export const postOperations = {
  async createPost(post: Post) {
    const compressedContent = gzipSync(post.content).toString('base64');
    let postData = [{
      title: post.title,
      content: compressedContent,
      authorId: post.authorId,
      isPublished: post.isPublished,
      category: post.category
    }];

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();
    return { data, error };
  },

  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('postId', postId)
      .single();
    if(data && data.content) data.content = gunzipSync(Buffer.from(data.content, "base64")).toString();
    return { data, error };
  },

  async getUserPosts(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('authorId', userId)
      .order('createdAt', { ascending: false });
    return { data, error };
  },

  async getAllPosts(userId?: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(userId ? `(isPublished.eq.true,userId.eq.${userId})` : 'isPublished.eq.true')
      .order('createdAt', { ascending: false });

    if (data) {
      for (let d of data) {
        d.content = gunzipSync(Buffer.from(d.content, "base64")).toString();
      }
    }

    return { data, error };
  },

  async getPublishedPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('isPublished', true)
      .order('createdAt', { ascending: false });

    if (data) {
      for (let d of data) {
        d.content = gunzipSync(Buffer.from(d.content, "base64")).toString();
      }
    }

    return { data, error };
  },

  async updatePost(postId: string | undefined, updates: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: updates.title,
        content: updates.content,
        category: updates.category
      })
      .eq('postId', postId)
      .select()
      .single();
    return { data, error };
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('postId', postId);
    return { error };
  }
};