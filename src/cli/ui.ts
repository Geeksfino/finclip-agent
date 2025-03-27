/**
 * UI module for CxAgent CLI
 * Provides the --ui option to start a web server for visualizing agent configuration
 */

import { join, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
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
    
    // Determine the path to the web assets
    // First check if we're running from the installed package
    let webDistPath = join(dirname(import.meta.url), '..', '..', 'web', 'dist');
    webDistPath = webDistPath.replace('file://', '');
    
    // If the web/dist directory doesn't exist in the package, try to find it in the repo
    if (!existsSync(webDistPath)) {
      webDistPath = join(dirname(import.meta.url), '..', '..', '..', 'web', 'dist');
      webDistPath = webDistPath.replace('file://', '');
      
      // If still not found, try to use the web directory from the current working directory
      if (!existsSync(webDistPath)) {
        webDistPath = join(cwd, 'web', 'dist');
        
        // If still not found, we can't serve the UI
        if (!existsSync(webDistPath)) {
          console.error('Could not find web/dist directory. Please build the web UI first with "cd web && bun run build"');
          process.exit(1);
        }
      }
    }
    
    console.log(`Using web assets from: ${webDistPath}`);
    
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
        
        // For all other requests, serve the built web assets
        try {
          // Default to index.html for root path
          if (path === '/' || path === '') {
            return new Response(Bun.file(join(webDistPath, 'index.html')), { 
              headers: {
                ...headers,
                'Content-Type': 'text/html'
              }
            });
          }
          
          // Try to serve the requested file
          const filePath = join(webDistPath, path.replace(/^\//, ''));
          if (existsSync(filePath)) {
            // Set appropriate content type based on file extension
            const contentType = getContentType(filePath);
            return new Response(Bun.file(filePath), { 
              headers: {
                ...headers,
                'Content-Type': contentType
              } 
            });
          }
          
          // Fallback to index.html for SPA routing
          return new Response(Bun.file(join(webDistPath, 'index.html')), { 
            headers: {
              ...headers,
              'Content-Type': 'text/html'
            }
          });
        } catch (error) {
          console.error(`Error serving file for path ${path}:`, error);
          return new Response('Internal Server Error', { 
            status: 500,
            headers
          });
        }
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

// Helper function to determine content type based on file extension
function getContentType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    case 'ico': return 'image/x-icon';
    default: return 'application/octet-stream';
  }
}

export { startUI };
