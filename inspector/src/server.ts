/**
 * Server module for CxAgent Inspector
 * Handles HTTP requests and serves the inspector UI
 */

import { serve, Server, Serve } from 'bun';
import { ConfigManager } from './utils/config-manager.js';
import { AssetManager } from './utils/asset-manager.js';
import { createInspectorHtml } from './templates/inspector.js';

interface ServerOptions {
  port: number;
  config: ConfigManager;
  assets: AssetManager;
}

/**
 * Create and start the HTTP server for the inspector UI
 */
export function createServer(options: ServerOptions): Server {
  const { port, config, assets } = options;
  const configState = config.getState();
  const assetPaths = assets.getAssets();
  
  // Generate the HTML for the inspector UI
  const inspectorHtml = createInspectorHtml({
    hasStylesheet: !!assetPaths.stylePath,
    hasEmbedScript: !!assetPaths.embedScriptPath
  });
  
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
            content: configState.brainContent,
            isUsingDefaultBrain: configState.isUsingDefaultBrain,
            mcpStatus: configState.mcpStatus
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
      if (path === '/finclip-chat-embed.iife.js' && assetPaths.embedScriptPath) {
        return new Response(Bun.file(assetPaths.embedScriptPath), {
          headers: {
            ...headers,
            'Content-Type': 'application/javascript'
          }
        });
      }
      
      // Serve the style.css file
      if (path === '/style.css' && assetPaths.stylePath) {
        return new Response(Bun.file(assetPaths.stylePath), {
          headers: {
            ...headers,
            'Content-Type': 'text/css'
          }
        });
      }
      
      // Download the embedding script
      if (path === '/download/finclip-chat-embed.iife.js' && assetPaths.embedScriptPath) {
        return new Response(Bun.file(assetPaths.embedScriptPath), {
          headers: {
            ...headers,
            'Content-Type': 'application/javascript',
            'Content-Disposition': 'attachment; filename="finclip-chat-embed.iife.js"'
          }
        });
      }
      
      // Download the style.css file
      if (path === '/download/style.css' && assetPaths.stylePath) {
        return new Response(Bun.file(assetPaths.stylePath), {
          headers: {
            ...headers,
            'Content-Type': 'text/css',
            'Content-Disposition': 'attachment; filename="style.css"'
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
  
  return server;
}
