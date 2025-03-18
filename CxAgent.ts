import { AgentBuilder } from "@finogeek/actgent/agent";
import { AgentServiceConfigurator, AgentCoreConfigurator } from "@finogeek/actgent/helpers";
import { BarePromptTemplate, BareClassifier } from "@finogeek/actgent/agent";
import { createRuntime } from "@finogeek/actgent/runtime";
import { KnowledgePreProcessor } from "./KnowledgePreProcessor";

const runtime = createRuntime();

// Load the agent configuration from a markdown file
const configPath = runtime.path.join(__dirname, 'brain.md');
const agentConfig = await AgentCoreConfigurator.loadMarkdownConfig(configPath);

// Load the agent runtime environment from the project root
const svcConfig = await AgentServiceConfigurator.getAgentConfiguration(__dirname);

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
      console.warn('Failed to initialize MCP Knowledge preprocessor');
    }
  } catch (error) {
    console.error('Error setting up MCP Knowledge preprocessor:', error);
  }
})();

export { CxAgent };
