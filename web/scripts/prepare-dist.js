#!/usr/bin/env bun

/**
 * This script prepares a clean distribution folder with only the necessary files
 * for production deployment of the chat widget.
 */

import fs from 'fs';
import path from 'path';

const sourceDir = path.resolve('./dist');
const targetDir = path.resolve('./dist-production');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  'finclip-chat-embed.iife.js', // Production embed script
  'style.css',                  // CSS styles
];

console.log('Preparing production distribution...');

// Clean target directory
fs.readdirSync(targetDir).forEach(file => {
  const filePath = path.join(targetDir, file);
  fs.unlinkSync(filePath);
  console.log(`Removed: ${filePath}`);
});

// Copy necessary files
filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${file}`);
  } else {
    console.error(`Error: ${file} not found in source directory`);
  }
});

// Create a sample HTML file showing how to embed the widget
const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinClip Chat Widget - Implementation Guide</title>
  <link rel="stylesheet" href="style.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #2563eb;
    }
    pre {
      background-color: #f1f5f9;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
    }
    .note {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 10px 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>FinClip Chat Widget - Implementation Guide</h1>
  
  <p>This guide shows you how to embed the FinClip Chat Widget on your website.</p>
  
  <h2>Basic Implementation</h2>
  
  <p>Add the following code to your HTML:</p>
  
  <pre>&lt;!-- Add the CSS file --&gt;
&lt;link rel="stylesheet" href="https://your-cdn.com/style.css"&gt;

&lt;!-- Add the script with data attributes --&gt;
&lt;script 
  src="https://your-cdn.com/finclip-chat-embed.iife.js" 
  data-finclip-chat 
  data-api-url="https://your-api-server.com" 
  data-streaming-url="https://your-streaming-server.com"&gt;
&lt;/script&gt;</pre>

  <h2>Advanced Configuration</h2>
  
  <p>For more control, you can initialize the widget manually:</p>
  
  <pre>&lt;!-- Add the CSS file --&gt;
&lt;link rel="stylesheet" href="https://your-cdn.com/style.css"&gt;

&lt;!-- Add the script --&gt;
&lt;script src="https://your-cdn.com/finclip-chat-embed.iife.js"&gt;&lt;/script&gt;

&lt;script&gt;
  window.initFinClipChat({
    buttonLabel: "Chat with Support",
    initialOpen: false,
    suggestions: ["How do I get started?", "What are your pricing plans?"],
    suggestionsLabel: "Frequently Asked Questions",
    apiUrl: "https://your-api-server.com",
    streamingUrl: "https://your-streaming-server.com"
  });
&lt;/script&gt;</pre>

  <div class="note">
    <strong>Note:</strong> Make sure your backend servers have proper CORS headers configured to allow cross-origin requests:
    <ul>
      <li>Access-Control-Allow-Origin: [specific origin]</li>
      <li>Access-Control-Allow-Credentials: true</li>
      <li>Access-Control-Allow-Methods: GET, POST, OPTIONS</li>
      <li>Access-Control-Allow-Headers: Content-Type, Authorization</li>
    </ul>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(targetDir, 'implementation-guide.html'), sampleHtml);
console.log('Created: implementation-guide.html');

console.log('\nProduction distribution prepared successfully!');
console.log(`Files are available in: ${targetDir}`);
