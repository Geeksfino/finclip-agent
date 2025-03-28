#!/bin/bash

# Create a temporary directory for testing
TEST_DIR=$(mktemp -d)
echo "Created test directory: $TEST_DIR"

# Change to the test directory
cd "$TEST_DIR"

# Explicitly unset any LLM environment variables
unset LLM_PROVIDER_URL
unset LLM_MODEL
unset LLM_API_KEY
unset LLM_STREAM_MODE

# Create a wrapper script that explicitly unsets environment variables
cat > run-wrapper.js << 'EOF'
#!/usr/bin/env bun

// Explicitly delete any LLM environment variables
delete process.env.LLM_PROVIDER_URL;
delete process.env.LLM_MODEL;
delete process.env.LLM_API_KEY;
delete process.env.LLM_STREAM_MODE;

// Print environment variables for debugging
console.log('Environment variables before running CxAgent:');
console.log('LLM_PROVIDER_URL:', process.env.LLM_PROVIDER_URL);
console.log('LLM_MODEL:', process.env.LLM_MODEL);

// Import the CxAgent index.ts file
import('/Users/cliang/repos/mygithub/cxagent/index.ts');
EOF

chmod +x run-wrapper.js

# Run the wrapper script
echo "Running CxAgent in inspector mode with LLM environment variables unset..."
bun run ./run-wrapper.js --inspect --inspect-port 3999 --log-level debug

# Cleanup
echo "Test complete. Press Ctrl+C to exit."
