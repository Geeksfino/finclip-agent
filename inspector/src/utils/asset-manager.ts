/**
 * Asset Manager for CxAgent Inspector
 * Handles locating and serving static assets
 */

import { join, dirname } from 'path';
import { existsSync, readdirSync } from 'fs';

export interface AssetPaths {
  embedScriptPath: string;
  stylePath: string;
}

/**
 * Manages static assets for the inspector UI
 */
export class AssetManager {
  private assets: AssetPaths = {
    embedScriptPath: '',
    stylePath: ''
  };
  
  /**
   * Locate the embedding script and CSS files
   */
  async locateAssets(): Promise<void> {
    // Debug: Log import.meta.url and derived paths
    console.log(`DEBUG: import.meta.url = ${import.meta.url}`);
    console.log(`DEBUG: dirname(import.meta.url) = ${dirname(import.meta.url)}`);
    console.log(`DEBUG: HOME directory = ${process.env.HOME || ''}`);
    
    // Find the embedding script
    this.assets.embedScriptPath = await this.findEmbedScript();
    if (this.assets.embedScriptPath) {
      console.log(`Found chat embedding script at: ${this.assets.embedScriptPath}`);
    } else {
      console.warn('Chat embedding script not found. Chat functionality will be limited.');
    }
    
    // Find the stylesheet
    this.assets.stylePath = await this.findStylesheet();
    if (this.assets.stylePath) {
      console.log(`Found style file at: ${this.assets.stylePath}`);
    } else {
      console.warn('Style file not found. UI appearance may be affected.');
    }
  }
  
  /**
   * Find the embedding script file
   */
  private async findEmbedScript(): Promise<string> {
    const bunCachePackagePaths = await this.findBunCachePackages();
    
    // Try to find the embedding script in various locations
    const possibleScriptLocations = [
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      join(process.cwd(), 'web', 'dist', 'finclip-chat-embed.iife.js'),
      // Check for bun cache locations
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', '..', '..', 'web', 'dist', 'finclip-chat-embed.iife.js'),
    ];
    
    // Add bun cache paths for the script
    for (const packagePath of bunCachePackagePaths) {
      const scriptPath = join(packagePath, 'web', 'dist', 'finclip-chat-embed.iife.js');
      possibleScriptLocations.push(scriptPath);
    }
    
    // Debug: Log all possible script locations
    console.log('DEBUG: Possible script locations:');
    possibleScriptLocations.forEach((location, index) => {
      console.log(`DEBUG: [${index}] ${location} (exists: ${existsSync(location)})`);
    });
    
    // Find the first existing script file
    for (const location of possibleScriptLocations) {
      if (existsSync(location)) {
        return location;
      }
    }
    
    return '';
  }
  
  /**
   * Find the stylesheet file
   */
  private async findStylesheet(): Promise<string> {
    const bunCachePackagePaths = await this.findBunCachePackages();
    
    // Try to find the style file in various locations
    const possibleStyleLocations = [
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', 'web', 'dist', 'style.css'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', 'web', 'dist', 'style.css'),
      join(process.cwd(), 'web', 'dist', 'style.css'),
      // Check for bun cache locations
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', '..', 'web', 'dist', 'style.css'),
      join(dirname(import.meta.url).replace('file://', ''), '..', '..', '..', '..', '..', '..', 'web', 'dist', 'style.css'),
    ];
    
    // Add bun cache paths for the style
    for (const packagePath of bunCachePackagePaths) {
      const stylePath = join(packagePath, 'web', 'dist', 'style.css');
      possibleStyleLocations.push(stylePath);
    }
    
    // Debug: Log all possible style locations
    console.log('DEBUG: Possible style locations:');
    possibleStyleLocations.forEach((location, index) => {
      console.log(`DEBUG: [${index}] ${location} (exists: ${existsSync(location)})`);
    });
    
    // Find the first existing style file
    for (const location of possibleStyleLocations) {
      if (existsSync(location)) {
        return location;
      }
    }
    
    return '';
  }
  
  /**
   * Find package paths in the Bun cache
   */
  private async findBunCachePackages(): Promise<string[]> {
    const bunCachePackagePaths: string[] = [];
    
    // Try to find the bun cache directory
    const bunCacheDir = join(process.env.HOME || '', '.bun', 'install', 'cache');
    console.log(`DEBUG: Checking if bun cache exists at: ${bunCacheDir} (exists: ${existsSync(bunCacheDir)})`);
    
    if (existsSync(bunCacheDir)) {
      try {
        // Check for @finogeek directory
        const finogeekDir = join(bunCacheDir, '@finogeek');
        if (existsSync(finogeekDir)) {
          // Look for cxagent package directories
          const entries = readdirSync(finogeekDir);
          for (const entry of entries) {
            if (entry.startsWith('cxagent@')) {
              const packagePath = join(finogeekDir, entry);
              console.log(`DEBUG: Found potential package at: ${packagePath}`);
              bunCachePackagePaths.push(packagePath);
            }
          }
        }
      } catch (error) {
        console.log(`DEBUG: Error searching bun cache: ${error}`);
      }
    }
    
    return bunCachePackagePaths;
  }
  
  /**
   * Get the located asset paths
   */
  getAssets(): AssetPaths {
    return this.assets;
  }
}
