// markdown.js - Enhanced markdown parser for mini-program
/**
 * Converts markdown to WeChat mini-program rich-text nodes
 * @param {string} markdown - Markdown text to convert
 * @returns {Array} Rich text nodes array for the rich-text component
 */
function markdownToNodes(markdown) {
  if (!markdown) return [];
  
  // Process the markdown in chunks to preserve order
  let chunks = [];
  let lastIndex = 0;
  
  // Extract code blocks first to prevent interference with other patterns
  const codeBlockRegex = /```(?:(\w+)\n)?([\s\S]*?)```/g;
  let codeMatch;
  
  while ((codeMatch = codeBlockRegex.exec(markdown)) !== null) {
    // Add text before the code block
    if (codeMatch.index > lastIndex) {
      chunks.push({
        type: 'text',
        content: markdown.substring(lastIndex, codeMatch.index)
      });
    }
    
    // Add the code block
    const language = codeMatch[1] || '';
    const code = codeMatch[2].trim();
    
    chunks.push({
      type: 'code',
      language,
      content: code
    });
    
    lastIndex = codeMatch.index + codeMatch[0].length;
  }
  
  // Add remaining text
  if (lastIndex < markdown.length) {
    chunks.push({
      type: 'text',
      content: markdown.substring(lastIndex)
    });
  }
  
  // Process each chunk
  return chunks.flatMap(chunk => {
    if (chunk.type === 'code') {
      // Create a code block
      return [{
        name: 'div',
        attrs: {
          class: 'markdown-code-block',
          style: 'background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin: 8px 0; overflow-x: auto;'
        },
        children: [{
          name: 'div',
          attrs: {
            style: 'color: #666; font-size: 12px; margin-bottom: 5px;'
          },
          children: [{
            type: 'text',
            text: chunk.language || 'code'
          }]
        }, {
          name: 'pre',
          attrs: {
            style: 'margin: 0; font-family: monospace; white-space: pre-wrap; word-break: break-all;'
          },
          children: [{
            type: 'text',
            text: chunk.content
          }]
        }]
      }];
    } else {
      // Process regular text for other markdown elements
      return processTextChunk(chunk.content);
    }
  });
}

/**
 * Process a text chunk for inline markdown elements
 * @param {string} text - Text to process
 * @returns {Array} Array of rich text nodes
 */
function processTextChunk(text) {
  if (!text) return [];
  
  const nodes = [];
  
  // Split text into paragraphs (double line breaks)
  const paragraphs = text.split(/\n\s*\n+/);
  
  // Process each paragraph
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;
    
    let currentText = paragraph;
    
    // Process headers
    currentText = processHeaders(currentText, nodes);
    
    // Process tables (before lists to avoid conflicts)
    currentText = processTables(currentText, nodes);
    
    // Process lists
    currentText = processLists(currentText, nodes);
    
    // Process remaining inline elements
    if (currentText.trim()) {
      // Handle single line breaks within paragraphs
      const lines = currentText.split(/\n/);
      if (lines.length > 1) {
        const lineNodes = [];
        
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j].trim();
          if (!line) continue;
          
          // Add line content
          const inlineNodes = processInlineElements(line);
          lineNodes.push(...inlineNodes);
          
          // Add line break if not the last line
          if (j < lines.length - 1) {
            lineNodes.push({
              name: 'br'
            });
          }
        }
        
        // Wrap in a paragraph if not already in one
        nodes.push({
          name: 'p',
          attrs: {
            style: 'margin: 8px 0;'
          },
          children: lineNodes
        });
      } else {
        // Single line paragraph
        const inlineNodes = processInlineElements(currentText);
        nodes.push({
          name: 'p',
          attrs: {
            style: 'margin: 8px 0;'
          },
          children: inlineNodes
        });
      }
    }
    
    // Add paragraph break if not the last paragraph
    if (i < paragraphs.length - 1) {
      nodes.push({
        name: 'div',
        attrs: {
          style: 'height: 8px;'
        }
      });
    }
  }
  
  return nodes;
}

/**
 * Process markdown headers
 * @param {string} text - Text to process
 * @param {Array} nodes - Nodes array to append to
 * @returns {string} Remaining text
 */
