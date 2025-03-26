import { AgentBuilder } from "@finogeek/actgent/agent";
import { AgentServiceConfigurator, AgentCoreConfigurator } from "@finogeek/actgent/helpers";
import { BarePromptTemplate, BareClassifier } from "@finogeek/actgent/agent";
import { createRuntime } from "@finogeek/actgent/runtime";
import { KnowledgePreProcessor } from "./KnowledgePreProcessor";

const runtime = createRuntime();

// Load the agent configuration from a markdown file
// First check if brain.md exists in the current working directory
const cwdBrainPath = runtime.path.join(process.cwd(), 'brain.md');
const defaultBrainPath = runtime.path.join(__dirname, 'brain.md');

// Determine which brain.md file to use
let configPath = defaultBrainPath;
try {
  await runtime.fs.stat(cwdBrainPath);
  // If we reach here, the file exists in the current directory
  console.log(`Using brain.md from current directory: ${cwdBrainPath}`);
  configPath = cwdBrainPath;
} catch (error) {
  // File doesn't exist in current directory, use the default
  console.log(`No brain.md found in current directory, using default`);
}

const agentConfig = await AgentCoreConfigurator.loadMarkdownConfig(configPath);

// Load the agent runtime environment
// Check if .agent.env exists in current working directory first, otherwise use the one in the package
const cwdEnvPath = runtime.path.join(process.cwd(), '.agent.env');
const hasCustomEnv = await runtime.fs.exists(cwdEnvPath);

if (hasCustomEnv) {
  console.log(`Using .agent.env from current directory: ${cwdEnvPath}`);
} else {
  console.log(`No .agent.env found in current directory, using default configuration`);
}

// Pass the current working directory as the base path if a custom .agent.env exists there
const basePath = hasCustomEnv ? process.cwd() : __dirname;
const svcConfig = await AgentServiceConfigurator.getAgentConfiguration(basePath);

const CxAgent = new AgentBuilder(agentConfig, svcConfig)
    .create(BareClassifier, BarePromptTemplate);

// Initialize MCP preprocessor
(async () => {
  try {
    // Create the preprocessor and initialize it
    const preprocessor = new KnowledgePreProcessor();
    const initialized = await preprocessor.initialize(
      runtime.path.join(__dirname, 'conf', 'preproc-mcp.json')
    );
    
    if (initialized) {
      // Set the preprocessor on the agent
      CxAgent.setQueryPreProcessor(preprocessor);
      console.log('MCP Knowledge preprocessor initialized and set up with the agent');
    } else {
      console.debug('No MCP Knowledge preprocessor configured');
    }
  } catch (error) {
    console.error('Error setting up MCP Knowledge preprocessor:', error);
  }
})();

export { CxAgent };
