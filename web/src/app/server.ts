import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { serve } from 'bun';

interface ServerOptions {
  port?: number;
  brainPath?: string;
  distPath?: string;
}

export async function startAgentUI(options: ServerOptions = {}) {
  const port = options.port || 5173;
  const cwd = process.cwd();
  
  // Check for local brain.md or use bundled one
  const localBrainPath = options.brainPath || join(cwd, 'brain.md');
  const bundledBrainPath = join(__dirname, '../../../brain.md'); // Adjust path as needed
  
  const brainPath = existsSync(localBrainPath) ? localBrainPath : bundledBrainPath;
  let brainContent = '';
  
  try {
    brainContent = readFileSync(brainPath, 'utf-8');
    console.log(`Using brain.md from: ${brainPath}`);
  } catch (error) {
    console.warn(`Could not read brain.md from ${brainPath}. Using default configuration.`);
  }
  
  // Determine the path to the web assets
  const distPath = options.distPath || join(__dirname, '../../../web/dist');
  
  console.log(`Starting Agent UI server on http://localhost:${port}`);
  
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
          JSON.stringify({ content: brainContent }), 
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
          return new Response(Bun.file(join(distPath, 'index.html')), { headers });
        }
        
        // Try to serve the requested file
        const filePath = join(distPath, path.replace(/^\//, ''));
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
        return new Response(Bun.file(join(distPath, 'index.html')), { headers });
      } catch (error) {
        console.error(`Error serving file for path ${path}:`, error);
        return new Response('Internal Server Error', { 
          status: 500,
          headers
        });
      }
    }
  });
  
  return server;
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
