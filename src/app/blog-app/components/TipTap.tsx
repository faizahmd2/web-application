import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './Toolbar';

interface BlogEditorProps {
  setContent: (value: string) => void;
  content: string;
  isReading: boolean;
  onReady: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ content, setContent, isReading, onReady }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start Writing …',
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      onReady();
    }
  }, [editor, onReady]);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <style jsx global>{`
        .ProseMirror p:first-child.is-empty::before {
          content: attr(data-placeholder);
          color: gray;
          float: left;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      {!isReading ? (
        
        <div className="space-y-4">
          <EditorToolbar editor={editor} />

          <EditorContent 
            editor={editor} 
            onClick={() => editor?.chain().focus().run()}
            className="prose max-w-none min-h-[500px] border rounded-lg p-4 focus:outline-none"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </div>
  );
};

export default BlogEditor;