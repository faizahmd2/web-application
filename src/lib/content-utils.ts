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
        return formatSQL(content,120); // Await the SQL formatter
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

/**
 * Simple SQL Formatter
 * Formats SQL queries with minimal new lines for improved readability
 * without excessive indentation or spacing, and with line length limit
 */

/**
 * Simple SQL Formatter
 * Formats SQL queries with improved readability by breaking at logical points
 * and respecting maximum line lengths
 */

function formatSQL(sql: string, maxLineLength: number = 80) {
  // Step 1: Normalize whitespace and preserve quoted strings
  let formattedSQL = sql.trim().replace(/\s+/g, ' ');
  
  // Preserve quoted strings to avoid breaking keywords inside them
  const stringLiterals: string[] = [];
  formattedSQL = formattedSQL.replace(/'[^']*'|"[^"]*"/g, match => {
    stringLiterals.push(match);
    return `__STRING_LITERAL_${stringLiterals.length - 1}__`;
  });
  
  // Step 2: Split the query into major sections
  // We'll process each section differently
  const sections = [];
  let currentPosition = 0;
  
  // Define regex for major section keywords
  const sectionKeywords = [
    'SELECT', 'FROM', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
    'OUTER JOIN', 'CROSS JOIN', 'WHERE', 'GROUP BY', 'HAVING', 
    'ORDER BY', 'LIMIT', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'
  ];
  
  // Create a regex that matches any of these keywords
  const sectionRegex = new RegExp(`\\b(${sectionKeywords.join('|')})\\b`, 'gi');
  
  // Find all matches and their positions
  let match;
  let matches = [];
  
  while ((match = sectionRegex.exec(formattedSQL)) !== null) {
    matches.push({ 
      keyword: match[0], 
      position: match.index 
    });
  }
  
  // Add a fake end marker
  matches.push({ 
    keyword: 'END', 
    position: formattedSQL.length 
  });
  
  // Extract each section
  for (let i = 0; i < matches.length - 1; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    const sectionText = formattedSQL.substring(
      currentMatch.position, 
      nextMatch.position
    );
    
    sections.push({
      keyword: currentMatch.keyword,
      text: sectionText
    });
  }
  
  // Step 3: Process each section according to its type
  const processedSections = sections.map(section => {
    if (section.keyword.toUpperCase() === 'SELECT') {
      return processSelectSection(section.text, maxLineLength);
    } else if (section.keyword.toUpperCase().includes('JOIN')) {
      return processJoinSection(section.text, maxLineLength);
    } else if (section.keyword.toUpperCase() === 'WHERE') {
      return processWhereSection(section.text, maxLineLength);
    } else {
      // Default processing for other sections
      return processGenericSection(section.text, maxLineLength);
    }
  });
  
  // Step 4: Combine processed sections with newlines between them
  formattedSQL = processedSections.join('\n');
  
  // Step 5: Restore string literals
  formattedSQL = formattedSQL.replace(/__STRING_LITERAL_(\d+)__/g, (match, index) => {
    return stringLiterals[parseInt(index)];
  });
  
  return formattedSQL;
}

/**
 * Process the SELECT section by formatting column lists
 */
function processSelectSection(text:string, maxLineLength:number) {
  // If the section is short enough, return it as is
  if (text.length <= maxLineLength) {
    return text;
  }
  
  // Extract column list part (everything after SELECT but before any comments or keywords)
  const selectMatch = text.match(/SELECT\s+(.*)/i);
  if (!selectMatch) return text;
  
  const columnListPart = selectMatch[1];
  
  // Split by commas, but be careful with commas in functions like COUNT(x,y)
  // Simple approach: split by comma-space pattern
  const columns = [];
  let currentColumn = '';
  let parenCount = 0;
  
  for (let i = 0; i < columnListPart.length; i++) {
    const char = columnListPart[i];
    
    if (char === '(') parenCount++;
    else if (char === ')') parenCount--;
    
    // Only split on commas that are not inside parentheses
    if (char === ',' && parenCount === 0) {
      columns.push(currentColumn.trim());
      currentColumn = '';
    } else {
      currentColumn += char;
    }
  }
  
  // Add the last column
  if (currentColumn.trim()) {
    columns.push(currentColumn.trim());
  }
  
  // Format the SELECT with one column per line if there are multiple columns
  if (columns.length > 1) {
    return `SELECT ${columns[0]},\n  ${columns.slice(1).join(',\n  ')}`;
  }
  
  return text;
}

