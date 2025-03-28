/**
 * Configuration Manager for CxAgent Inspector
 * Handles loading and checking configuration files
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export interface ConfigOptions {
  brainPath?: string;
}

export interface ConfigState {
  brainContent: string;
  isUsingDefaultBrain: boolean;
  mcpStatus: 'enabled' | 'disabled';
  queryProcessorStatus: 'enabled' | 'disabled';
}

/**
 * Manages configuration files for the inspector
 */
export class ConfigManager {
  private options: ConfigOptions;
  private state: ConfigState = {
    brainContent: '',
    isUsingDefaultBrain: true,
    mcpStatus: 'disabled',
    queryProcessorStatus: 'disabled'
  };
  
  constructor(options: ConfigOptions = {}) {
    this.options = options;
  }
  
  /**
   * Initialize the configuration manager
   * Checks for brain.md and MCP configuration files
   */
  async initialize(): Promise<void> {
    const cwd = process.cwd();
    
    // Check for local brain.md
    const brainPath = this.options.brainPath || join(cwd, 'brain.md');
    
    if (existsSync(brainPath)) {
      try {
        this.state.brainContent = readFileSync(brainPath, 'utf-8');
        console.log(`Using brain.md from: ${brainPath}`);
        this.state.isUsingDefaultBrain = false;
      } catch (e) {
        console.error(`Error reading ${brainPath}:`, e);
        this.state.isUsingDefaultBrain = true;
      }
    } else {
      console.warn(`No brain.md found at ${brainPath}, will use default from module`);
      this.state.isUsingDefaultBrain = true;
      
      // TODO: Load default brain.md from module if available
      this.state.brainContent = '# Default Agent Configuration\n\nNo brain.md file found in the current directory.';
    }
    
    // Check for MCP configuration files
    const mcpPreprocPath = join(cwd, 'conf', 'preproc-mcp.json');
    const mcpConfigPath = join(cwd, 'conf', 'mcp_config.json');
    
    const hasMcpPreproc = existsSync(mcpPreprocPath);
    const hasMcpConfig = existsSync(mcpConfigPath);
    
    // Update MCP status
    this.state.mcpStatus = (hasMcpPreproc || hasMcpConfig) ? 'enabled' : 'disabled';
    
    // Update Query Preprocessor status
    this.state.queryProcessorStatus = hasMcpPreproc ? 'enabled' : 'disabled';
    
    if (hasMcpPreproc) {
      console.log(`Found MCP preprocessor config: ${mcpPreprocPath}`);
    }
    
    if (hasMcpConfig) {
      console.log(`Found MCP configuration: ${mcpConfigPath}`);
    }
  }
  
  /**
   * Get the current configuration state
   */
  getState(): ConfigState {
    return this.state;
  }
}
