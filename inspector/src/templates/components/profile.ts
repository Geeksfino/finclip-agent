/**
 * Profile components for the inspector UI
 * Contains components for displaying the agent profile (brain.md content)
 */

import { TemplateOptions } from './index';

export interface ProfileOptions extends TemplateOptions {
  brainExists?: boolean;
  brainContent?: string;
}

/**
 * Create the agent profile section with brain.md content
 */
export function createProfileSection(options: ProfileOptions): string {
  return `<div class="bg-white p-8 rounded-lg shadow">
    <h2 class="text-2xl font-semibold mb-6 text-blue-700">Agent Profile</h2>
    <pre id="brain-content-display" class="bg-gray-100 p-6 rounded whitespace-pre-wrap overflow-x-auto text-gray-700 font-mono text-sm leading-relaxed"></pre>
  </div>`;
}
