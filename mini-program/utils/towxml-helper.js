// towxml-helper.js
// A utility wrapper for towxml to handle markdown conversion

/**
 * Convert markdown text to towxml nodes
 * @param {string} markdown - Markdown text to convert
 * @param {string} theme - Theme to use (light or dark)
 * @returns {Object} Towxml parsed object with nodes
 */
function markdownToNodes(markdown, theme = 'light') {
  if (!markdown) return null;
  
  try {
    // Preprocess markdown to ensure tables and line breaks are properly formatted
    const preprocessedMarkdown = preprocessMarkdown(markdown);
    
    // Log the preprocessed markdown for debugging
    console.log('Preprocessed markdown:', preprocessedMarkdown);
    
    // Get the towxml module directly
    const towxml = require('../towxml/index');
    
    // Parse markdown to towxml object
    // The API is: towxml(content, type, options)
    const result = towxml(preprocessedMarkdown, 'markdown', {
      theme: theme,
      events: {
        tap: (e) => {
          console.log('Tap event:', e);
          // Handle link taps if needed
        }
      }
    });
    
    // Post-process the towxml result to fix any layout issues
    postProcessTowxmlResult(result);
    
    return result;
  } catch (error) {
    console.error('Error converting markdown with towxml:', error);
    return null;
  }
}

/**
 * Post-process the towxml result to fix layout issues
 * @param {Object} result - The towxml result object
 */
function postProcessTowxmlResult(result) {
  if (!result || !result.child) return;
  
  // Fix spacing between elements
  fixNodeSpacing(result.child);
}

/**
 * Recursively fix spacing between elements
 * @param {Array} nodes - Array of towxml nodes
 */
function fixNodeSpacing(nodes) {
  if (!Array.isArray(nodes)) return;
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    // Fix text node spacing
    if (node.type === 'text') {
      // Remove excessive spaces
      if (node.text) {
        node.text = node.text.replace(/\s+/g, ' ').trim();
      }
    }
    
    // Ensure proper spacing for inline elements
    if (node.tag === 'span' || node.tag === 'strong' || node.tag === 'em') {
      node.attr = node.attr || {};
      node.attr.style = 'display:inline;';
    }
    
    // Recursively process child nodes
    if (node.child && Array.isArray(node.child)) {
      fixNodeSpacing(node.child);
    }
  }
}

/**
 * Preprocess markdown to ensure tables and line breaks are properly formatted
 * @param {string} markdown - Markdown text to preprocess
 * @returns {string} Preprocessed markdown text
 */
function preprocessMarkdown(markdown) {
  if (!markdown) return '';
  
  console.log('Original markdown before preprocessing:', markdown);
  
  // Only do minimal processing that is required for rendering
  // Normalize line breaks (CR+LF -> LF)
  let processed = markdown.replace(/\r\n/g, '\n');
  
  // Fix emoji display for better compatibility
  processed = processed.replace(/\u2705/g, '\u2713'); // \u2705 -> \u2713
  processed = processed.replace(/\u274c/g, '\u2717'); // \u274c -> \u2717
  
  // Ensure tables have proper separator rows (|---|---| format)
  // This is a minimal fix to ensure table rendering works
  const tableRegex = /^\|(.+)\|\s*$/gm;
  const tableLines = [];
  let match;
  
  while ((match = tableRegex.exec(processed)) !== null) {
    tableLines.push(match.index);
  }
  
  if (tableLines.length > 0) {
    // Group consecutive table lines into tables
    const tables = [];
    let currentTable = [tableLines[0]];
    
    for (let i = 1; i < tableLines.length; i++) {
      // If this line immediately follows the previous table line
      const prevLineEnd = processed.indexOf('\n', tableLines[i-1]);
      if (tableLines[i] === prevLineEnd + 1) {
        currentTable.push(tableLines[i]);
      } else {
        tables.push(currentTable);
        currentTable = [tableLines[i]];
      }
    }
    
    if (currentTable.length > 0) {
      tables.push(currentTable);
    }
    
    // Process each table to ensure proper formatting
    for (const table of tables) {
      if (table.length >= 2) { // Valid table has at least header and separator
        const startPos = table[0];
        const lastLineStart = table[table.length - 1];
        const lastLineEnd = processed.indexOf('\n', lastLineStart);
        const endPos = lastLineEnd === -1 ? processed.length : lastLineEnd;
        const tableContent = processed.substring(startPos, endPos);
        
        // Format the table properly
        const tableLines = tableContent.split('\n');
        
        if (tableLines.length >= 2) {
          const headerLine = tableLines[0];
          const headerCols = headerLine.split('|').filter(col => col.trim() !== '').length;
          
          // Only fix separator row if it's not properly formatted
          const separatorLine = tableLines[1];
          if (!/^\|[-:|\s]+\|$/.test(separatorLine)) {
            const fixedSeparator = '|' + Array(headerCols).fill('---').join('|') + '|';
            tableLines[1] = fixedSeparator;
            
            // Replace the table
            const fixedTable = tableLines.join('\n');
            processed = processed.substring(0, startPos) + fixedTable + processed.substring(endPos);
          }
        }
      }
    }
  }
  
  // Simple fix for code blocks that need three backticks
  processed = processed.replace(/^(\s*)(`{1,2})([^`]+)(`{1,2})$/gm, '$1```$3```');
  
  console.log('Final preprocessed markdown:', processed);
  return processed;
}

// Function removed - no longer needed

module.exports = {
  markdownToNodes
};
