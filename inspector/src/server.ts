/**
 * Server module for CxAgent Inspector
 * Handles HTTP requests and serves the inspector UI
 */

import { serve, Server, Serve } from 'bun';
import { join } from 'path';
import { ConfigManager } from './utils/config-manager.js';
import { AssetManager } from './utils/asset-manager.js';
import { createInspectorHtml } from './templates/inspector.js';
import { logger, LogLevel } from './utils/logger.js';
// We'll use the local logger, not the actgent one

/**
 * Utility function to find sample files in various locations
 * @param fileName The name of the file to find
 * @param logger The logger instance
 * @returns An object containing the file and whether it exists
 */
async function findSampleFile(fileName: string, logger: any): Promise<{ file: any, exists: boolean }> {
  // Try these locations in order:
  const possiblePaths = [
    // 1. Current working directory conf
    join(process.cwd(), 'conf', fileName),
    // 2. Current working directory dist/conf
    join(process.cwd(), 'dist/conf', fileName),
    // 3. Package directory relative to script
    join(import.meta.url.replace('file://', '').replace('/inspector/src/server.ts', ''), 'conf', fileName),
    // 4. Package dist directory relative to script
    join(import.meta.url.replace('file://', '').replace('/inspector/src/server.ts', ''), 'dist/conf', fileName),
    // 5. Node modules package
    join(process.cwd(), 'node_modules/@finogeek/cxagent/dist/conf', fileName),
    // 6. Bun cache (for global installs)
    join(process.env.HOME || '', '.bun/install/cache/@finogeek/cxagent@' + (process.env.npm_package_version || '') + '@@@1/dist/conf', fileName)
  ];
  
  // Try each path in order
  for (const possiblePath of possiblePaths) {
    logger.debug(`Looking for ${fileName} at: ${possiblePath}`);
    const file = Bun.file(possiblePath);
    if (await file.exists()) {
      logger.debug(`Found ${fileName} at: ${possiblePath}`);
      return { file, exists: true };
    }
  }
  
  // Return the last attempted file (which doesn't exist)
  logger.debug(`${fileName} not found in any location, will use default content`);
  return { file: Bun.file(possiblePaths[0]), exists: false };
}

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
        const { file: sampleBrainFile, exists: brainFileExists } = await findSampleFile('brain.md', logger);
        
        // Default brain.md content if sample file isn't found
        const defaultBrainContent = `
---
name: "Chatbot"
role: >-
  Friendly conversation partner
goal: >-
  Engage in natural, open-ended dialogue about any topic the user chooses

capabilities: >-
  - Fluid conversational skills across all subjects
  - Basic emotional understanding and empathetic responses
  - Light humor when appropriate
  - Adaptive communication style

  guidelines:
  1. Initiate and maintain natural dialogue flow
  2. Show interest in user's messages through engaged responses
  3. Avoid technical/domain-specific discussions unless prompted
  4. Never decline any conversation topic
  5. Keep responses concise (1-3 sentences typically)
  6. Use casual but grammatically correct language

  Example interaction:
  User: "The weather's terrible today"
  ChatAgent: "Oh I know! This rain just won't quit. Perfect day for staying in with a book though - what are you up to today?"
---
`;

        // Check if the file exists
        if (brainFileExists) {
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
        const { file: sampleEnvFile, exists: envFileExists } = await findSampleFile('agent.env.example', logger);
        
        // Default .agent.env content if sample file isn't found
        const defaultEnvContent = `# LLM Configuration
LLM_API_KEY=your_api_key_here
LLM_PROVIDER_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4
LLM_STREAM_MODE=true

# Agent Server Configuration
AGENT_HOST=localhost
AGENT_HTTP_PORT=5678
AGENT_STREAM_PORT=5679
AGENT_ENABLE_STREAMING=true

# Database Configuration
DB_PROVIDER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false`;
        
        // Check if the file exists
        if (envFileExists) {
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
        const { file: samplePreprocFile, exists: preprocFileExists } = await findSampleFile('preproc-mcp.example.json', logger);
        
        // Default Query Preprocessor config content if sample file isn't found
        const defaultPreprocContent = `{
  "mcpServers": {
    "some-rag-server": {
      "command": "/path/to/kb-mcp-server",
      "args": [
        "/path/to/some-knowledgebase/some-data",
        "--some-param",
        "some-value"
      ],
      "cwd": "/path/to/working/directory"
    }
  }
}`;
        
        // Check if the file exists
        if (preprocFileExists) {
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
        const { file: sampleMcpFile, exists: mcpFileExists } = await findSampleFile('mcp_config.example.json', logger);
        
        // Default MCP config content if sample file isn't found
        const defaultMcpContent = `{
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "/path/to/Desktop",
          "/path/to/Downloads"
        ]
      },
      "echo-server": {
        "command": "/path/to/venv/bin/python",
        "args": [
          "/path/to/embedding-mcp-server/test/echo-mcp/simple_echo.py"
        ],
        "cwd": "/path/to/embedding-mcp-server"
      }
    }
  }`;
        
        // Check if the file exists
        if (mcpFileExists) {
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