function processHeaders(text, nodes) {
  const headerRegex = /^(#{1,6})\s+(.+?)(?:\n|$)/gm;
  
  let processedText = text;
  let matches = [];
  let match;
  
  // First collect all matches to avoid regex state issues
  while ((match = headerRegex.exec(text)) !== null) {
    matches.push({
      fullMatch: match[0],
      hashes: match[1],
      content: match[2],
      index: match.index
    });
  }
  
  // Sort matches by index in reverse order to safely replace from end to beginning
  matches.sort((a, b) => b.index - a.index);
  
  // Process each header match, starting from the end of the text
  for (const match of matches) {
    const { fullMatch, hashes, content, index } = match;
    const level = hashes.length;
    
    // Add header node
    const fontSize = 28 - (level * 2); // h1 = 22px, h6 = 12px
    nodes.push({
      name: 'div',
      attrs: {
        class: `markdown-h${level}`,
        style: `font-size: ${fontSize}px; font-weight: bold; margin: 16px 0 8px 0; color: #333;`
      },
      children: processInlineElements(content)
    });
    
    // Remove the header from the text to prevent duplication
    processedText = processedText.substring(0, index) + '\n' + processedText.substring(index + fullMatch.length);
  }
  
  // Process remaining text for other elements
  if (processedText.trim()) {
    const remainingNodes = processInlineElements(processedText);
    if (remainingNodes.length > 0) {
      nodes.push(...remainingNodes);
    }
  }
  
  // Return empty string since we've processed all headers and added remaining content to nodes
  return '';
}

/**
 * Process markdown lists
 * @param {string} text - Text to process
 * @param {Array} nodes - Nodes array to append to
 * @returns {string} Remaining text
 */
function processLists(text, nodes) {
  // Find consecutive list items - improved pattern to better match all types of lists
  const listRegex = /^((?:\s*[-*+•✓✔☑]|\s*\d+\.)[ \t]+.+(?:\n|$))+/gm;
  let lastIndex = 0;
  let match;
  
  while ((match = listRegex.exec(text)) !== null) {
    // Add text before list if any
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText.trim()) {
        nodes.push(...processInlineElements(beforeText));
      }
    }
    
    // Process the list items
    const list = {
      name: 'div',
      attrs: {
        class: 'markdown-list',
        style: 'margin: 12px 0; padding-left: 12px;'
      },
      children: []
    };
    
    // Split into list items - improved pattern for better matching
    const listItemRegex = /^[ \t]*([-*+•✓✔☑]|\d+\.)[ \t]+(.+)(?:\n|$)/gm;
    let itemMatch;
    const listContent = match[0];
    
    while ((itemMatch = listItemRegex.exec(listContent)) !== null) {
      const [, bullet, content] = itemMatch;
      const isOrdered = /^\d+\./.test(bullet);
      const isCheckbox = /[✓✔☑]/.test(bullet);
      
      // Handle special bullets
      const bulletText = isOrdered ? bullet : 
                         isCheckbox ? '✅' : 
                         '•'; // Using a larger bullet for visibility
      
      // Process content for checkbox pattern [x] or [X]
      let processedContent = content;
      if (processedContent.match(/^\s*\[(x|X|\s)\]\s*(.*)/)) {
        const checkboxMatch = processedContent.match(/^\s*\[(x|X|\s)\]\s*(.*)/);
        const isChecked = checkboxMatch[1].toLowerCase() === 'x';
        processedContent = checkboxMatch[2];
        
        list.children.push({
          name: 'div',
          attrs: {
            class: 'markdown-list-item',
            style: 'margin: 4px 0 4px 4px; display: flex; align-items: flex-start;'
          },
          children: [
            {
              name: 'span',
              attrs: {
                style: 'margin-right: 8px; font-size: 16px;'
              },
              children: [{
                type: 'text',
                text: isChecked ? '✅' : '⬜'
              }]
            },
            {
              name: 'div',
              attrs: {
                style: 'flex: 1;'
              },
              children: processInlineElements(processedContent)
            }
          ]
        });
      } else {
        // Regular list item
        list.children.push({
          name: 'div',
          attrs: {
            class: 'markdown-list-item',
            style: 'margin: 4px 0 4px 4px; display: flex; align-items: flex-start;'
          },
          children: [
            {
              name: 'span',
              attrs: {
                style: 'margin-right: 8px; min-width: 16px; font-size: 16px; display: inline-block;'
              },
              children: [{
                type: 'text',
                text: bulletText
              }]
            },
            {
              name: 'div',
              attrs: {
                style: 'flex: 1;'
              },
              children: processInlineElements(processedContent)
            }
          ]
        });
      }
    }
    
    nodes.push(list);
    lastIndex = match.index + match[0].length;
  }
  
  // Return remaining text
  return lastIndex > 0 ? text.substring(lastIndex) : text;
}

/**
 * Process markdown tables
 * @param {string} text - Text to process
 * @param {Array} nodes - Nodes array to append to
 * @returns {string} Remaining text
 */
