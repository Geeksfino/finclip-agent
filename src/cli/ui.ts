/**
 * UI module for CxAgent CLI
 * Provides the --ui option to start a web server for visualizing agent configuration
 */

import { join, dirname } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { serve } from 'bun';

// This will be dynamically imported when the --ui flag is used
async function startUI(options: { port?: number; brainPath?: string } = {}) {
  try {
    const port = options.port || 5173;
    const cwd = process.cwd();
    
    // Check for local brain.md
    const brainPath = options.brainPath || join(cwd, 'brain.md');
    let brainContent = '';
    let isUsingDefaultBrain = false;
    
    if (existsSync(brainPath)) {
      try {
        brainContent = readFileSync(brainPath, 'utf-8');
        console.log(`Using brain.md from: ${brainPath}`);
        isUsingDefaultBrain = false;
      } catch (e) {
        console.error(`Error reading ${brainPath}:`, e);
        isUsingDefaultBrain = true;
      }
    } else {
      console.warn(`No brain.md found at ${brainPath}, will use default from module`);
      isUsingDefaultBrain = true;
    }
    
    // Check for MCP configuration files
    const mcpPreprocPath = join(cwd, 'conf', 'preproc-mcp.json');
    const mcpConfigPath = join(cwd, 'conf', 'mcp_config.json');
    const hasMcpPreproc = existsSync(mcpPreprocPath);
    const hasMcpConfig = existsSync(mcpConfigPath);
    
    if (hasMcpPreproc) {
      console.log(`Found MCP preprocessor config: ${mcpPreprocPath}`);
    }
    
    if (hasMcpConfig) {
      console.log(`Found MCP configuration: ${mcpConfigPath}`);
    }
    
    // Find the embedding script and style files
    let embedScriptPath = '';
    let stylePath = '';
    
    // Debug: Log import.meta.url and derived paths
    console.log(`DEBUG: import.meta.url = ${import.meta.url}`);
    console.log(`DEBUG: dirname(import.meta.url) = ${dirname(import.meta.url)}`);
    console.log(`DEBUG: dirname without file:// = ${dirname(import.meta.url).replace('file://', '')}`);
    console.log(`DEBUG: HOME directory = ${process.env.HOME || ''}`);
    
    // Try to find the bun cache directory
    const bunCacheDir = join(process.env.HOME || '', '.bun', 'install', 'cache');
    console.log(`DEBUG: Checking if bun cache exists at: ${bunCacheDir} (exists: ${existsSync(bunCacheDir)})`);
    
    // Try to find the package in the bun cache
    let bunCachePackagePaths = [];
    if (existsSync(bunCacheDir)) {
      try {
        // Check for @finogeek directory
        const finogeekDir = join(bunCacheDir, '@finogeek');
        if (existsSync(finogeekDir)) {
          // Look for cxagent package directories
          const entries = readdirSync(finogeekDir);
          for (const entry of entries) {
            if (entry.startsWith('cxagent@')) {
              const packagePath = join(finogeekDir, entry);
              console.log(`DEBUG: Found potential package at: ${packagePath}`);
              bunCachePackagePaths.push(packagePath);
            }
          }
        }
      } catch (error) {
        console.log(`DEBUG: Error searching bun cache: ${error}`);
      }
    }
    
    // Try to find the embedding script in various locations
    const possibleScriptLocations = [
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      join(cwd, 'web', 'dist', 'finclip-chat-embed.iife.js'),
      // Check for bun cache locations
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      // We'll add bun cache paths dynamically below
    ];
    
    // Add bun cache paths for the script
    for (const packagePath of bunCachePackagePaths) {
      const scriptPath = join(packagePath, 'web', 'dist', 'finclip-chat-embed.iife.js');
      possibleScriptLocations.push(scriptPath);
    }
    
    // Debug: Log all possible script locations
    console.log('DEBUG: Possible script locations:');
    possibleScriptLocations.forEach((location, index) => {
      console.log(`DEBUG: [${index}] ${location} (exists: ${existsSync(location)})`);
    });
    
    // Try to find the style file in various locations
    const possibleStyleLocations = [
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', 'web', 'dist', 'style.css'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', 'web', 'dist', 'style.css'),
      join(cwd, 'web', 'dist', 'style.css'),
      // Check for bun cache locations
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', 'web', 'dist', 'style.css'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', '..', 'web', 'dist', 'style.css'),
      // We'll add bun cache paths dynamically below
    ];
    
    // Add bun cache paths for the style
    for (const packagePath of bunCachePackagePaths) {
      const stylePath = join(packagePath, 'web', 'dist', 'style.css');
      possibleStyleLocations.push(stylePath);
    }
    
    // Debug: Log all possible style locations
    console.log('DEBUG: Possible style locations:');
    possibleStyleLocations.forEach((location, index) => {
      console.log(`DEBUG: [${index}] ${location} (exists: ${existsSync(location)})`);
    });
    
    // Find the first existing script file
    for (const location of possibleScriptLocations) {
      if (existsSync(location)) {
        embedScriptPath = location;
        console.log(`Found chat embedding script at: ${embedScriptPath}`);
        break;
      }
    }
    
    // Find the first existing style file
    for (const location of possibleStyleLocations) {
      if (existsSync(location)) {
        stylePath = location;
        console.log(`Found style file at: ${stylePath}`);
        break;
      }
    }
    
    if (!embedScriptPath) {
      console.warn('Chat embedding script not found. Chat functionality will be limited.');
    }
    
    if (!stylePath) {
      console.warn('Style file not found. UI appearance may be affected.');
    }
    
    // Create the inspector HTML
  const inspectorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CxAgent Inspector</title>
  ${stylePath ? `<link rel="stylesheet" href="/style.css">` : ''}
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
      .lg\:grid-cols-2 {
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

    <!-- Brain.md content display -->
    <div class="bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-semibold mb-6 text-blue-700">Profile</h2>
      <pre id="brain-content-display" class="bg-gray-100 p-6 rounded whitespace-pre-wrap overflow-x-auto text-gray-700 font-mono text-sm leading-relaxed"></pre>
    </div>
    

  </main>

  <script>
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
  
  ${embedScriptPath ? `
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
    
    console.log(`CxAgent Inspector UI is ready at http://localhost:${port}`);
    
    // Start the server
    const server = serve({
      port,
      fetch(req) {
        const url = new URL(req.url);
        const path = url.pathname;
        
        // Set CORS headers for all responses
        const headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        
        // Handle OPTIONS requests for CORS preflight
        if (req.method === 'OPTIONS') {
          return new Response(null, { headers });
        }
        
        // Serve brain.md content as JSON for the UI to consume
        if (path === '/api/brain') {
          return new Response(
            JSON.stringify({ 
              content: brainContent,
              isUsingDefaultBrain: isUsingDefaultBrain,
              mcpStatus: {
                hasMcpPreproc,
                hasMcpConfig
              }
            }), 
            { 
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              } 
            }
          );
        }
        
        // Serve the embedding script
        if (path === '/finclip-chat-embed.iife.js' && embedScriptPath) {
          return new Response(Bun.file(embedScriptPath), {
            headers: {
              ...headers,
              'Content-Type': 'application/javascript'
            }
          });
        }
        
        // Serve the style.css file
        if (path === '/style.css' && stylePath) {
          return new Response(Bun.file(stylePath), {
            headers: {
              ...headers,
              'Content-Type': 'text/css'
            }
          });
        }
        
        // Serve the inspector HTML for all other paths
        return new Response(inspectorHtml, { 
          headers: {
            ...headers,
            'Content-Type': 'text/html'
          }
        });
      }
    });
    
    console.log(`CxAgent UI is running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop');
    
    return server;
  } catch (error) {
    console.error('Failed to start Agent UI:', error);
    process.exit(1);
  }
}

export { startUI };
