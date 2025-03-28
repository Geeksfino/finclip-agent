/**
 * Server module for CxAgent Inspector
 * Handles HTTP requests and serves the inspector UI
 */

import { serve, Server, Serve } from 'bun';
import { ConfigManager } from './utils/config-manager.js';
import { AssetManager } from './utils/asset-manager.js';
import { createInspectorHtml } from './templates/inspector.js';
import { logger, LogLevel } from './utils/logger.js';

interface ServerOptions {
  port: number;
  config: ConfigManager;
  assets: AssetManager;
  logLevel?: string;
}

/**
 * Create and start the HTTP server for the inspector UI
 */
export function createServer(options: ServerOptions): Server {
  const { port, config, assets, logLevel = 'info' } = options;
  
  // Set the log level
  logger.setLevel(logLevel);
  
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
        
        // If not found in the local repo, try to find it in the package directory
        if (!(await sampleBrainFile.exists())) {
          // Try to find it relative to the current script location
          const packagePath = import.meta.url.replace('file://', '').replace('/inspector/src/server.ts', '');
          const packageConfPath = packagePath + '/conf/brain.md';
          
          logger.debug(`Looking for brain.md at: ${packageConfPath}`);
          sampleBrainFile = Bun.file(packageConfPath);
          
          // If still not found, try node_modules
          if (!(await sampleBrainFile.exists())) {
            try {
              const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/brain.md');
              sampleBrainFile = Bun.file(modulePath);
            } catch (error) {
              logger.debug(`Error resolving brain.md from module: ${error}`);
              // Fallback to looking in node_modules directly
              sampleBrainFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/brain.md');
            }
          }
        }
        
        // Default brain.md content if sample file isn't found
        const defaultBrainContent = `# CxAgent Brain

## Instructions

You are CxAgent, a helpful AI assistant. Your goal is to assist users with their tasks and questions.

## Capabilities

- Answer questions about a wide range of topics
- Provide helpful and accurate information
- Maintain a friendly and professional tone
- Admit when you don't know something

## Limitations

- You cannot access the internet directly
- You cannot run code or execute commands
- You cannot access files on the user's computer
- Your knowledge has a cutoff date

## Preferences

- Be concise but thorough
- Use simple language when possible
- Provide examples when helpful
- Format responses in a readable way`;

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
          // Return default content instead of 404
          logger.debug('Sample brain.md file not found, using default content');
          return new Response(
            defaultBrainContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              }
            }
          );
        }
      }
      
      // Serve sample .agent.env file
      if (path === '/api/samples/env') {
        // Try to load from the repository's conf directory first
        let sampleEnvFile = Bun.file(process.cwd() + '/conf/agent.env.example');
        
        // If not found in the local repo, try to find it in the package directory
        if (!(await sampleEnvFile.exists())) {
          // Try to find it relative to the current script location
          const packagePath = import.meta.url.replace('file://', '').replace('/inspector/src/server.ts', '');
          const packageConfPath = packagePath + '/conf/agent.env.example';
          
          logger.debug(`Looking for agent.env.example at: ${packageConfPath}`);
          sampleEnvFile = Bun.file(packageConfPath);
          
          // If still not found, try node_modules
          if (!(await sampleEnvFile.exists())) {
            try {
              const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/agent.env.example');
              sampleEnvFile = Bun.file(modulePath);
            } catch (error) {
              logger.debug(`Error resolving agent.env.example from module: ${error}`);
              // Fallback to looking in node_modules directly
              sampleEnvFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/agent.env.example');
            }
          }
        }
        
        // Default .agent.env content if sample file isn't found
        const defaultEnvContent = `# LLM Configuration
LLM_PROVIDER_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
LLM_API_KEY=your_api_key_here
LLM_STREAM_MODE=true

# Agent Communication Configuration
AGENT_HOST=localhost
AGENT_HTTP_PORT=5678
AGENT_STREAM_PORT=5679
AGENT_ENABLE_STREAMING=true`;

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
          // Return default content instead of 404
          logger.debug('Sample .agent.env file not found, using default content');
          return new Response(
            defaultEnvContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'text/plain'
              }
            }
          );
        }
      }
      
      // Serve sample Query Preprocessor config file
      if (path === '/api/samples/preproc') {
        // Try to load from the repository's conf directory first
        let samplePreprocFile = Bun.file(process.cwd() + '/conf/preproc-mcp.example.json');
        
        // If not found in the local repo, try to find it in the package directory
        if (!(await samplePreprocFile.exists())) {
          // Try to find it relative to the current script location
          const packagePath = import.meta.url.replace('file://', '').replace('/inspector/src/server.ts', '');
          const packageConfPath = packagePath + '/conf/preproc-mcp.example.json';
          
          logger.debug(`Looking for preproc-mcp.example.json at: ${packageConfPath}`);
          samplePreprocFile = Bun.file(packageConfPath);
          
          // If still not found, try node_modules
          if (!(await samplePreprocFile.exists())) {
            try {
              const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/preproc-mcp.example.json');
              samplePreprocFile = Bun.file(modulePath);
            } catch (error) {
              logger.debug(`Error resolving preproc-mcp.example.json from module: ${error}`);
              // Fallback to looking in node_modules directly
              samplePreprocFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/preproc-mcp.example.json');
            }
          }
        }
        
        // Default Query Preprocessor config content if sample file isn't found
        const defaultPreprocContent = `{
  "enabled": true,
  "preprocessor": "retrieve_context",
  "config": {
    "url": "http://localhost:8000",
    "maxResults": 5,
    "minScore": 0.7,
    "includeMetadata": true
  }
}`;

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
          // Return default content instead of 404
          logger.debug('Sample Query Preprocessor config file not found, using default content');
          return new Response(
            defaultPreprocContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      // Serve sample MCP config file
      if (path === '/api/samples/mcp') {
        // Try to load from the repository's conf directory first
        let sampleMcpFile = Bun.file(process.cwd() + '/conf/mcp_config.example.json');
        
        // If not found in the local repo, try to find it in the package directory
        if (!(await sampleMcpFile.exists())) {
          // Try to find it relative to the current script location
          const packagePath = import.meta.url.replace('file://', '').replace('/inspector/src/server.ts', '');
          const packageConfPath = packagePath + '/conf/mcp_config.example.json';
          
          logger.debug(`Looking for mcp_config.example.json at: ${packageConfPath}`);
          sampleMcpFile = Bun.file(packageConfPath);
          
          // If still not found, try node_modules
          if (!(await sampleMcpFile.exists())) {
            try {
              const modulePath = await import.meta.resolve('@finogeek/cxagent/conf/mcp_config.example.json');
              sampleMcpFile = Bun.file(modulePath);
            } catch (error) {
              logger.debug(`Error resolving mcp_config.example.json from module: ${error}`);
              // Fallback to looking in node_modules directly
              sampleMcpFile = Bun.file(process.cwd() + '/node_modules/@finogeek/cxagent/conf/mcp_config.example.json');
            }
          }
        }
        
        // Default MCP config content if sample file isn't found
        const defaultMcpContent = `{
  "enabled": true,
  "servers": [
    {
      "name": "RAG Server",
      "url": "http://localhost:8000",
      "type": "rag",
      "description": "Retrieval Augmented Generation server for knowledge base access"
    },
    {
      "name": "Tool Server",
      "url": "http://localhost:8001",
      "type": "tools",
      "description": "Server providing additional tools and capabilities"
    }
  ]
}`;

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
          // Return default content instead of 404
          logger.debug('Sample MCP config file not found, using default content');
          return new Response(
            defaultMcpContent,
            { 
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              }
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
