/**
 * Layout components for the inspector UI
 * Contains the basic HTML structure, head, and script sections
 */

import { TemplateOptions } from './index';

export interface LayoutOptions extends TemplateOptions {
  content: string;
}

/**
 * Create the HTML document structure
 */
export function createHtmlDocument(options: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
${createHead(options)}
<body class="min-h-screen bg-gradient-to-b">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <h1 class="text-3xl font-bold text-gray-900">Agent Inspector</h1>
    </div>
  </header>
  
  <main class="max-w-7xl mx-auto px-4 py-8">
    ${options.content}
  </main>

${createScripts(options)}
</body>
</html>`;
}

/**
 * Create the head section with meta tags and styles
 */
function createHead(options: LayoutOptions): string {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent Inspector</title>
  ${options.hasStylesheet ? `<link rel="stylesheet" href="/style.css">` : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f0f4f8;
      color: #333;
    }
    .min-h-screen {
      min-height: 100vh;
    }
    .bg-gradient-to-b {
      background-image: linear-gradient(to bottom, #f0f4f8, #e2e8f0);
    }
    .max-w-7xl {
      max-width: 80rem;
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .py-4 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    .py-8 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    .bg-white {
      background-color: #fff;
    }
    .shadow-sm {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .text-3xl {
      font-size: 1.875rem;
    }
    .font-bold {
      font-weight: 700;
    }
    .text-gray-900 {
      color: #1a202c;
    }
    .rounded-lg {
      border-radius: 0.5rem;
    }
    .mb-8 {
      margin-bottom: 2rem;
    }
    .p-8 {
      padding: 2rem;
    }
    .text-2xl {
      font-size: 1.5rem;
    }
    .font-semibold {
      font-weight: 600;
    }
    .mb-6 {
      margin-bottom: 1.5rem;
    }
    .text-blue-700 {
      color: #2b6cb0;
    }
    .hidden {
      display: none;
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .justify-between {
      justify-content: space-between;
    }
    .w-full {
      width: 100%;
    }
    .transform {
      transform: translateZ(0);
    }
    .transition-transform {
      transition-property: transform;
    }
    .duration-300 {
      transition-duration: 300ms;
    }
    .rotate-180 {
      transform: rotate(180deg);
    }
  </style>
</head>`;
}

/**
 * Create the script section with all client-side JavaScript
 */
