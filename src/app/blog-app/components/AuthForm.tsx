'use client'

import { startTransition, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import useAuthStatus from '@/app/hooks/useAuthStatus';
import { LoaderIcon } from 'lucide-react';
import SkeletonLoader from './skeleton';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { loggedIn, loginStatusLoading } = useAuthStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/blog-app/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        name,
        action: isLogin ? 'login' : 'register',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    if(!data.success) {
      setError("Could not login!");
      return;
    }

    router.push('/blog-app');
  };

  useEffect(()=> {
    if(loggedIn) {
      router.push('/blog-app');
    }
  }, [loggedIn])

  if(loginStatusLoading) return <SkeletonLoader />

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />}
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            {isLogin ? 'Login' : 'Register'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account?' : 'Already have an account?'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}