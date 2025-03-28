/**
 * HTML template for the CxAgent Inspector UI
 */

import { 
  createStatusSection, 
  createEmbeddingSection, 
  createProfileSection,
  createHtmlDocument,
  TemplateOptions
} from './components/index';

/**
 * Create the HTML for the inspector UI
 */
export function createInspectorHtml(options: TemplateOptions): string {
  // Create the main content by combining all sections
  const content = createStatusSection(options) + 
                 createEmbeddingSection(options) + 
                 createProfileSection(options);
  
  // Create the complete HTML document with the content
  return createHtmlDocument({
    hasStylesheet: options.hasStylesheet,
    hasEmbedScript: options.hasEmbedScript,
    content
  });
}
