// towxml-config.js
const Towxml = require('towxml');

// Initialize towxml
const towxml = new Towxml();

/**
 * Convert markdown text to rich-text nodes
 * @param {string} markdown - Markdown text to convert
 * @returns {Array} Array of rich-text nodes
 */
function markdownToNodes(markdown) {
  if (!markdown) return [];
  
  try {
    // Parse markdown to JSON
    const result = towxml.toJson(markdown, 'markdown', {
      theme: 'light',
      events: {
        tap: (e) => {
          // Handle link taps
          console.log('Tapped element:', e);
        }
      }
    });
    
    // Return the nodes array that can be used with rich-text component
    return result.nodes;
  } catch (error) {
    console.error('Error converting markdown to nodes:', error);
    return [];
  }
}

module.exports = {
  markdownToNodes
};
