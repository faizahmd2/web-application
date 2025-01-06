'use client'

import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CookieUser, Post } from '@/lib/blog-app/types';
import { Alert } from '@/components/ui/alert';
import SkeletonLoader from '../../components/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: {
    postId: string;
  };
}

const BlogPost: React.FC<PageProps> = ({ params }) => {
  const postId = params.postId;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('Post ID is required');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/blog-app/posts/${postId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch post');
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <Alert variant="destructive" className="mb-4">
      {error}
    </Alert>
  }


  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://avatar.iran.liara.run/public`} alt={`pic`} />
              <AvatarFallback>{post.authorId || "Anonymous"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{post.authorId || "Anonymous"}</p>
              <p className="text-sm">
                {format(new Date(post.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="mx-2">·</span>
            {`2`} min read
          </div>
          <div className='flex justify-end w-full'>
            <Link href="/blog-app">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
};

export default BlogPost;