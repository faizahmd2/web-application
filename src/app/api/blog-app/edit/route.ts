import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/blog-app/auth';
import { postOperations } from '@/lib/blog-app/supabase_posts';
// import { v4 as uuidv4 } from 'uuid';
import { Post } from '@/lib/blog-app/types';
const { createPost, updatePost } = postOperations;

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const authorId = user?.userId || null;

        const { title, content, category } = await req.json();
        if(!title || !content) return NextResponse.json({ error: 'Parameters Missing' }, { status: 404 });

        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();
        const post: Post = { title, content, category, createdAt, updatedAt, authorId: authorId, isPublished: false };

        let resp = await updatePost(post.postId, post);
        
        return NextResponse.json(resp, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
