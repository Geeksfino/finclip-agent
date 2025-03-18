import { AgentBuilder } from "@finogeek/actgent/agent";
import { AgentServiceConfigurator, AgentCoreConfigurator } from "@finogeek/actgent/helpers";
import { MultiLevelClassifier, MultiLevelPromptTemplate } from "@finogeek/actgent/agent";
import { BarePromptTemplate, BareClassifier } from "@finogeek/actgent/agent";
import { createRuntime } from "@finogeek/actgent/runtime";
import { LoggingConfig } from "@finogeek/actgent/core";
import { McpKnowledgePreProcessor } from "./McpKnowledgePreProcessor";
import { v4 as uuidv4 } from 'uuid';

const runtime = createRuntime();

// Import tools


// Load the agent configuration from a markdown file
const configPath = runtime.path.join(__dirname, 'brain.md');
const agentConfig = await AgentCoreConfigurator.loadMarkdownConfig(configPath);

// Load the agent runtime environment from the project root
const svcConfig = await AgentServiceConfigurator.getAgentConfiguration(__dirname);

class CxAgentClass {
    private agent: any;
    private streamCallbacks: Array<(delta: string) => void> = [];
    private isRunning: boolean = false;
    private sessions: Map<string, any> = new Map();
    
    constructor() {
        this.agent = new AgentBuilder(agentConfig, svcConfig)
            .create(BareClassifier, BarePromptTemplate);
    }
    
    getName(): string {
        return "CxAgent";
    }
    
    run(loggerConfig: LoggingConfig): void {
        if (this.isRunning) {
            console.log("Agent is already running");
            return;
        }
        
        this.agent.run(loggerConfig);
        this.isRunning = true;
    }
    
    registerStreamCallback(callback: (delta: string) => void): void {
        this.streamCallbacks.push(callback);
    }
    
    async createSession(userId: string, initialInput: string): Promise<any> {
        const sessionId = uuidv4();
        const session = await this.agent.createSession(userId, initialInput);
        this.sessions.set(sessionId, session);
        return session;
    }
    
    async shutdown(): Promise<void> {
        // Close all active sessions
        for (const session of this.sessions.values()) {
            try {
                await session.close();
            } catch (error) {
                console.error("Error closing session:", error);
            }
        }
        
        this.sessions.clear();
        this.isRunning = false;
    }
    
    setQueryPreProcessor(preprocessor: any): void {
        this.agent.setQueryPreProcessor(preprocessor);
    }
}

const CxAgent = new CxAgentClass();

// Initialize MCP preprocessor
(async () => {
  try {
    // Create the preprocessor and initialize it
    const preprocessor = new McpKnowledgePreProcessor();
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
