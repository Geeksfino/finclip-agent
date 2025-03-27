/**
 * HTML template for the CxAgent Inspector UI
 */

interface TemplateOptions {
  hasStylesheet: boolean;
  hasEmbedScript: boolean;
}

/**
 * Create the HTML for the inspector UI
 */
export function createInspectorHtml(options: TemplateOptions): string {
  const { hasStylesheet, hasEmbedScript } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CxAgent Inspector</title>
  ${hasStylesheet ? `<link rel="stylesheet" href="/style.css">` : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f0f4f8;
      color: #333;
    }
    .min-h-screen {
      min-height: 100vh;
    }
    .bg-gradient-to-b {
      background-image: linear-gradient(to bottom, #f0f9ff, #ffffff);
    }
    header {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1rem 0;
    }
    .max-w-7xl {
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 1rem;
    }
    h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 1rem;
    }
    h3 {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }
    main {
      max-width: 80rem;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .bg-white {
      background-color: white;
    }
    .rounded-lg {
      border-radius: 0.5rem;
    }
    .shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .p-8 {
      padding: 2rem;
    }
    .mb-8 {
      margin-bottom: 2rem;
    }
    .space-y-3 > * + * {
      margin-top: 0.75rem;
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .mr-2 {
      margin-right: 0.5rem;
    }
    .inline-flex {
      display: inline-flex;
    }
    .justify-center {
      justify-content: center;
    }
    .h-6 {
      height: 1.5rem;
    }
    .w-6 {
      width: 1.5rem;
    }
    .rounded-full {
      border-radius: 9999px;
    }
    .bg-green-100 {
      background-color: #dcfce7;
    }
    .bg-gray-100 {
      background-color: #f3f4f6;
    }
    .bg-amber-100 {
      background-color: #fef3c7;
    }
    .text-green-600 {
      color: #16a34a;
    }
    .text-gray-400 {
      color: #9ca3af;
    }
    .text-amber-600 {
      color: #d97706;
    }
    .h-4 {
      height: 1rem;
    }
    .w-4 {
      width: 1rem;
    }
    .text-sm {
      font-size: 0.875rem;
    }
    .font-medium {
      font-weight: 500;
    }
    .grid {
      display: grid;
    }
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .gap-8 {
      gap: 2rem;
    }
    .bg-blue-50 {
      background-color: #eff6ff;
    }
    .bg-green-50 {
      background-color: #f0fdf4;
    }
    .bg-purple-50 {
      background-color: #faf5ff;
    }
    .bg-amber-50 {
      background-color: #fffbeb;
    }
    .p-6 {
      padding: 1.5rem;
    }
    .space-y-2 > * + * {
      margin-top: 0.5rem;
    }
    .w-20 {
      width: 5rem;
    }
    .font-semibold {
      font-weight: 600;
    }
    .text-gray-700 {
      color: #374151;
    }
    .text-xl {
      font-size: 1.25rem;
    }
    .text-blue-700 {
      color: #1d4ed8;
    }
    .text-green-800 {
      color: #166534;
    }
    .text-purple-800 {
      color: #6b21a8;
    }
    .text-amber-800 {
      color: #92400e;
    }
    .mb-3 {
      margin-bottom: 0.75rem;
    }
    .list-disc {
      list-style-type: disc;
    }
    .list-decimal {
      list-style-type: decimal;
    }
    .pl-5 {
      padding-left: 1.25rem;
    }
    .space-y-1 > * + * {
      margin-top: 0.25rem;
    }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-b">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900">Agent Inspector</h1>
    </div>
  </header>
  
  <main class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white p-8 rounded-lg shadow mb-8">
      <div class="space-y-3">
        <!-- Brain.md status -->
        <div class="flex items-center">
          <div class="mr-2">
            <span id="brain-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </div>
          <span id="brain-status" class="text-sm font-medium">Loading...</span>
        </div>
        
        <!-- MCP Preprocessor status -->
        <div class="flex items-center">
          <div class="mr-2">
            <span id="mcp-preproc-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </div>
          <span id="mcp-preproc-status" class="text-sm font-medium">Loading...</span>
        </div>
        
        <!-- MCP Config status -->
        <div class="flex items-center">
          <div class="mr-2">
            <span id="mcp-config-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </div>
          <span id="mcp-config-status" class="text-sm font-medium">Loading...</span>
        </div>
      </div>
    </div>

    <!-- Embedding Files Download -->
    <div class="bg-white p-8 rounded-lg shadow mb-8">
      <button class="flex justify-between items-center w-full" id="embedding-toggle">
        <h2 class="text-2xl font-semibold text-blue-700">Embedding Resources</h2>
        <svg class="w-6 h-6 text-blue-700 transform transition-transform duration-300" id="embedding-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div id="embedding-content" class="mt-6">
        <p class="mb-4">Download these files to embed the chat widget in your website:</p>
        
        <div class="flex flex-col space-y-3 mb-6">
          <a id="download-js-link" href="/download/finclip-chat-embed.iife.js" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download finclip-chat-embed.iife.js
          </a>
          
          <a id="download-css-link" href="/download/style.css" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download style.css
          </a>
        </div>
        
        <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-amber-800">CORS Setup Required</h3>
              <div class="mt-2 text-sm text-amber-700">
                <p>When embedding the chat widget on a different domain, you must configure CORS on your agent server:</p>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>Set <code class="text-xs bg-amber-100 px-1 py-0.5 rounded">Access-Control-Allow-Origin</code> to your website's origin</li>
                  <li>Enable <code class="text-xs bg-amber-100 px-1 py-0.5 rounded">Access-Control-Allow-Credentials: true</code></li>
                  <li>Allow methods: <code class="text-xs bg-amber-100 px-1 py-0.5 rounded">GET, POST, OPTIONS</code></li>
                  <li>Allow headers: <code class="text-xs bg-amber-100 px-1 py-0.5 rounded">Content-Type, Authorization</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-lg font-medium mb-2">Embedding Instructions</h3>
          
          <div class="bg-gray-100 p-4 rounded-md">
            <p class="mb-2">Add this code to your HTML:</p>
            <pre class="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-sm font-mono leading-relaxed">&lt;!-- Include the CSS file --&gt;
&lt;link rel="stylesheet" href="path/to/style.css"&gt;

&lt;!-- Add the chat widget --&gt;
&lt;script 
  src="path/to/finclip-chat-embed.iife.js" 
  data-finclip-chat 
  data-api-url="http://localhost:5678" 
  data-streaming-url="http://localhost:5679"
  data-suggestions="How can I get started?,What features are available?,Tell me about CxAgent"
  data-suggestions-label="Try asking me something 👋"
  data-button-label="Let's chat"&gt;
&lt;/script&gt;</pre>
            <button id="copy-embed-code" class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Brain.md content display -->
    <div class="bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-semibold mb-6 text-blue-700">Agent Profile</h2>
      <pre id="brain-content-display" class="bg-gray-100 p-6 rounded whitespace-pre-wrap overflow-x-auto text-gray-700 font-mono text-sm leading-relaxed"></pre>
    </div>
  </main>

  <script>
    // Accordion toggle functionality
    document.getElementById('embedding-toggle').addEventListener('click', function() {
      const content = document.getElementById('embedding-content');
      const icon = document.getElementById('embedding-icon');
      content.classList.toggle('hidden');
      icon.classList.toggle('rotate-180');
    });
    
    // Initially hide the embedding content
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('embedding-content').classList.add('hidden');
    });
    
    // Copy to clipboard functionality for embedding code
    document.getElementById('copy-embed-code').addEventListener('click', function() {
      const code = document.querySelector('.bg-gray-100 pre').textContent;
      navigator.clipboard.writeText(code).then(() => {
        this.textContent = 'Copied!';
        setTimeout(() => {
          this.textContent = 'Copy to Clipboard';
        }, 2000);
      });
    });
    
    // Check if embedding files are available
    const hasEmbedScript = ${!!options.hasEmbedScript};
    const hasStylesheet = ${!!options.hasStylesheet};
    
    if (!hasEmbedScript) {
      const downloadJsLink = document.getElementById('download-js-link');
      downloadJsLink.classList.add('opacity-50', 'cursor-not-allowed');
      downloadJsLink.classList.remove('hover:bg-blue-700');
      downloadJsLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Embedding script not found. Please make sure the web/dist directory is available.');
      });
    }
    
    if (!hasStylesheet) {
      const downloadCssLink = document.getElementById('download-css-link');
      downloadCssLink.classList.add('opacity-50', 'cursor-not-allowed');
      downloadCssLink.classList.remove('hover:bg-blue-700');
      downloadCssLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Style file not found. Please make sure the web/dist directory is available.');
      });
    }
    
    // Fetch agent configuration status
    fetch('/api/brain')
      .then(response => response.json())
      .then(data => {
        // Update brain status
        const brainStatus = document.getElementById('brain-status');
        const brainStatusIcon = document.getElementById('brain-status-icon');
        
        if (data.isUsingDefaultBrain) {
          brainStatus.textContent = 'No brain.md found in current directory. Using default from module.';
          brainStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100';
          brainStatusIcon.innerHTML = '<svg class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
        } else {
          brainStatus.textContent = 'Using brain.md from current working directory.';
          brainStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
          brainStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
        }
        
        // Display brain content
        const brainContentDisplay = document.getElementById('brain-content-display');
        brainContentDisplay.textContent = data.content;
        
        // Update MCP status
        if (data.mcpStatus) {
          const mcpPreprocStatus = document.getElementById('mcp-preproc-status');
          const mcpPreprocStatusIcon = document.getElementById('mcp-preproc-status-icon');
          
          if (data.mcpStatus.hasMcpPreproc) {
            mcpPreprocStatus.textContent = 'Query Preprocessor configured (conf/preproc-mcp.json)';
            mcpPreprocStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
            mcpPreprocStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
          } else {
            mcpPreprocStatus.textContent = 'No Query Preprocessor in use';
            mcpPreprocStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100';
            mcpPreprocStatusIcon.innerHTML = '<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
          }
          
          const mcpConfigStatus = document.getElementById('mcp-config-status');
          const mcpConfigStatusIcon = document.getElementById('mcp-config-status-icon');
          
          if (data.mcpStatus.hasMcpConfig) {
            mcpConfigStatus.textContent = 'MCP Configuration found (conf/mcp_config.json)';
            mcpConfigStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
            mcpConfigStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
          } else {
            mcpConfigStatus.textContent = 'No MCP Servers in use';
            mcpConfigStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100';
            mcpConfigStatusIcon.innerHTML = '<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
          }
        }
      })
      .catch(err => {
        console.error('Error fetching brain status:', err);
        document.getElementById('brain-status').textContent = 'Error loading status';
      });
  </script>
  
  ${hasEmbedScript ? `
  <!-- Embed the chat widget directly -->
  <script 
    src="/finclip-chat-embed.iife.js" 
    data-finclip-chat 
    data-api-url="http://localhost:5678" 
    data-streaming-url="http://localhost:5679"
    data-suggestions="How can you help me today?,What topics can we discuss?,Tell me a joke,What's the weather like?"
    data-suggestions-label="Try asking me something 👋"
    data-button-label="Let's chat">
  </script>
  ` : ''}
</body>
</html>`;
}