/**
 * Process JOIN sections keeping ON clauses with their JOINs
 */
function processJoinSection(text:string, maxLineLength:number) {
  // If the section is short enough, return it as is
  if (text.length <= maxLineLength) {
    return text;
  }
  
  // Try to keep JOIN and its ON condition together
  // Check if we have an ON clause
  const hasOnClause = text.toUpperCase().includes(' ON ');
  
  if (hasOnClause) {
    // Look for AND or OR in the ON clause that might be good break points
    const andOrMatch = / AND | OR /i.exec(text);
    
    if (andOrMatch && andOrMatch.index + text.substring(0, andOrMatch.index).length > maxLineLength) {
      // Break at the AND/OR
      const breakPoint = andOrMatch.index;
      const operator = text.substring(breakPoint, breakPoint + 5).trim();
      
      return `${text.substring(0, breakPoint)}\n  ${operator} ${text.substring(breakPoint + operator.length + 1)}`;
    }
  }
  
  // If no good break points or not needed, return as is
  return text;
}

/**
 * Process WHERE sections by breaking at logical points
 */
function processWhereSection(text:string, maxLineLength:number) {
  // If the section is short enough, return it as is
  if (text.length <= maxLineLength) {
    return text;
  }
  
  // Add newlines before AND/OR that would cause the line to exceed max length
  let result = text;
  let lines = [result];
  let finalLines = [];
  
  // Process each existing line
  for (const line of lines) {
    let currentLine = line;
    let currentLineLength = currentLine.length;
    
    // Find all AND/OR operators
    let andOrPositions = [];
    let andOrRegex = /\b(AND|OR)\b/gi;
    let andOrMatch;
    
    while ((andOrMatch = andOrRegex.exec(currentLine)) !== null) {
      andOrPositions.push({
        position: andOrMatch.index,
        operator: andOrMatch[0]
      });
    }
    
    // If the line is too long and we have AND/OR operators
    if (currentLineLength > maxLineLength && andOrPositions.length > 0) {
      let lastCut = 0;
      
      for (const { position, operator } of andOrPositions) {
        // If adding this part would exceed max length
        if (position - lastCut > maxLineLength) {
          finalLines.push(currentLine.substring(lastCut, position));
          lastCut = position;
        }
      }
      
      // Add remaining part
      if (lastCut < currentLine.length) {
        finalLines.push(currentLine.substring(lastCut));
      }
    } else {
      finalLines.push(currentLine);
    }
  }
  
  return finalLines.join('\n');
}

/**
 * Default processing for other sections
 */
function processGenericSection(text:string, maxLineLength:number) {
  // If the section is short enough, return it as is
  if (text.length <= maxLineLength) {
    return text;
  }
  
  // For generic sections, try to break at commas for readability
  const commaPositions = [];
  let inParentheses = 0;
  
  // Find comma positions that are not inside parentheses
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '(') inParentheses++;
    else if (char === ')') inParentheses--;
    else if (char === ',' && inParentheses === 0) {
      commaPositions.push(i);
    }
  }
  
  // If we found commas, use them as break points
  if (commaPositions.length > 0) {
    let result = '';
    let lastPos = 0;
    
    for (const pos of commaPositions) {
      result += text.substring(lastPos, pos + 1) + '\n  ';
      lastPos = pos + 1;
    }
    
    result += text.substring(lastPos);
    return result;
  }
  
  // If no good break points found, return as is
  return text;
}