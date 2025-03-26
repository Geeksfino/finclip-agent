import { serve } from "bun";
import { join } from "path";
import { statSync, existsSync, readdirSync } from "fs";

const PORT = parseInt(process.argv[2] || "3001");
const DIRECTORY = process.argv[3] || "./dist";

console.log(`Starting server on port ${PORT} serving ${DIRECTORY}`);

function serveFile(path: string) {
  if (existsSync(path)) {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      const indexPath = join(path, "index.html");
      if (existsSync(indexPath)) {
        return new Response(Bun.file(indexPath));
      }
      // List directory contents
      const files = readdirSync(path);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Directory listing for ${path}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 5px 0; }
            a { text-decoration: none; color: #2563eb; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>Directory listing for ${path}</h1>
          <ul>
            ${files.map(file => `<li><a href="${file}">${file}</a></li>`).join('\n')}
          </ul>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }
    return new Response(Bun.file(path));
  }
  return new Response("Not found", { status: 404 });
}

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Remove leading slash and normalize
    path = path.replace(/^\/+/, "");
    
    // Default to index.html for root
    if (path === "") {
      path = "index.html";
    }
    
    const fullPath = join(DIRECTORY, path);
    
    // Set CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 204,
        headers
      });
    }
    
    const response = serveFile(fullPath);
    
    // Add CORS headers to the response
    const newHeaders = new Headers(response.headers);
    Object.entries(headers).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
});
