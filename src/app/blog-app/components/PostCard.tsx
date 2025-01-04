import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Edit } from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/lib/blog-app/types';

export function PostCard({ post, isAuthor }: { post: Post; isAuthor: boolean }) {
  return (
    <Card className="w-full max-w-4xl mb-4 hover:shadow-lg transition-shadow border border-gray-200 rounded-lg bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {post.title}
          </CardTitle>
          {isAuthor && (
            <div className="flex items-center gap-2">
              {post.isPublished ? (
                <Eye className="h-5 w-5 text-green-500" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400" />
              )}
              <Link href={`/blog-app/edit/${post.postId}`}>
                <Button variant="outline" size="icon" className="border-gray-300 hover:border-gray-400">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="text-gray-700 text-sm leading-relaxed">
        <div className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.length > 80
          ? `${post.content.substring(0, 80)}...`
          : post.content }}>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-gray-500">
        <span>Posted on {new Date(post.createdAt).toLocaleDateString()}</span>
        <Link href={`/blog-app/posts/${post.postId}`} prefetch>
          <Button variant="link" className="text-blue-600 hover:underline">
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
