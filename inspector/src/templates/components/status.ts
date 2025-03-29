/**
 * Status components for the inspector UI
 * Contains components for displaying brain.md, MCP, and environment status
 */

import { TemplateOptions } from './index';

export interface StatusOptions extends TemplateOptions {
  brainExists?: boolean;
  mcpExists?: boolean;
  envExists?: boolean;
}

/**
 * Create the status section with all status indicators
 */
export function createStatusSection(options: StatusOptions): string {
  return `<div class="bg-white p-8 rounded-lg shadow mb-8">
    <h2 class="text-2xl font-semibold mb-6 text-blue-700">Status</h2>
    
    <div class="space-y-4">
      ${createBrainStatus(options)}
      ${createQueryProcessorStatus(options)}
      ${createMcpStatus(options)}
      ${createEnvStatus(options)}
    </div>
  </div>`;
}

/**
 * Create the brain.md status indicator
 */
export function createBrainStatus(options: StatusOptions): string {
  return `<div class="flex items-center">
    <div class="mr-2">
      <span id="brain-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </span>
    </div>
    <span id="brain-status" class="text-sm font-medium">Loading...</span>
    <button id="show-sample-brain" class="ml-2 text-xs text-blue-600 hover:text-blue-800 hidden">
      Show Sample
    </button>
  </div>
  <div id="sample-brain-container" class="mt-2 hidden">
    <div class="bg-gray-50 p-3 rounded-md">
      <pre id="sample-brain-content" class="text-xs whitespace-pre-wrap"></pre>
      <button id="copy-sample-brain" class="mt-2 text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700">
        Copy to Clipboard
      </button>
    </div>
  </div>`;
}

/**
 * Create the query processor status indicator
 */
export function createQueryProcessorStatus(options: StatusOptions): string {
  return `<div class="flex items-center">
    <div class="mr-2">
      <span id="query-processor-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </span>
    </div>
    <span id="query-processor-status" class="text-sm font-medium">Loading...</span>
    <button id="show-sample-preproc" class="ml-2 text-xs text-blue-600 hover:text-blue-800 hidden">
      Show Sample
    </button>
  </div>
  <div id="sample-preproc-container" class="mt-2 hidden">
    <div class="bg-gray-50 p-3 rounded-md">
      <pre id="sample-preproc-content" class="text-xs whitespace-pre-wrap"></pre>
      <button id="copy-sample-preproc" class="mt-2 text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700">
        Copy to Clipboard
      </button>
    </div>
  </div>`;
}

/**
 * Create the MCP configuration status indicator
 */
export function createMcpStatus(options: StatusOptions): string {
  return `<div class="flex items-center">
    <div class="mr-2">
      <span id="mcp-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </span>
    </div>
    <span id="mcp-status" class="text-sm font-medium">Loading...</span>
    <button id="show-sample-mcp" class="ml-2 text-xs text-blue-600 hover:text-blue-800 hidden">
      Show Sample
    </button>
  </div>
  <div id="sample-mcp-container" class="mt-2 hidden">
    <div class="bg-gray-50 p-3 rounded-md">
      <pre id="sample-mcp-content" class="text-xs whitespace-pre-wrap"></pre>
      <button id="copy-sample-mcp" class="mt-2 text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700">
        Copy to Clipboard
      </button>
    </div>
  </div>`;
}

/**
 * Create the environment configuration status indicator
 */
export function createEnvStatus(options: StatusOptions): string {
  return `<div class="flex items-center">
    <div class="mr-2">
      <span id="env-status-icon" class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </span>
    </div>
    <span id="env-status" class="text-sm font-medium">Loading...</span>
    <button id="show-sample-env" class="ml-2 text-xs text-blue-600 hover:text-blue-800 hidden">
      Show Sample
    </button>
  </div>
  <div id="sample-env-container" class="mt-2 hidden">
    <div class="bg-gray-50 p-3 rounded-md">
      <pre id="sample-env-content" class="text-xs whitespace-pre-wrap"></pre>
      <button id="copy-sample-env" class="mt-2 text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700">
        Copy to Clipboard
      </button>
    </div>
  </div>
  </div>
  
  <div id="env-warning" class="mt-2 hidden">
    <div class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            No .agent.env file found. The agent will not function properly without it.
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <div id="env-example" class="mt-2 hidden">
    <div class="bg-gray-100 p-4 rounded-md">
      <h3 class="text-sm font-medium mb-2">Example Configuration (.agent.env)</h3>
      <pre id="env-example-content" class="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-xs font-mono leading-relaxed"></pre>
      <div class="mt-2 flex space-x-2">
        <button id="copy-env-example" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" data-copy-button data-copy-target="env-example-content">
          Copy to Clipboard
        </button>
      </div>
    </div>
  </div>`;
}
