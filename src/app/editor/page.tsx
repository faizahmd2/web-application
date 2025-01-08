'use client';

import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { ChevronDown, Download, Settings } from 'lucide-react';

const EditorPage = () => {
  const [content, setContent] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileTypes = [
    { extension: 'txt', label: 'Text File (.txt)' },
    { extension: 'js', label: 'JavaScript (.js)' },
    { extension: 'sql', label: 'SQL (.sql)' },
    { extension: 'json', label: 'JSON (.json)' },
    { extension: 'md', label: 'Markdown (.md)' },
    { extension: 'html', label: 'HTML (.html)' },
  ];

  const handleEditorChange = (value: any) => {
    setContent(value || '');
  };

  const downloadFile = (extension:string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${extension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="text-white font-medium">Editor</div>
        
        {/* Download dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download</span>
            <ChevronDown size={16} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-50">
              {fileTypes.map((type) => (
                <button
                  key={type.extension}
                  onClick={() => downloadFile(type.extension)}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor container */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="text"
          value={content}
          theme="vs-dark"
          loading="Loading..."
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: "on",
            automaticLayout: true,
            bracketPairColorization: {
              enabled: true,
            },
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;