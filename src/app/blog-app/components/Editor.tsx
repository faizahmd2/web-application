'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bold, Italic, List, Heading1, Heading2, Quote,
  Link as LinkIcon, Eye, Edit2, Undo, Redo, Code,
  Newspaper,
  Loader,
  Loader2,
  LoaderPinwheel
} from 'lucide-react';
import { Post } from '@/lib/blog-app/types';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import Link from 'next/link';
import useAuthStatus from '@/app/hooks/useAuthStatus';
import SkeletonLoader from './skeleton';

const TipTap = dynamic(() => import('./TipTap'), {
  ssr: false,
  loading: () => <p className="p-4">Loading editor...</p>
});

interface EditorProps {
  isEdit?: boolean;
  post?: Post | null;
}

const BlogEditor: React.FC<EditorProps> = ({ isEdit, post }) => {
  const [title, setTitle] = useState(isEdit && post?.title ? post.title : '');
  const [content, setContent] = useState(isEdit && post?.content ? post.content : '');
  const [isReading, setIsReading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { loggedIn, loginStatusLoading } = useAuthStatus();

  useEffect(() => {
    const savedDraft = localStorage.getItem('draftContent');
    if (!isEdit && savedDraft) {
      setContent(savedDraft);
    }
  }, [isEdit]);

  const saveDraft = () => {
    if (content) {
      localStorage.setItem('draftContent', content);
      alert('Draft saved!');
    }
  };

  const eraseDraft = () => {
    localStorage.removeItem('draftContent');
  };

  const handleSave = async () => {
    if (isEdit) {
      const res = await fetch('/api/blog-app/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post?.postId,
          title,
          content,
          isPublished: !loggedIn
        }),
      });

      if (!res.ok) {
        setError("Could Not Edit Please try Later!")
      }
      let resp = await res.json();
      if (resp.error) return setError(resp.error);
    } else {
      const res = await fetch('/api/blog-app/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          isPublished: !loggedIn
        }),
      });

      if (!res.ok) {
        setError("Could Not Create Please try Later!")
      }

      let resp = await res.json();
      if (resp.error) return setError(resp.error);
    }

    eraseDraft()

    router.push('/blog-app');
  };

  if(loginStatusLoading) return <SkeletonLoader />

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="mx-auto max-w-4xl">
        <Tabs defaultValue="edit" className="w-full">
          <div className="flex items-center justify-between border-b p-3">
            <TabsList>
              <TabsTrigger onClick={() => setIsReading(false)} value="edit" className="flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger onClick={() => setIsReading(true)} value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Link
                href="/blog-app"
                aria-label="Cancel"
              >
                <Button>Cancel</Button>
              </Link>
            </div>
          </div>

          <div className="p-2 pb-1 pl-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your title..."
              className="w-full border-none text-3xl font-bold focus:outline-none bg-transparent"
            />
          </div>
          {error && <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>}

          <TipTap content={isEditorReady ? content : ''} isReading={isReading} setContent={setContent} onReady={() => setIsEditorReady(true)} />
          <div className='w-full flex justify-end pr-2 pb-2 gap-2'>
            <Button onClick={handleSave}>{isEdit ? 'Save' : 'Create'}</Button>
            <Button onClick={saveDraft}>Save Draft</Button>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default BlogEditor;