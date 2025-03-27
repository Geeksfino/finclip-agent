/**
 * CxAgent Inspector
 * A modular web interface for inspecting agent configuration
 */

import { Server } from 'bun';
import { ConfigManager } from './utils/config-manager.js';
import { AssetManager } from './utils/asset-manager.js';
import { createServer } from './server.js';

export interface InspectorOptions {
  port?: number;
  brainPath?: string;
}

/**
 * Main Inspector class that orchestrates the different components
 */
export class AgentInspector {
  private server: Server | null = null;
  private config: ConfigManager;
  private assets: AssetManager;
  private port: number;
  
  constructor(options: InspectorOptions = {}) {
    this.port = options.port || 5173;
    this.config = new ConfigManager(options);
    this.assets = new AssetManager();
  }
  
  /**
   * Initialize and start the inspector server
   */
  async start(): Promise<Server> {
    try {
      // Initialize configuration and locate assets
      await this.config.initialize();
      await this.assets.locateAssets();
      
      // Create and start the server
      this.server = createServer({
        port: this.port,
        config: this.config,
        assets: this.assets
      });
      
      console.log(`CxAgent Inspector UI is running at http://localhost:${this.port}`);
      console.log('Press Ctrl+C to stop');
      
      return this.server;
    } catch (error) {
      console.error('Failed to start Agent Inspector:', error);
      process.exit(1);
      return this.server as Server; // Added this line to ensure the function always returns a Server
    }
  }
  
  /**
   * Stop the inspector server
   */
  stop(): void {
    if (this.server) {
      this.server.stop();
      this.server = null;
    }
  }
}

/**
 * Legacy function for backward compatibility with the existing UI module
 */
export async function startUI(options: InspectorOptions = {}): Promise<Server> {
  const inspector = new AgentInspector(options);
  return inspector.start();
}
