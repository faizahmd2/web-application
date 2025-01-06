import { NextRequest } from 'next/server';
import { postOperations } from '@/lib/blog-app/supabase_posts';
import { getUserFromRequest } from '@/lib/blog-app/auth';

const { getPost } = postOperations;

export async function GET(request: NextRequest) {
  try {
    let pathname = request.nextUrl.pathname;
    let postId = pathname.split('/').pop() || '';
    
    const resp = await getPost(postId);
    
    if (resp.error) {
      return Response.json(
        { error: 'Post not found' }, 
        { status: 404 }
      );
    }

    const post = resp.data;

    if (!post.isPublished) {
      const user = await getUserFromRequest(request);
      
      if (!user || user.userId !== post.authorId) {
        return Response.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        );
      }
    }

    return Response.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return Response.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}