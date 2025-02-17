'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Download, Sun, Moon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { ContentType, detectContentType, formatContent } from '@/lib/content-utils';
import { Button } from '@/components/ui/button';
import { MagicWandIcon } from '@radix-ui/react-icons';
import { Switch } from "@/components/ui/switch";

const EditorPage = () => {
  const initialContent = `\n\n\n\n\n`;
  const [content, setContent] = useState<string>(initialContent);
  const [isDark, setIsDark] = useState(true);
  const [filename, setFilename] = useState('document.txt');
  const [autoDetect, setAutoDetect] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const editorRef = useRef<any>(null);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleContentChange = useCallback((value: string | undefined) => {
    setContent(value || '');
    if (autoDetect) {
      const detectedType = detectContentType(value || '');
      changeLanguage(detectedType);
    }
  }, [autoDetect]);

  const handleFormat = useCallback(async () => {
    try {
      const formatted = await formatContent(content, contentType);
      setContent(formatted);
    } catch (error) {
      console.error("Error formatting content:", error);
    }
  }, [content, contentType]);

  const executeJsCode = (codeToExecute: string) => {
    const customConsole = createCustomConsole();
    
    try {
      const executeFunction = new Function('console', codeToExecute);
      executeFunction(customConsole);
      return customConsole.getLogs();
    } catch (err) {
      console.error("Error executing JavaScript:", err);
      return [['error', String(err)]];
    }
  };

  const createCustomConsole = () => {
    const logs: Array<[string, string]> = [];
    return {
      log: (...args: any[]) => {
        logs.push(['log', args.map(arg => String(arg)).join(' ')]);
      },
      error: (...args: any[]) => {
        logs.push(['error', args.map(arg => String(arg)).join(' ')]);
      },
      warn: (...args: any[]) => {
        logs.push(['warn', args.map(arg => String(arg)).join(' ')]);
      },
      getLogs: () => logs,
    };
  };

  const renderPreview = useCallback(() => {
    if (contentType === 'html') {
      return (
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
          <iframe
            srcDoc={content}
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
          <Button 
            onClick={() => {
              const previewWindow = window.open('', '_blank', 'fullscreen=yes');
              if (previewWindow) {
                previewWindow.document.write(`
                  <html>
                    <head><title>Preview</title></head>
                    <body style="margin:0;padding:0;">
                      ${content}
                      <button onclick="window.close()" 
                        style="position:fixed; bottom:10px; right:10px; 
                        padding:8px 16px; background:#007bff; color:white; 
                        border:none; border-radius:4px; cursor:pointer; 
                        font-family:system-ui;">
                        Close Preview
                      </button>
                    </body>
                  </html>
                `);
                previewWindow.document.close();
              }
            }}
            className="absolute top-4 right-4 bg-gray-800 text-white hover:bg-gray-700"
          >
            <Maximize2 size={16} />
          </Button>
        </div>
      );
    } else if (contentType === 'javascript') {
      const logs = executeJsCode(content);
      return (
        <div className="bg-gray-100 dark:bg-gray-800 h-full overflow-auto">
          <pre className="whitespace-pre-wrap p-4 text-gray-900 dark:text-gray-100">
            {logs.map((log, index) => (
              <div key={index} className={`mb-2 ${
                log[0] === 'error' ? 'text-red-500' : 
                log[0] === 'warn' ? 'text-yellow-500' : 
                'text-gray-900 dark:text-gray-100'
              }`}>
                {log[1]}
              </div>
            ))}
          </pre>
        </div>
      );
    } else {
      return (
        <pre className="whitespace-pre-wrap p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-full overflow-auto">
          {content}
        </pre>
      );
    }
  }, [content, contentType]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 4, 32));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 4, 8));
  };

  const languages: { value: ContentType, label: string, extension: string }[] = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'sql', label: 'Mysql', extension: 'sql' },
    { value: 'html', label: 'HTML', extension: 'html' },
    { value: 'css', label: 'CSS', extension: 'css' },
    { value: 'json', label: 'JSON', extension: 'json' },
    { value: 'markdown', label: 'Markdown', extension: 'md' },
    { value: 'text', label: 'Plain Text', extension: 'txt' },
    { value: 'xml', label: 'XML', extension: 'xml' },
  ];

  const mimeTypesMap = languages.reduce((map, lang) => {
    map[lang.value] = lang.extension;
    return map;
  }, {} as { [key in ContentType]: string });

  const getFilenameWithExtention = useCallback(() => {
    let fileName = filename || 'document';
    let fileNameArr = fileName.split(".");
    let lastIdx = fileNameArr.length - 1;
    if (fileNameArr[lastIdx]) {
      let hasValidExtention = languages.find(l => l.extension === fileNameArr[lastIdx]);
      let currentLanguage = languages.find(l => l.value === contentType);
      if (hasValidExtention) {
        if(hasValidExtention.value !== currentLanguage?.value) {
          fileNameArr[lastIdx] = currentLanguage!.extension;
          fileName = fileNameArr.join(".");
        }
      } else {
        fileName = fileName + '.' + mimeTypesMap[contentType];
      }
    } else {
      fileName = fileName + '.' + mimeTypesMap[contentType];
    }

    return fileName;
  }, [contentType]);

  useEffect(() => {
    let fileName = getFilenameWithExtention();
    setFilename(fileName);
  }, [contentType]);

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilenameWithExtention();
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const changeLanguage = (lang: ContentType) => {
    setContentType(lang);
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const DesktopControls = () => (
    <>
      <div className="flex items-center gap-2">
        <Switch
          checked={autoDetect}
          onCheckedChange={() => setAutoDetect(!autoDetect)}
        />
        <select
          value={contentType}
          onChange={(e) => changeLanguage(e.target.value as ContentType)}
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
            onClick={downloadFile}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
        <Button className='flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors' onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        <Button className='flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors' onClick={handleFormat}>
          <MagicWandIcon className="mr-2" />
        </Button>
      </div>
    </>
  );

  const ZoomComp = () => (
    <div className="hidden md:flex px-4 py-2 flex justify-center gap-4">
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
    </div>
  );

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`px-2 pt-2 pb-0 flex items-center justify-between gap-2 ${isDark ? 'bg-gray-800' : 'bg-white border-b'}`}>
        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Filename"
            className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-md transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <DesktopControls />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showPreview ? 'w-1/2' : 'w-full'}`}>
          <Editor
            height="90vh"
            defaultLanguage="text"
            language={contentType}
            value={content}
            theme={isDark ? 'vs-dark' : 'light'}
            onChange={handleContentChange}
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
              mouseWheelScrollSensitivity: 1.5,
              fastScrollSensitivity: 7,
              multiCursorModifier: 'alt',
              wordBasedSuggestions: "off",
              selectionClipboard: true,
              copyWithSyntaxHighlighting: true,
              dragAndDrop: true,
              renderValidationDecorations: 'editable',
              renderWhitespace: 'none',
              renderControlCharacters: false,
              links: true,
              contextmenu: true,
              find: {
                addExtraSpaceOnTop: false,
                autoFindInSelection: 'never',
                seedSearchStringFromSelection: 'never'
              }
            }}
          />
        </div>

        {showPreview && (
          <div className="w-1/2 border-l border-gray-700 h-full overflow-auto">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;