function processTables(text, nodes) {
  // Match markdown tables - requires header row, separator row, and at least one data row
  // | Header 1 | Header 2 |
  // | -------- | -------- |
  // | Cell 1   | Cell 2   |
  const tableRegex = /^\|(.+\|)+\n\|([\s-:|]+\|)+\n(\|(.+\|)+\n)+/gm;
  
  let lastIndex = 0;
  let match;
  
  while ((match = tableRegex.exec(text)) !== null) {
    // Add text before table if any
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText.trim()) {
        nodes.push(...processInlineElements(beforeText));
      }
    }
    
    // Extract the table content
    const tableContent = match[0];
    const tableRows = tableContent.trim().split('\n');
    
    // Create table element
    const table = {
      name: 'div',
      attrs: {
        class: 'markdown-table-container',
        style: 'margin: 12px 0; overflow-x: auto;'
      },
      children: [{
        name: 'table',
        attrs: {
          class: 'markdown-table',
          style: 'width: 100%; border-collapse: collapse; border-spacing: 0;'
        },
        children: []
      }]
    };
    
    // Process header row
    const headerRow = {
      name: 'tr',
      attrs: {
        style: 'background-color: #f8f8f8;'
      },
      children: []
    };
    
    // Extract header cells
    const headerCells = tableRows[0].split('|').filter(cell => cell.trim() !== '');
    for (const cell of headerCells) {
      headerRow.children.push({
        name: 'th',
        attrs: {
          style: 'padding: 8px; border: 1px solid #ddd; text-align: left; font-weight: bold;'
        },
        children: processInlineElements(cell.trim())
      });
    }
    
    // Add header row to table
    table.children[0].children.push(headerRow);
    
    // Process data rows (skip header and separator rows)
    for (let i = 2; i < tableRows.length; i++) {
      const rowContent = tableRows[i];
      if (!rowContent.trim()) continue;
      
      const dataRow = {
        name: 'tr',
        attrs: {
          style: i % 2 === 0 ? 'background-color: #f8f8f8;' : ''
        },
        children: []
      };
      
      // Extract data cells
      const dataCells = rowContent.split('|').filter(cell => cell.trim() !== '');
      for (const cell of dataCells) {
        dataRow.children.push({
          name: 'td',
          attrs: {
            style: 'padding: 8px; border: 1px solid #ddd;'
          },
          children: processInlineElements(cell.trim())
        });
      }
      
      // Add data row to table
      table.children[0].children.push(dataRow);
    }
    
    // Add table to nodes
    nodes.push(table);
    
    lastIndex = match.index + match[0].length;
  }
  
  // Return remaining text
  return lastIndex > 0 ? text.substring(lastIndex) : text;
}



/**
 * Process inline markdown elements (bold, italic, code, links)
 * @param {string} text - Text to process
 * @returns {Array} Array of rich text nodes
 */
