import { AgentBuilder } from "@finogeek/actgent/agent";
import { AgentServiceConfigurator, AgentCoreConfigurator } from "@finogeek/actgent/helpers";
import { BarePromptTemplate, BareClassifier } from "@finogeek/actgent/agent";
import { createRuntime } from "@finogeek/actgent/runtime";
import { KnowledgePreProcessor } from "./KnowledgePreProcessor";
import { NatsConversationHandler } from "./NatsConversationHandler";
import * as yaml from "js-yaml";

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
  console.log(`No .agent.env found in current directory. Agent will not work without proper LLM configurations`);
}

// Pass the current working directory as the base path if a custom .agent.env exists there
const basePath = hasCustomEnv ? process.cwd() : __dirname;
const svcConfig = await AgentServiceConfigurator.getAgentConfiguration(basePath);

// Check for MCP configuration file
const mcpConfigPath = runtime.path.join(basePath, 'conf', 'mcp_config.json');
const hasMcpConfig = await runtime.fs.exists(mcpConfigPath);
let mcpConfigProcessed = false;

if (hasMcpConfig) {
  console.log(`Found MCP configuration: ${mcpConfigPath}`);
  
  try {
    // Read and preprocess the MCP configuration file
    const mcpConfigContent = await runtime.fs.readFile(mcpConfigPath, 'utf-8');
    let mcpConfig;
    
    try {
      mcpConfig = JSON.parse(mcpConfigContent);
      
      // Process environment variables in the configuration
      if (mcpConfig.mcpServers) {
        const home = process.env.HOME || '';
        const cwd = process.cwd();
        
        // Process each server configuration
        for (const serverName in mcpConfig.mcpServers) {
          const server = mcpConfig.mcpServers[serverName];
          
          // Process args array
          if (server.args && Array.isArray(server.args)) {
            server.args = server.args.map((arg: unknown) => {
              if (typeof arg === 'string') {
                return arg.replace(/\$\{HOME\}/g, home)
                         .replace(/\$\{CWD\}/g, cwd);
              }
              return arg;
            });
          }
          
          // Process cwd if present
          if (server.cwd && typeof server.cwd === 'string') {
            server.cwd = server.cwd.replace(/\$\{HOME\}/g, home)
                               .replace(/\$\{CWD\}/g, cwd);
          }
        }
      }
      
      // Write the processed configuration to a temporary file
      const tempMcpConfigPath = runtime.path.join(basePath, 'conf', 'mcp_config_processed.json');
      await runtime.fs.writeFile(tempMcpConfigPath, JSON.stringify(mcpConfig, null, 2));
      
      console.log(`Processed MCP configuration and saved to: ${tempMcpConfigPath}`);
      mcpConfigProcessed = true;
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      console.error(`Error parsing MCP configuration: ${errorMessage}`);
    }
  } catch (readError: unknown) {
    const errorMessage = readError instanceof Error ? readError.message : String(readError);
    console.error(`Error reading MCP configuration: ${errorMessage}`);
  }
}

// Create the agent with MCP tools if configuration exists and was processed successfully
let agentBuilder = new AgentBuilder(agentConfig, svcConfig);

// Add MCP tools if configuration exists and was processed successfully
if (hasMcpConfig && mcpConfigProcessed) {
  try {
    const tempMcpConfigPath = runtime.path.join(basePath, 'conf', 'mcp_config_processed.json');
    agentBuilder = agentBuilder.withMcpTools(tempMcpConfigPath);
  } catch (mcpError: unknown) {
    const errorMessage = mcpError instanceof Error ? mcpError.message : String(mcpError);
    console.error(`Error initializing MCP tools: ${errorMessage}`);
    console.warn('Continuing without MCP tools due to initialization error');
  }
}

const CxAgent = agentBuilder.create(BareClassifier, BarePromptTemplate);

// Initialize NATS conversation handler
(async () => {
  try {
    // Check if nats_conversation_handler.yml exists
    const cwdNatsConfigPath = runtime.path.join(process.cwd(), 'conf', 'nats_conversation_handler.yml');
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
    // Check if preproc-mcp.json exists in the current working directory
    const cwdPreprocPath = runtime.path.join(process.cwd(), 'conf', 'preproc-mcp.json');
    const defaultPreprocPath = runtime.path.join(__dirname, 'conf', 'preproc-mcp.json');
    
    // Determine which preproc-mcp.json file to use
    let preprocPath = defaultPreprocPath;
    const hasCwdPreproc = await runtime.fs.exists(cwdPreprocPath);
    
    if (hasCwdPreproc) {
      console.log(`Using preproc-mcp.json from current directory: ${cwdPreprocPath}`);
      preprocPath = cwdPreprocPath;
    }
    
    // Create the preprocessor and initialize it
    const preprocessor = new KnowledgePreProcessor();
    const initialized = await preprocessor.initialize(preprocPath);
    
    if (initialized) {
      // Set the preprocessor on the agent
      CxAgent.setQueryPreProcessor(preprocessor);
      console.log('MCP Knowledge preprocessor initialized and set up with the agent');
    } else {
      console.log('No MCP Knowledge preprocessor configured');
    }
  } catch (error) {
    console.error('Error setting up MCP Knowledge preprocessor:', error);
  }
})();

export { CxAgent };
