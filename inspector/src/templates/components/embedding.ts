/**
 * Embedding components for the inspector UI
 * Contains components for displaying embedding instructions and download links
 */

import { TemplateOptions } from './index';

export interface EmbeddingOptions extends TemplateOptions {}

/**
 * Create the embedding resources section with download links and instructions
 */
export function createEmbeddingSection(options: EmbeddingOptions): string {
  return `<div class="bg-white p-8 rounded-lg shadow mb-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-blue-700">Embedding Resources</h2>
      <button 
        data-accordion-toggle 
        data-accordion-target="embedding-content" 
        data-accordion-collapsed
        class="flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <span class="mr-1">Toggle</span>
        <svg 
          data-accordion-icon
          class="h-5 w-5 transform transition-transform duration-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    <div id="embedding-content" class="hidden">
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-3 text-gray-700">Download Files</h3>
        <div class="flex flex-wrap gap-3">
          <a href="/download/finclip-chat-embed.iife.js" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Embedding Script
          </a>
          <a href="/download/style.css" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSS
          </a>
        </div>
      </div>
      
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-amber-700 font-medium">CORS Configuration Required</p>
            <p class="text-sm text-amber-700 mt-1">
              When embedding on a different domain, you must configure CORS headers on your agent server:
            </p>
            <pre class="bg-amber-100 p-2 rounded mt-2 text-xs overflow-x-auto">
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type</pre>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-3 text-gray-700">Embedding Instructions</h3>
        <p class="text-gray-600 mb-3">To embed the chat widget on your website, add the following code:</p>
        <div class="bg-gray-800 p-4 rounded-md">
          <pre id="embed-code" class="text-green-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
&lt;!-- Add the stylesheet --&gt;
&lt;link rel="stylesheet" href="path/to/style.css"&gt;

&lt;!-- Add the chat container --&gt;
&lt;div id="finclip-chat-container"
  data-api-url="http://localhost:5678"
  data-streaming-url="http://localhost:5679"
  data-suggestions='["Help me with...", "How do I...", "What is..."]'
  data-placeholder="Ask me anything..."
  data-title="CxAgent Chat"&gt;
&lt;/div&gt;

&lt;!-- Add the embedding script --&gt;
&lt;script src="path/to/finclip-chat-embed.iife.js"&gt;&lt;/script&gt;</pre>
        </div>
        <button 
          class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          data-copy-button
          data-copy-target="embed-code"
        >
          Copy to Clipboard
        </button>
      </div>
      
      <div>
        <h3 class="text-lg font-medium mb-3 text-gray-700">Configuration Options</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-2 px-4 text-sm font-mono">data-api-url</td>
                <td class="py-2 px-4 text-sm">The URL of the agent API server</td>
                <td class="py-2 px-4 text-sm">http://localhost:5678</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm font-mono">data-streaming-url</td>
                <td class="py-2 px-4 text-sm">The URL of the agent streaming server</td>
                <td class="py-2 px-4 text-sm">http://localhost:5679</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm font-mono">data-suggestions</td>
                <td class="py-2 px-4 text-sm">JSON array of suggestion prompts</td>
                <td class="py-2 px-4 text-sm">[]</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm font-mono">data-placeholder</td>
                <td class="py-2 px-4 text-sm">Placeholder text for the input field</td>
                <td class="py-2 px-4 text-sm">Ask me anything...</td>
              </tr>
              <tr>
                <td class="py-2 px-4 text-sm font-mono">data-title</td>
                <td class="py-2 px-4 text-sm">Title displayed in the chat header</td>
                <td class="py-2 px-4 text-sm">CxAgent Chat</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;
}
