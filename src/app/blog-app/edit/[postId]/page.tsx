'use client'

import { useParams } from 'next/navigation';
import BlogEditor  from '../../components/Editor';
import { useEffect, useState } from 'react';
import { Post } from '@/lib/blog-app/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import SkeletonLoader from '../../components/skeleton';

export default function EditPost() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      let post: Post;
      const res = await fetch('/api/blog-app/posts/'+params.postId, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setLoading(false);
        setError("Please try again!");
        return;
      }

      post = await res.json();

      setPost(post);
      setLoading(false);
    }

    fetchPosts()
  }, [params.postId])

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <Alert variant="destructive" className="mb-4">
      {error}
    </Alert>
  }

  return (
    <main className="container mx-auto py-2 px-4">
      <BlogEditor post={post} isEdit={true} />
    </main>
  );
}