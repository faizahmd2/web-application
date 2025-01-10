'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { ChevronDown, Download, Sun, Moon, Menu, X, Languages, ZoomIn, ZoomOut } from 'lucide-react';

const EditorPage = () => {
  const initialContent = `\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`;
  const [content, setContent] = useState(initialContent);
  const [isDark, setIsDark] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filename, setFilename] = useState('document');
  const [selectedLanguage, setSelectedLanguage] = useState('text');
  const dropdownRef = useRef<any | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 4, 32)); // Max font size 24
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 4, 8)); // Min font size 10
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'text', label: 'Plain Text' },
  ];

  const fileTypes = [
    { extension: 'txt', label: 'Text File (.txt)' },
    { extension: 'js', label: 'JavaScript (.js)' },
    { extension: 'json', label: 'JSON (.json)' },
    { extension: 'md', label: 'Markdown (.md)' },
    { extension: 'html', label: 'HTML (.html)' },
  ];

  const handleEditorChange = (value: any) => {
    setContent(value || '');
  };

  const downloadFile = (extension: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDropdownOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const DesktopControls = () => (
    <>
      <div className="flex items-center gap-2">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="hidden sm:inline x-2 py-1.5 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        
        <div className="relative" ref={dropdownRef}>
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
    </>
  );

  const ZoomComp = () => (<div className="hidden md:flex px-4 py-2 flex justify-center gap-4">
    <button
      onClick={handleZoomOut}
      className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
    >
      <ZoomOut size={16} />
    </button>
    <button
      onClick={handleZoomIn}
      className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
    >
      <ZoomIn size={16} />
    </button>
  </div>)

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`px-2 pt-2 pb-0 flex items-center justify-between gap-2 ${isDark ? 'bg-gray-800' : 'bg-white border-b'}`}>
        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Filename"
            className={`px-2 py-1 rounded-md ${
              isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
            } text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ZoomComp />
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-md transition-colors ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <DesktopControls />
        </div>
      </div>

      <div className="flex-1 relative">
        <Editor
          height="90vh"
          defaultLanguage="text"
          language={selectedLanguage}
          value={content}
          theme={isDark ? 'vs-dark' : 'light'}
          onChange={handleEditorChange}
          loading={
            <div className={`flex items-center justify-center h-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Loading...
            </div>
          }
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: fontSize,
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: "on",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            overviewRulerBorder: false,
            selectionHighlight: true,
            occurrencesHighlight: "off",
            renderLineHighlight: 'none',
            scrollbar: {
              useShadows: false,
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
              alwaysConsumeMouseWheel: false
            },
            // Touch settings
            mouseWheelScrollSensitivity: 1.5,
            fastScrollSensitivity: 7,
            multiCursorModifier: 'alt',
            wordBasedSuggestions: "off",
            // Selection settings
            selectionClipboard: true,
            copyWithSyntaxHighlighting: true,
            dragAndDrop: true,
            // Performance settings
            renderValidationDecorations: 'editable',
            renderWhitespace: 'none',
            renderControlCharacters: false,
            // Additional features
            links: true,
            contextmenu: true, // Enable context menu for copy/paste
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'never'
            }
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;