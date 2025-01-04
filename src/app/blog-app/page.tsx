'use client';

import { PostCard } from './components/PostCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FilePlus, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CookieUser, Post } from '@/lib/blog-app/types';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import useAuthStatus from '../hooks/useAuthStatus';
import SkeletonLoader from './components/skeleton';

interface Auth {
  isAuthor: boolean;
}

interface PostObjClient extends Post, Auth { };

export default function Dashboard() {
  const [posts, setPosts] = useState<PostObjClient[] | null>(null);
  const [loader, setLoader] = useState(true);
  const [error, setError] = useState('');
  const { loggedIn, loginStatusLoading } = useAuthStatus();

  useEffect(() => {
    const fetchPosts = async () => {
      let posts: PostObjClient[];
      const type = loggedIn ? "private" : "public";
      const res = await fetch('/api/blog-app/posts?type=' + type, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setLoader(false);
        setError("Please try again!");
        return;
      }

      let resp = await res.json();
      posts = resp.data;

      setPosts(posts);
      setLoader(false);
    }

    fetchPosts()
  }, [])

  if (loader || loginStatusLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <Alert variant="destructive" className="mb-4">
      {error}
    </Alert>
  }

  const handleLogout = async() => {
    const res = await fetch("/api/blog-app/auth/logout", { method: "GET" });

    if (res.ok) {
      window.location.href = "/blog-app";
    } else {
      console.error("Failed to logout");
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      {posts && posts.length ?
        <>
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-3xl font-bold text-gray-600">Public Posts</h1>
            <div className='flex gap-2'>
            <Link
              href="/blog-app/new"
              aria-label="Create Post"
              prefetch
            >
              <Button>Create</Button>
            </Link>
            {loggedIn ? <Button onClick={handleLogout}>Logout</Button> : 
            <Link
              href="/blog-app/login"
              aria-label="Create Post"
              prefetch
            >
              <Button>Login</Button>
            </Link>}
            </div>
          </div>
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.postId} post={post} isAuthor={post.isAuthor} />
            ))}
          </div>
        </> : <h1 className="text-3xl text-center font-bold text-gray-800 mt-3">No Posts Found</h1>}

      {/* Floating Add Post Button */}
      <Link
        href="/blog-app/new"
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg hover:bg-blue-700 transition-all"
        aria-label="Create Post"
      >
        <FilePlus className="w-6 h-6" />
      </Link>
    </main>
  );
}
