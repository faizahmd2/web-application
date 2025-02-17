import { format } from 'sql-formatter';
import { parse } from 'jsonc-parser';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserPostcss from 'prettier/parser-postcss';

// Define valid content types
export type ContentType = 'json' | 'javascript' | 'sql' | 'xml' | 'html' | 'css' | 'csv' | 'text' | 'markdown' | 'typescript';

// Detect content type based on input
export const detectContentType = (content: string): ContentType => {
    const trimmed = content.trim();
  
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not JSON
    }
  
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      return 'html'; // Treat XML as HTML for formatting
    }
  
    if (/(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i.test(trimmed)) {
      return 'sql';
    }
  
    if (/(function|const|let|var|=>|import|export)/.test(trimmed)) {
      return 'javascript';
    }
  
    if (/(@media|@keyframes|#[\w-]+|\.?[\w-]+\s*{)/.test(trimmed)) {
      return 'css';
    }
  
    if (content.includes(',') && content.split('\n').every(line => line.split(',').length > 1)) {
      return 'csv';
    }
  
    return 'text';
};

// Format content based on its type
export const formatContent = async (content: string, type: ContentType): Promise<string> => {
    switch (type) {
      case 'json':
        return JSON.stringify(parse(content), null, 2);
      case 'javascript':
        console.log('Formatting JavaScript content:', content);
        return prettier.format(content, {
          parser: 'babel',
          plugins: [parserBabel],
          semi: false,
          singleQuote: true,
        });
      case 'sql':
        return await format(content); // Await the SQL formatter
      case 'xml':
      case 'html':
        return prettier.format(content, {
          parser: 'html',
          plugins: [parserHtml],
        });
      case 'css':
        return prettier.format(content, {
          parser: 'css',
          plugins: [parserPostcss],
        });
      case 'csv':
        return content
          .split('\n')
          .map(line => line.split(',').map(field => field.trim()).join(', '))
          .join('\n');
      default:
        return content;
    }
};