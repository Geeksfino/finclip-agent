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
