import { AgentBuilder } from "@finogeek/actgent/agent";
import { AgentServiceConfigurator, AgentCoreConfigurator } from "@finogeek/actgent/helpers";
import { BarePromptTemplate, BareClassifier } from "@finogeek/actgent/agent";
import { createRuntime } from "@finogeek/actgent/runtime";
import { KnowledgePreProcessor } from "./KnowledgePreProcessor";
import { NatsConversationHandler } from "./NatsConversationHandler";
import * as yaml from "js-yaml";

const runtime = createRuntime();

// --- Step 1: Define Base Path for User Configs ---
const userConfigBasePath = process.cwd();
console.log(`ℹ️ Base path for user configurations: ${userConfigBasePath}`);

// Load the agent runtime environment
// --- Step 2: Handle .agent.env (Informational Check, Load via Configurator) ---
const cwdEnvPath = runtime.path.join(userConfigBasePath, '.agent.env'); // Use userConfigBasePath
const hasAgentEnvFile = await runtime.fs.exists(cwdEnvPath);

if (hasAgentEnvFile) {
  console.log(`ℹ️ Found .agent.env file: ${cwdEnvPath}. Environment variables usually take precedence.`);
} else {
  console.log(`ℹ️ No .agent.env file found. Relying on environment variables.`);
}
// AgentServiceConfigurator should prioritize environment variables.
// Pass userConfigBasePath so it knows where to look if it needs the file.
const svcConfig = await AgentServiceConfigurator.getAgentConfiguration(userConfigBasePath);

// Determine the path for brain.md
// --- Step 3: Handle brain.md (Check CWD, Fallback to Default in __dirname) ---
const cwdBrainPath = runtime.path.join(userConfigBasePath, 'brain.md');
const hasCustomBrain = await runtime.fs.exists(cwdBrainPath);
const brainLoadPath = hasCustomBrain ? cwdBrainPath : runtime.path.join(__dirname, 'brain.md'); // Use CWD path if brain.md exists, else use default path

if (hasCustomBrain) {
  console.log(`Using brain.md from current directory: ${cwdBrainPath}`);
} else {
  console.log(`No brain.md found in current directory, using default.`);
}
// Pass the determined path to loadMarkdownConfig
const agentConfig = await AgentCoreConfigurator.loadMarkdownConfig(brainLoadPath);

// Check for MCP configuration file
// --- Step 4: Handle MCP Config (Simplified - Use Directly) ---
const mcpConfigPath = runtime.path.join(userConfigBasePath, 'conf', 'mcp_config.json'); // Always look in CWD/conf
const hasMcpConfig = await runtime.fs.exists(mcpConfigPath);

if (hasMcpConfig) {
  console.log(`Found MCP configuration, will use directly: ${mcpConfigPath}`);
} else {
  console.log(`No MCP configuration found at ${mcpConfigPath}`);
}

// Create the agent with MCP tools if configuration exists
// --- Step 5: Initialize Agent ---
let agentBuilder = new AgentBuilder(agentConfig, svcConfig);

// Add MCP tools if configuration exists
if (hasMcpConfig) { // Simplified condition
  try {
    // Use the original config path directly
    agentBuilder = agentBuilder.withMcpTools(mcpConfigPath); // Use original path
  } catch (mcpError: unknown) {
    const errorMessage = mcpError instanceof Error ? mcpError.message : String(mcpError);
    // Keep error handling for withMcpTools itself
    console.error(`Error initializing MCP tools from ${mcpConfigPath}: ${errorMessage}`);
    console.warn('Continuing without MCP tools due to initialization error');
  }
}

const CxAgent = agentBuilder.create(BareClassifier, BarePromptTemplate);

// Initialize NATS conversation handler
(async () => {
  try {
    // Check if nats_conversation_handler.yml exists
    const cwdNatsConfigPath = runtime.path.join(userConfigBasePath, 'conf', 'nats_conversation_handler.yml');
    const defaultNatsConfigPath = runtime.path.join(__dirname, 'conf', 'nats_conversation_handler.yml');
    
    // Determine which config file to use
    let natsConfigPath = defaultNatsConfigPath;
    const hasCwdNatsConfig = await runtime.fs.exists(cwdNatsConfigPath);
    
    if (hasCwdNatsConfig) {
      console.log(`Using nats_conversation_handler.yml from current directory: ${cwdNatsConfigPath}`);
      natsConfigPath = cwdNatsConfigPath;
    } else if (await runtime.fs.exists(defaultNatsConfigPath)) {
      console.log(`Using default nats_conversation_handler.yml`);
    } else {
      console.log('No NATS conversation handler configuration found, skipping initialization');
      return;
    }
    
    // Read and parse the YAML configuration
    const natsConfigContent = await runtime.fs.readFile(natsConfigPath, 'utf-8');
    const natsConfig = yaml.load(natsConfigContent) as any;
    
    // Check if the handler is enabled
    if (!natsConfig.enabled) {
      console.log('NATS conversation handler is disabled in configuration');
      return;
    }
    
    // Create and configure the handler
    const natsHandler = new NatsConversationHandler({
      natsUrl: natsConfig.nats?.url || 'nats://localhost:4222',
      subject: natsConfig.nats?.subject || 'conversation.segments',
      minMessagesBeforePublish: natsConfig.buffer?.min_messages || 2,
      maxIdleTime: natsConfig.buffer?.max_idle_time || 60000
    });
    
    // Register the handler with the agent
    CxAgent.registerConversationDataHandler(natsHandler);
    
    // Set up cleanup on process exit
    process.on('SIGINT', () => {
      console.log('Shutting down NATS conversation handler...');
      natsHandler.close();
    });
    
    console.log('NATS conversation handler initialized and registered with the agent');
  } catch (error) {
    console.error('Error setting up NATS conversation handler:', error);
  }
})();

// Initialize MCP preprocessor
(async () => {
  try {
    // Only attempt to instantiate if preproc-mcp.json exists in either cwd or default
    const cwdPreprocPath = runtime.path.join(userConfigBasePath, 'conf', 'preproc-mcp.json');
    const defaultPreprocPath = runtime.path.join(__dirname, 'conf', 'preproc-mcp.json');

    let preprocPath = undefined;
    if (await runtime.fs.exists(cwdPreprocPath)) {
      console.log(`Using preproc-mcp.json from current directory: ${cwdPreprocPath}`);
      preprocPath = cwdPreprocPath;
    } else if (await runtime.fs.exists(defaultPreprocPath)) {
      console.log(`Using default preproc-mcp.json from package: ${defaultPreprocPath}`);
      preprocPath = defaultPreprocPath;
    } else {
      console.log('No preproc-mcp.json found, skipping MCP Knowledge preprocessor initialization');
      return;
    }

    // Use the factory function for consistency
    const preprocessor = await import('./KnowledgePreProcessor').then(mod => mod.createMcpKnowledgePreProcessor(preprocPath));
    if (preprocessor) {
      CxAgent.setQueryPreProcessor(preprocessor);
      console.log('MCP Knowledge preprocessor initialized and set up with the agent');
    } else {
      console.log('No MCP Knowledge preprocessor configured (initialization failed or KB file missing)');
    }
  } catch (error) {
    console.error('Error setting up MCP Knowledge preprocessor:', error);
  }
})();

export { CxAgent };
