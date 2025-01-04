import { getPost } from '@/lib/blog-app/posts';
import { getUserFromServerRequest } from '@/lib/blog-app/auth';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PostPage({
  params
}: {
  params: { postId: string }
}) {
  const post = await getPost(params.postId);
  if (!post) notFound();

  const user = await getUserFromServerRequest();
  const isAuthor = user?.userId === post.authorId;

  if (!post.isPublished && !isAuthor) notFound();

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          {isAuthor && (
            <Link href={`/edit/${post.postId}`}>
              <Button>Edit Post</Button>
            </Link>
          )}
        </div>
        <div className="prose max-w-none">
          {post.content}
        </div>
        <div className="mt-8 text-gray-500">
          Posted on {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </Card>
    </main>
  );
}