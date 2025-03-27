#!/usr/bin/env bun
/**
 * Test script for the CxAgent Inspector
 * This script starts the inspector UI for testing purposes
 */

import { AgentInspector } from './src/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
let port = 5173;
let brainPath = '';

// Process arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--brain' && i + 1 < args.length) {
    brainPath = args[i + 1];
    i++;
  }
}

// Create and start the inspector
async function main() {
  console.log('Starting CxAgent Inspector for testing...');
  
  const inspector = new AgentInspector({
    port,
    brainPath
  });
  
  try {
    await inspector.start();
    console.log(`Inspector started on port ${port}`);
    console.log('Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down inspector...');
      inspector.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start inspector:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
