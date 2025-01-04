import { NextRequest, NextResponse } from 'next/server';
import { postOperations } from '@/lib/blog-app/supabase_posts';
import { getUserFromRequest } from '@/lib/blog-app/auth';
import { gunzipSync } from 'zlib';

const { getPublishedPosts, getAllPosts } = postOperations;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  if (type === 'public') {
    const posts = await getPublishedPosts();
    return NextResponse.json(posts);
  }

  const user = await getUserFromRequest(request);

  const posts = await getAllPosts(user?.userId);

  if (posts.data) {
    for (let d of posts.data) {
      d.content = gunzipSync(Buffer.from(d.content, "base64")).toString();
      d.isAuthor = d.authorId == user?.userId
    }
  }
  return NextResponse.json(posts);
}