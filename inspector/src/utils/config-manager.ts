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
      
      // Try to load default brain.md from the package directory
      try {
        // Try to find it relative to the current script location
        const packagePath = import.meta.url.replace('file://', '').replace('/inspector/src/utils/config-manager.ts', '');
        const defaultBrainPath = join(packagePath, 'brain.md');
        
        if (existsSync(defaultBrainPath)) {
          this.state.brainContent = readFileSync(defaultBrainPath, 'utf-8');
          console.log(`Using default brain.md from: ${defaultBrainPath}`);
        } else {
          // If not found in package path, try the module path
          const moduleBrainPath = join(__dirname, '..', '..', '..', '..', 'brain.md');
          if (existsSync(moduleBrainPath)) {
            this.state.brainContent = readFileSync(moduleBrainPath, 'utf-8');
            console.log(`Using default brain.md from: ${moduleBrainPath}`);
          } else {
            // If still not found, show a message about the missing brain.md
            this.state.brainContent = '# Default CxAgent Configuration\n\nNo brain.md file was found. Please create one to customize the agent\'s behavior.';
          }
        }
      } catch (e) {
        console.error('Error loading default brain.md:', e);
        // Fallback to a simple default content
        this.state.brainContent = '# Default CxAgent Configuration\n\nError loading brain.md file. Please check the console for more information.';
      }
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
