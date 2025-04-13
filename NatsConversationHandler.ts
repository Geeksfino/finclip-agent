import { ConversationDataHandler } from "@finogeek/actgent/core";
import { Message } from "@finogeek/actgent/core";
import * as NATS from "nats";

/**
 * Configuration options for the NatsConversationHandler
 */
export interface NatsConversationHandlerConfig {
  /**
   * NATS server URL
   */
  natsUrl: string;
  
  /**
   * Base subject to publish conversation segments to
   * @default "conversation.segments"
   */
  subject?: string;
  
  /**
   * Minimum number of messages to buffer before publishing
   * @default 2
   */
  minMessagesBeforePublish?: number;
  
  /**
   * Maximum time in milliseconds to buffer messages before forcing publish
   * @default 60000 (60 seconds)
   */
  maxIdleTime?: number;
}

/**
 * A conversation data handler that buffers messages and publishes them to NATS
 */
export class NatsConversationHandler implements ConversationDataHandler {
  // Priority for handler execution order
  priority = 10;
  
  // NATS connection
  private nc: NATS.NatsConnection | null = null;
  
  // Base subject for publishing
  private subject: string;
  
  // Message buffers by session ID
  private buffers: Map<string, {
    messages: Message[],
    lastUpdated: number
  }> = new Map();
  
  // Configuration parameters
  private minMessagesBeforePublish: number;
  private maxIdleTime: number;
  
  // Timer for checking idle buffers
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;
  
  /**
   * Creates a new NatsConversationHandler
   */
  constructor(config: NatsConversationHandlerConfig) {
    this.subject = config.subject || "conversation.segments";
    this.minMessagesBeforePublish = config.minMessagesBeforePublish || 2;
    this.maxIdleTime = config.maxIdleTime || 60000; // 60 seconds
    
    // Connect to NATS
    this.connect(config.natsUrl);
    
    // Start idle buffer check timer
    this.idleCheckTimer = setInterval(() => this.checkIdleBuffers(), 15000); // Check every 15 seconds
  }
  
  /**
   * Connect to NATS server
   */
  private async connect(natsUrl: string): Promise<void> {
    try {
      this.nc = await NATS.connect({ servers: natsUrl });
      console.log(`[NatsConversationHandler] Connected to NATS server at ${natsUrl}`);
    } catch (error) {
      console.error("[NatsConversationHandler] Failed to connect to NATS server:", error);
      // Implement retry logic
      setTimeout(() => this.connect(natsUrl), 5000);
    }
  }
  
  /**
   * Handle a conversation message
   */
  async handleMessage(message: Message, agentId: string): Promise<void> {
    // Skip if not connected to NATS
    if (!this.nc) {
      console.warn("[NatsConversationHandler] Not connected to NATS, skipping message");
      return;
    }
    
    // Add to session buffer
    const sessionId = message.sessionId;
    if (!this.buffers.has(sessionId)) {
      this.buffers.set(sessionId, { 
        messages: [], 
        lastUpdated: Date.now() 
      });
    }
    
    const buffer = this.buffers.get(sessionId)!;
    buffer.messages.push(message);
    buffer.lastUpdated = Date.now();
    
    // Check if we should publish
    if (buffer.messages.length >= this.minMessagesBeforePublish) {
      await this.publishConversationSegment(sessionId, agentId);
    }
  }
  
  /**
   * Check for idle buffers that need to be published
   */
  private async checkIdleBuffers(): Promise<void> {
    const now = Date.now();
    
    for (const [sessionId, buffer] of this.buffers.entries()) {
      if (buffer.messages.length > 0 && now - buffer.lastUpdated > this.maxIdleTime) {
        // Try to extract agent ID from message metadata context
        const messageWithAgentId = buffer.messages.find(m => m.metadata?.context?.agentId);
        const agentId = messageWithAgentId?.metadata?.context?.agentId || "unknown";
        
        await this.publishConversationSegment(sessionId, agentId);
      }
    }
  }
  
  /**
   * Publish a conversation segment to NATS
   */
  private async publishConversationSegment(sessionId: string, agentId: string): Promise<void> {
    if (!this.nc) return;
    
    try {
      const buffer = this.buffers.get(sessionId);
      if (!buffer || buffer.messages.length === 0) return;
      
      // Prepare conversation segment
      const segment = {
        id: `${sessionId}-${Date.now()}`,
        sessionId,
        agentId,
        timestamp: new Date().toISOString(),
        messageCount: buffer.messages.length,
        messages: buffer.messages.map(msg => ({
          id: msg.id,
          sender: msg.metadata?.sender || "unknown",
          content: msg.payload.input || "",
          timestamp: msg.metadata?.timestamp || new Date().toISOString(),
          type: msg.payload.inputType || "text",
          context: msg.metadata?.context || {}
        }))
      };
      
      // Publish to NATS with session ID in the subject
      const subject = `${this.subject}.${agentId}.${sessionId}`;
      await this.nc.publish(subject, JSON.stringify(segment));
      
      console.log(`[NatsConversationHandler] Published ${buffer.messages.length} messages to ${subject}`);
      
      // Clear the buffer
      this.buffers.set(sessionId, {
        messages: [],
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error("[NatsConversationHandler] Error publishing conversation segment:", error);
    }
  }
  
  /**
   * Close the handler and release resources
   */
  close(): void {
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }
    
    if (this.nc) {
      this.nc.close();
      this.nc = null;
    }
  }
}
