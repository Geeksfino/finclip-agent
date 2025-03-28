/**
 * Component exports
 * Re-exports all template components for easy imports
 */

// Common interfaces
export interface TemplateOptions {
  hasStylesheet: boolean;
  hasEmbedScript: boolean;
}

// Re-export all components
export * from './status';
export * from './embedding';
export * from './profile';
export * from './layout';
