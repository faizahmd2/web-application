import { NextRequest, NextResponse } from 'next/server';
import { postOperations } from '@/lib/blog-app/supabase_posts';
import { getUserFromRequest } from '@/lib/blog-app/auth';
const { getPost, updatePost } = postOperations;

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const resp = await getPost(params.postId);
  if (resp.error) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const post = resp.data;

  if (!post.isPublished) {
    const user = await getUserFromRequest(request);
    if (!user || user.userId !== post.authorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resp = await getPost(params.postId);
  if (resp.error) return NextResponse.json({ error: 'Something bad has happened!' }, { status: 500 });

  const post = resp.data;
  if (!post || post.authorId !== user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();
  await updatePost(params.postId, updates);

  return NextResponse.json({ success: true });
}