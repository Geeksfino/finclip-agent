import { QueryPreProcessor } from "@finogeek/actgent/core";
import { McpTool } from "@finogeek/actgent/tools";
import { McpConfigurator } from "@finogeek/actgent/helpers";
import { createRuntime } from "@finogeek/actgent/runtime";

const runtime = createRuntime();

/**
 * A query preprocessor that enhances queries with information from an MCP-based knowledge base
 */
export class KnowledgePreProcessor implements QueryPreProcessor {
  private mcpTool: McpTool | null = null;
  
  /**
   * Initialize the preprocessor with MCP tools
   * @param configPath Path to the MCP configuration file
   */
  async initialize(configPath?: string): Promise<boolean> {
    try {
      const mcpConfigPath = configPath || runtime.path.join(process.cwd(), 'conf', 'preproc-mcp.json');
      const mcpTools = await McpConfigurator.loadTools(mcpConfigPath);
      
      // Find the retrieve_context tool
      const retrieveContextTool = mcpTools.find(tool => tool.name === 'retrieve_context');
      
      if (retrieveContextTool) {
        console.log(`Found retrieve_context tool for query preprocessing.`);
        this.mcpTool = retrieveContextTool;
        return true;
      }
      
      console.warn('No retrieve_context tool found for query preprocessing');
      return false;
    } catch (error) {
      console.error('Error initializing McpKnowledgePreProcessor:', error);
      return false;
    }
  }
  
  /**
   * Process a query by enhancing it with knowledge base information
   * @param query The original query
   * @param sessionId The session ID
   * @returns The enhanced query
   */
  async process(query: string, sessionId: string): Promise<string> {
    if (!this.mcpTool) {
      console.warn('MCP tool not initialized for query preprocessing, returning original query');
      return query;
    }
    
    try {
      // Execute the retrieve_context tool with the query as input
      const result = await this.mcpTool.run({ 
        query,
        messageType: 'text' 
      });
      
      // result is a StringOutput object, extract the content
      const content = result.getContent();
      
      // If we have content, try to parse it and add to the query
      if (content && content.trim()) {
        try {
          // The content is likely a JSON string from McpTool's execute method
          const parsedContent = JSON.parse(content);
          
          if (parsedContent.content && Array.isArray(parsedContent.content)) {
            // Extract text from standard MCP format
            const textContent = parsedContent.content
              .filter((item: any) => item.type === 'text' && item.text)
              .map((item: any) => item.text)
              .join('\n');
              
            if (textContent) {
              return `${query}\n\nKnowledge Base: ${textContent}`;
            }
          }
          
          // If we can't extract from the standard format, use the whole content
          return `${query}\n\nKnowledge Base: ${JSON.stringify(parsedContent)}`;
        } catch (e) {
          // If it's not parseable JSON, use as plain text
          return `${query}\n\nKnowledge Base: ${content}`;
        }
      }
      
      // If no useful content was returned, use the original query
      return query;
    } catch (error) {
      console.error(`Error in query preprocessing: ${error}`);
      return query; // Fall back to original query
    }
  }
}

/**
 * Factory function to create and initialize a McpKnowledgePreProcessor
 * @param configPath Optional path to the MCP configuration file
 * @returns Promise that resolves to a preprocessor or null if initialization fails
 */
export async function createMcpKnowledgePreProcessor(configPath?: string): Promise<KnowledgePreProcessor | null> {
  const preprocessor = new KnowledgePreProcessor();
  const initialized = await preprocessor.initialize(configPath);
  
  return initialized ? preprocessor : null;
}