function processInlineElements(text) {
  if (!text) return [];
  
  // First, check if there are any inline elements or emojis
  const hasInlineElements = /(`[^`]+`|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|\[.*?\]\(.*?\))/.test(text);
  const hasEmojis = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text);
  
  if (!hasInlineElements && !hasEmojis) {
    // Simple text without special formatting
    return [{ 
      name: 'span',
      children: [{ type: 'text', text }]
    }];
  } else if (!hasInlineElements && hasEmojis) {
    // Just emojis, special handling with a different style
    return [{ 
      name: 'span',
      attrs: {
        style: 'display: inline-block;' // Helps with emoji rendering
      },
      children: [{ type: 'text', text }]
    }];
  }
  
  // Process inline elements
  const segments = [];
  let processedText = text;
  
  // Process inline code first (won't conflict with emphasis)
  processedText = processInlineCode(processedText, segments);
  
  // If there's still text to process, handle emphasis markers
  if (processedText) {
    // Process bold first, then italic (to handle nested emphasis)
    processedText = processBold(processedText, segments);
    processedText = processItalic(processedText, segments);
  }
  
  // Process links last
  if (processedText) {
    processedText = processLinks(processedText, segments);
  }
  
  // Add any remaining text
  if (processedText) {
    segments.push({
      name: 'span',
      children: [{
        type: 'text',
        text: processedText
      }]
    });
  }
  
  return segments;
}

/**
 * Process inline code elements
 * @param {string} text - Text to process
 * @param {Array} segments - Array to add segments to
 * @returns {string} Remaining text
 */
function processInlineCode(text, segments) {
  const inlineCodeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;
  
  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before inline code
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: text.substring(lastIndex, match.index)
      });
    }
    
    // Add inline code
    segments.push({
      name: 'span',
      attrs: {
        style: 'background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;'
      },
      children: [{
        type: 'text',
        text: match[1]
      }]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Return remaining text
  return lastIndex > 0 ? text.substring(lastIndex) : text;
}

/**
 * Process bold text
 * @param {string} text - Text to process
 * @param {Array} segments - Array to add segments to
 * @returns {string} Remaining text
 */
function processBold(text, segments) {
  const boldRegex = /(\*\*|__)(.*?)\1/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: text.substring(lastIndex, match.index)
      });
    }
    
    // Add bold text
    segments.push({
      name: 'span',
      attrs: {
        style: 'font-weight: bold;'
      },
      children: [{
        type: 'text',
        text: match[2]
      }]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Return remaining text
  return lastIndex > 0 ? text.substring(lastIndex) : text;
}

/**
 * Process italic text
 * @param {string} text - Text to process
 * @param {Array} segments - Array to add segments to
 * @returns {string} Remaining text
 */
function processItalic(text, segments) {
  const italicRegex = /(\*|_)(.*?)\1/g;
  let lastIndex = 0;
  let match;
  
  while ((match = italicRegex.exec(text)) !== null) {
    // Add text before italic
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: text.substring(lastIndex, match.index)
      });
    }
    
    // Add italic text
    segments.push({
      name: 'span',
      attrs: {
        style: 'font-style: italic;'
      },
      children: [{
        type: 'text',
        text: match[2]
      }]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Return remaining text
  return lastIndex > 0 ? text.substring(lastIndex) : text;
}

/**
 * Process markdown links
 * @param {string} text - Text to process
 * @param {Array} segments - Array to add segments to
 * @returns {string} Remaining text
 */
function processLinks(text, segments) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before link
    if (match.index > lastIndex) {
      segments.push({
        name: 'span',
        children: [{
          type: 'text',
          text: text.substring(lastIndex, match.index)
        }]
      });
    }
    
    // Add link
    segments.push({
      name: 'span',
      attrs: {
        style: 'color: #0366d6; text-decoration: underline;'
      },
      children: [{
        type: 'text',
        text: match[1]
      }]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Return remaining text
  return lastIndex > 0 ? text.substring(lastIndex) : text;
}

/**
 * Enhanced version that converts markdown to plain text with formatting
 * @param {string} text - Markdown text to parse
 * @returns {string} Formatted text
 */
function parseMarkdown(text) {
  if (!text) return '';
  
  let formattedText = text;
  
  // Replace code blocks with indented text
  formattedText = formattedText.replace(/```(?:\w+\n)?([\s\S]*?)```/g, (match, code) => {
    return `\n【Code】\n${code.trim()}\n【/Code】\n`;
  });
  
  // Replace inline code
  formattedText = formattedText.replace(/`([^`]+)`/g, '【$1】');
  
  // Replace headers
  formattedText = formattedText.replace(/^# (.*$)/gm, '【Large Header】 $1');
  formattedText = formattedText.replace(/^## (.*$)/gm, '【Header】 $1');
  formattedText = formattedText.replace(/^### (.*$)/gm, '【SubHeader】 $1');
  
  // Replace bold
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '【Bold】$1【/Bold】');
  formattedText = formattedText.replace(/__(.*?)__/g, '【Bold】$1【/Bold】');
  
  // Replace italic
  formattedText = formattedText.replace(/\*(.*?)\*/g, '【Italic】$1【/Italic】');
  formattedText = formattedText.replace(/_(.*?)_/g, '【Italic】$1【/Italic】');
  
  // Replace bullet lists
  formattedText = formattedText.replace(/^\s*[-*+]\s+(.*$)/gm, '• $1');
  
  // Replace numbered lists
  formattedText = formattedText.replace(/^\s*(\d+)\.\s+(.*$)/gm, '$1. $2');
  
  // Replace links - keep only the text, discard the URL
  formattedText = formattedText.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  
  // Process checkboxes [x] or [ ]
  formattedText = formattedText.replace(/\[x\]/gi, '✅');
  formattedText = formattedText.replace(/\[ \]/g, '⬜');
  
  return formattedText;
}

// Special handling for check marks (green check marks for WeChat)
function replaceCheckmarks(text) {
  return text
    .replace(/✓/g, '✅') // ✓ to ✅
    .replace(/✔/g, '✅') // ✔ to ✅
    .replace(/☑/g, '✅') // ☑ to ✅
    .replace(/\[x\]/gi, '✅'); // [x] to ✅
}

module.exports = {
  parseMarkdown,
  markdownToNodes
};