function createScripts(options: LayoutOptions): string {
  return `  <script>
    // Accordion toggle functionality
    window.onload = function() {
      console.log('Window loaded');
      // Set up accordion toggles
      document.querySelectorAll('[data-accordion-toggle]').forEach(toggle => {
        const targetId = toggle.getAttribute('data-accordion-target');
        const target = document.getElementById(targetId);
        const icon = toggle.querySelector('[data-accordion-icon]');
        
        if (target) {
          // Initially hide content if specified
          if (toggle.hasAttribute('data-accordion-collapsed')) {
            target.classList.add('hidden');
          }
          
          toggle.addEventListener('click', function() {
            target.classList.toggle('hidden');
            if (icon) {
              icon.classList.toggle('rotate-180');
            }
          });
        }
      });
      
      // Copy to clipboard functionality
      document.querySelectorAll('[data-copy-button]').forEach(button => {
        const targetId = button.getAttribute('data-copy-target');
        const target = document.getElementById(targetId);
        
        if (target) {
          button.addEventListener('click', function() {
            const text = target.textContent;
            navigator.clipboard.writeText(text).then(() => {
              const originalText = button.textContent;
              button.textContent = 'Copied!';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
            });
          });
        }
      });
      
      // Fetch agent configuration status
      console.log('Fetching agent configuration...');
      fetch('/api/brain')
        .then(response => response.json())
        .then(data => {
          console.log('API data received:', data);
          // Update brain status
          const brainStatus = document.getElementById('brain-status');
          const brainStatusIcon = document.getElementById('brain-status-icon');
          const brainContentDisplay = document.getElementById('brain-content-display');
          
          if (brainStatus && brainStatusIcon) {
            if (!data.isUsingDefaultBrain) {
              brainStatus.textContent = 'Using brain.md from current working directory.';
              brainStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
              brainStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
              // Hide the sample button when brain.md exists
              const showSampleBrainButton = document.getElementById('show-sample-brain');
              if (showSampleBrainButton) {
                showSampleBrainButton.classList.add('hidden');
              }
            } else {
              brainStatus.textContent = 'This agent does not have its own brain. Please add one.';
              brainStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100';
              brainStatusIcon.innerHTML = '<svg class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
              // Show the sample button when no brain.md exists
              const showSampleBrainButton = document.getElementById('show-sample-brain');
              if (showSampleBrainButton) {
                showSampleBrainButton.classList.remove('hidden');
              }
            }
            
            // Display brain content
            if (brainContentDisplay && data.content) {
              brainContentDisplay.textContent = data.content;
            }
            
            // Update Query Processor status
            const queryProcessorStatus = document.getElementById('query-processor-status');
            const queryProcessorStatusIcon = document.getElementById('query-processor-status-icon');
            
            if (queryProcessorStatus && queryProcessorStatusIcon) {
              if (data.queryProcessorStatus === 'enabled') {
                queryProcessorStatus.textContent = 'Query Preprocessor in use';
                queryProcessorStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
                queryProcessorStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                // Hide the sample button when Query Preprocessor is enabled
                const showSamplePreprocButton = document.getElementById('show-sample-preproc');
                if (showSamplePreprocButton) {
                  showSamplePreprocButton.classList.add('hidden');
                }
              } else {
                queryProcessorStatus.textContent = 'No Query Preprocessor in use';
                queryProcessorStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100';
                queryProcessorStatusIcon.innerHTML = '<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
                // Show the sample button when Query Preprocessor is not enabled
                const showSamplePreprocButton = document.getElementById('show-sample-preproc');
                if (showSamplePreprocButton) {
                  showSamplePreprocButton.classList.remove('hidden');
                }
              }
            }
            
            // Update MCP status
            const mcpStatus = document.getElementById('mcp-status');
            const mcpStatusIcon = document.getElementById('mcp-status-icon');
            
            if (mcpStatus && mcpStatusIcon) {
              if (data.mcpStatus === 'enabled') {
                mcpStatus.textContent = 'MCP Servers in use';
                mcpStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
                mcpStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                // Hide the sample button when MCP is enabled
                const showSampleMcpButton = document.getElementById('show-sample-mcp');
                if (showSampleMcpButton) {
                  showSampleMcpButton.classList.add('hidden');
                }
              } else {
                mcpStatus.textContent = 'No MCP Servers in use';
                mcpStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100';
                mcpStatusIcon.innerHTML = '<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
                // Show the sample button when MCP is not enabled
                const showSampleMcpButton = document.getElementById('show-sample-mcp');
                if (showSampleMcpButton) {
                  showSampleMcpButton.classList.remove('hidden');
                }
              }
            }
            
            // Update Environment status
            const envStatus = document.getElementById('env-status');
            const envStatusIcon = document.getElementById('env-status-icon');
            const envWarning = document.getElementById('env-warning');
            
            if (envStatus && envStatusIcon) {
              if (data.envExists) {
                envStatus.textContent = '.agent.env file found';
                envStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100';
                envStatusIcon.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                if (envWarning) {
                  envWarning.classList.add('hidden');
                }
                // Hide the sample button when .agent.env exists
                const showSampleEnvButton = document.getElementById('show-sample-env');
                if (showSampleEnvButton) {
                  showSampleEnvButton.classList.add('hidden');
                }
              } else {
                envStatus.textContent = 'No .agent.env file found';
                envStatusIcon.className = 'inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100';
                envStatusIcon.innerHTML = '<svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
                if (envWarning) {
                  envWarning.classList.remove('hidden');
                }
                // Show the sample button when no .agent.env exists
                const showSampleEnvButton = document.getElementById('show-sample-env');
                if (showSampleEnvButton) {
                  showSampleEnvButton.classList.remove('hidden');
                }
              }
            }
          }
        })
        .catch(error => {
          console.error('Error fetching agent configuration:', error);
          
          // Update status elements with error information
          document.querySelectorAll('[id$="-status"]').forEach(element => {
            element.textContent = 'Error loading status';
            element.classList.add('text-red-600');
          });
        });
        
      // Variables to store sample content
      let sampleBrainContent = '';
      let sampleEnvContent = '';
      let samplePreprocContent = '';
      let sampleMcpContent = '';
      
      // Handle show sample brain button
      const showSampleBrainButton = document.getElementById('show-sample-brain');
      const sampleBrainContainer = document.getElementById('sample-brain-container');
      const sampleBrainContentElement = document.getElementById('sample-brain-content');
      
      if (showSampleBrainButton && sampleBrainContainer && sampleBrainContentElement) {
        showSampleBrainButton.addEventListener('click', function() {
          // If we haven't fetched the sample content yet, fetch it now
          if (!sampleBrainContent) {
            // Show loading indicator
            sampleBrainContentElement.textContent = 'Loading sample...';
            sampleBrainContainer.classList.remove('hidden');
            this.textContent = 'Hide Sample';
            
            // Fetch the sample brain.md content
            fetch('/api/samples/brain')
              .then(response => response.text())
              .then(content => {
                sampleBrainContent = content;
                sampleBrainContentElement.textContent = sampleBrainContent;
              })
              .catch(error => {
                console.error('Error fetching sample brain.md:', error);
                sampleBrainContentElement.textContent = 'Error loading sample content';
              });
          } else {
            // We already have the content, just toggle visibility
            sampleBrainContainer.classList.toggle('hidden');
            this.textContent = sampleBrainContainer.classList.contains('hidden') ? 'Show Sample' : 'Hide Sample';
            
            // Make sure the content is set
            sampleBrainContentElement.textContent = sampleBrainContent;
          }
        });
      }
      
      // Handle show sample env button
      const showSampleEnvButton = document.getElementById('show-sample-env');
      const sampleEnvContainer = document.getElementById('sample-env-container');
      const sampleEnvContentElement = document.getElementById('sample-env-content');
      
      if (showSampleEnvButton && sampleEnvContainer && sampleEnvContentElement) {
        showSampleEnvButton.addEventListener('click', function() {
          // If we haven't fetched the sample content yet, fetch it now
          if (!sampleEnvContent) {
            // Show loading indicator
            sampleEnvContentElement.textContent = 'Loading sample...';
            sampleEnvContainer.classList.remove('hidden');
            this.textContent = 'Hide Sample';
            
            // Fetch the sample .agent.env content
            fetch('/api/samples/env')
              .then(response => response.text())
              .then(content => {
                sampleEnvContent = content;
                sampleEnvContentElement.textContent = sampleEnvContent;
              })
              .catch(error => {
                console.error('Error fetching sample .agent.env:', error);
                sampleEnvContentElement.textContent = 'Error loading sample content';
              });
          } else {
            // We already have the content, just toggle visibility
            sampleEnvContainer.classList.toggle('hidden');
            this.textContent = sampleEnvContainer.classList.contains('hidden') ? 'Show Sample' : 'Hide Sample';
            
            // Make sure the content is set
            sampleEnvContentElement.textContent = sampleEnvContent;
          }
        });
      }
      
      // Handle copy sample brain button
      const copySampleBrainButton = document.getElementById('copy-sample-brain');
      if (copySampleBrainButton) {
        copySampleBrainButton.addEventListener('click', function() {
          navigator.clipboard.writeText(sampleBrainContent).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
              this.textContent = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Could not copy text: ', err);
          });
        });
      }
      
      // Handle copy sample env button
      const copySampleEnvButton = document.getElementById('copy-sample-env');
      if (copySampleEnvButton) {
        copySampleEnvButton.addEventListener('click', function() {
          navigator.clipboard.writeText(sampleEnvContent).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
              this.textContent = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Could not copy text: ', err);
          });
        });
      }
      
      // Handle show sample preprocessor button
      const showSamplePreprocButton = document.getElementById('show-sample-preproc');
      const samplePreprocContainer = document.getElementById('sample-preproc-container');
      const samplePreprocContentElement = document.getElementById('sample-preproc-content');
      
      if (showSamplePreprocButton && samplePreprocContainer && samplePreprocContentElement) {
        showSamplePreprocButton.addEventListener('click', function() {
          // If we haven't fetched the sample content yet, fetch it now
          if (!samplePreprocContent) {
            // Show loading indicator
            samplePreprocContentElement.textContent = 'Loading sample...';
            samplePreprocContainer.classList.remove('hidden');
            this.textContent = 'Hide Sample';
            
            // Fetch the sample preprocessor config content
            fetch('/api/samples/preproc')
              .then(response => response.text())
              .then(content => {
                samplePreprocContent = content;
                samplePreprocContentElement.textContent = samplePreprocContent;
              })
              .catch(error => {
                console.error('Error fetching sample preprocessor config:', error);
                samplePreprocContentElement.textContent = 'Error loading sample content';
              });
          } else {
            // We already have the content, just toggle visibility
            samplePreprocContainer.classList.toggle('hidden');
            this.textContent = samplePreprocContainer.classList.contains('hidden') ? 'Show Sample' : 'Hide Sample';
            
            // Make sure the content is set
            samplePreprocContentElement.textContent = samplePreprocContent;
          }
        });
      }
      
      // Handle copy sample preprocessor button
      const copySamplePreprocButton = document.getElementById('copy-sample-preproc');
      if (copySamplePreprocButton) {
        copySamplePreprocButton.addEventListener('click', function() {
          navigator.clipboard.writeText(samplePreprocContent).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
              this.textContent = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Could not copy text: ', err);
          });
        });
      }
      
      // Handle show sample MCP button
      const showSampleMcpButton = document.getElementById('show-sample-mcp');
      const sampleMcpContainer = document.getElementById('sample-mcp-container');
      const sampleMcpContentElement = document.getElementById('sample-mcp-content');
      
      if (showSampleMcpButton && sampleMcpContainer && sampleMcpContentElement) {
        showSampleMcpButton.addEventListener('click', function() {
          // If we haven't fetched the sample content yet, fetch it now
          if (!sampleMcpContent) {
            // Show loading indicator
            sampleMcpContentElement.textContent = 'Loading sample...';
            sampleMcpContainer.classList.remove('hidden');
            this.textContent = 'Hide Sample';
            
            // Fetch the sample MCP config content
            fetch('/api/samples/mcp')
              .then(response => response.text())
              .then(content => {
                sampleMcpContent = content;
                sampleMcpContentElement.textContent = sampleMcpContent;
              })
              .catch(error => {
                console.error('Error fetching sample MCP config:', error);
                sampleMcpContentElement.textContent = 'Error loading sample content';
              });
          } else {
            // We already have the content, just toggle visibility
            sampleMcpContainer.classList.toggle('hidden');
            this.textContent = sampleMcpContainer.classList.contains('hidden') ? 'Show Sample' : 'Hide Sample';
            
            // Make sure the content is set
            sampleMcpContentElement.textContent = sampleMcpContent;
          }
        });
      }
      
      // Handle copy sample MCP button
      const copySampleMcpButton = document.getElementById('copy-sample-mcp');
      if (copySampleMcpButton) {
        copySampleMcpButton.addEventListener('click', function() {
          navigator.clipboard.writeText(sampleMcpContent).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
              this.textContent = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Could not copy text: ', err);
          });
        });
      }
    };
  </script>`;
}
