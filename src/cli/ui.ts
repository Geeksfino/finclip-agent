/**
 * UI module for CxAgent CLI
 * Provides the --ui option to start a web server for visualizing agent configuration
 */

import { join } from 'path';
import { existsSync } from 'fs';

// This will be dynamically imported when the --ui flag is used
async function startUI(options: { port?: number; brainPath?: string } = {}) {
  try {
    // Get the path to the web/dist directory relative to this file
    const distPath = join(__dirname, '../../web/dist');
    
    // Check if the built assets exist
    const indexHtmlPath = join(distPath, 'index.html');
    if (!existsSync(indexHtmlPath)) {
      console.error('Error: Agent UI assets not found. Please build the web assets first:');
      console.error('cd web && bun run build');
      process.exit(1);
    }
    
    // Dynamically import the server module from web/src/app
    const { startAgentUI } = await import('../../web/src/app/server');
    
    // Start the UI server
    const server = await startAgentUI({
      port: options.port || 5173,
      brainPath: options.brainPath,
      distPath
    });
    
    console.log(`CxAgent UI is running at http://localhost:${options.port || 5173}`);
    console.log('Press Ctrl+C to stop');
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down CxAgent UI...');
      server.stop();
      process.exit(0);
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start Agent UI:', error);
    process.exit(1);
  }
}

export { startUI };
