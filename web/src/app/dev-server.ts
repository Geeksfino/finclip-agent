/**
 * Development server for the Agent UI
 * This file provides a mock API endpoint for brain.md content during development
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

// Mock API endpoint for brain.md content
export function setupDevServer() {
  // Add a custom Vite plugin to provide the /api/brain endpoint
  return {
    name: 'agent-ui-dev-server',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/brain') {
          // Try to find brain.md in the project root or parent directory
          const possiblePaths = [
            join(process.cwd(), 'brain.md'),
            join(process.cwd(), '../brain.md'),
            join(process.cwd(), '../../brain.md')
          ];
          
          let brainContent = '';
          for (const path of possiblePaths) {
            if (existsSync(path)) {
              try {
                brainContent = readFileSync(path, 'utf-8');
                console.log(`[Dev Server] Using brain.md from: ${path}`);
                break;
              } catch (e) {
                console.error(`[Dev Server] Error reading ${path}:`, e);
              }
            }
          }
          
          // If no brain.md found, use a default content
          if (!brainContent) {
            console.warn('[Dev Server] No brain.md found, using default content');
            brainContent = `---
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
---`;
          }
          
          // Send the brain.md content as JSON
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ content: brainContent }));
        } else {
          next();
        }
      });
    }
  };
}
