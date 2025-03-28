/**
 * Bridge module for integrating the inspector with the CxAgent CLI
 * This module provides a compatible API for the existing UI implementation
 */

import { startUI as startInspector } from './src/index.js';

/**
 * Start the inspector UI with the given options
 * This function has the same signature as the original startUI function
 * in src/cli/ui.ts for easy integration
 */
export async function startUI(options: { port?: number; brainPath?: string; logLevel?: string } = {}) {
  return startInspector(options);
}
