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
    async fetch(req) {
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
        // Check if .agent.env file exists in the current directory
        const envExists = await Bun.file('.agent.env').exists();
        
        return new Response(
          JSON.stringify({ 
            content: configState.brainContent,
            isUsingDefaultBrain: configState.isUsingDefaultBrain,
            mcpStatus: configState.mcpStatus,
            queryProcessorStatus: configState.queryProcessorStatus || 'disabled',
            envExists
          }), 
          { 
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
      
      // Serve sample brain.md file
      if (path === '/api/samples/brain') {
        // Try to load from the repository's conf directory first
        let sampleBrainFile = Bun.file(process.cwd() + '/conf/brain.md');
        
        // If not found in the local repo, try to find it in the node_modules
        if (!(await sampleBrainFile.exists())) {
          // This will work when running via bunx
          try {
            const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/brain.md');
            sampleBrainFile = Bun.file(modulePath);
          } catch (error) {
            console.error('Error resolving brain.md from module:', error);
            // Fallback to looking in node_modules directly
            sampleBrainFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/brain.md');
          }
        }
        
        // Check if the file exists
        if (await sampleBrainFile.exists()) {
          const sampleBrainContent = await sampleBrainFile.text();
          return new Response(
            sampleBrainContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              } 
            }
          );
        } else {
          return new Response(
            'Sample brain.md file not found.',
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              },
              status: 404
            }
          );
        }
      }
      
      // Serve sample .agent.env file
      if (path === '/api/samples/env') {
        // Try to load from the repository's conf directory first
        let sampleEnvFile = Bun.file(process.cwd() + '/conf/agent.env.example');
        
        // If not found in the local repo, try to find it in the node_modules
        if (!(await sampleEnvFile.exists())) {
          // This will work when running via bunx
          try {
            const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/agent.env.example');
            sampleEnvFile = Bun.file(modulePath);
          } catch (error) {
            console.error('Error resolving agent.env.example from module:', error);
            // Fallback to looking in node_modules directly
            sampleEnvFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/agent.env.example');
          }
        }
        
        // Check if the file exists
        if (await sampleEnvFile.exists()) {
          const sampleEnvContent = await sampleEnvFile.text();
          return new Response(
            sampleEnvContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              } 
            }
          );
        } else {
          return new Response(
            'Sample .agent.env file not found.',
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              },
              status: 404
            }
          );
        }
      }
      
      // Serve sample Query Preprocessor config file
      if (path === '/api/samples/preproc') {
        // Try to load from the repository's conf directory first
        let samplePreprocFile = Bun.file(process.cwd() + '/conf/preproc-mcp.example.json');
        
        // If not found in the local repo, try to find it in the node_modules
        if (!(await samplePreprocFile.exists())) {
          // This will work when running via bunx
          try {
            const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/preproc-mcp.example.json');
            samplePreprocFile = Bun.file(modulePath);
          } catch (error) {
            console.error('Error resolving preproc-mcp.example.json from module:', error);
            // Fallback to looking in node_modules directly
            samplePreprocFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/preproc-mcp.example.json');
          }
        }
        
        // Check if the file exists
        if (await samplePreprocFile.exists()) {
          const samplePreprocContent = await samplePreprocFile.text();
          return new Response(
            samplePreprocContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              } 
            }
          );
        } else {
          return new Response(
            'Sample Query Preprocessor config file not found.',
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              },
              status: 404
            }
          );
        }
      }
      
      // Serve sample MCP config file
      if (path === '/api/samples/mcp') {
        // Try to load from the repository's conf directory first
        let sampleMcpFile = Bun.file(process.cwd() + '/conf/mcp_config.example.json');
        
        // If not found in the local repo, try to find it in the node_modules
        if (!(await sampleMcpFile.exists())) {
          // This will work when running via bunx
          try {
            const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/mcp_config.example.json');
            sampleMcpFile = Bun.file(modulePath);
          } catch (error) {
            console.error('Error resolving mcp_config.example.json from module:', error);
            // Fallback to looking in node_modules directly
            sampleMcpFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/mcp_config.example.json');
          }
        }
        
        // Check if the file exists
        if (await sampleMcpFile.exists()) {
          const sampleMcpContent = await sampleMcpFile.text();
          return new Response(
            sampleMcpContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              } 
            }
          );
        } else {
          return new Response(
            'Sample MCP config file not found.',
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              },
              status: 404
            }
          );
        }
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
