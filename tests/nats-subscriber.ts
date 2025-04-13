/**
 * NATS Conversation Subscriber Test
 * 
 * This script connects to a NATS server and subscribes to conversation segments
 * published by the NatsConversationHandler. It displays the received conversations
 * in a readable format.
 * 
 * Usage:
 *   bun run tests/nats-subscriber.ts
 * 
 * Options:
 *   Set NATS_URL environment variable to change the NATS server URL
 *   Set NATS_SUBJECT environment variable to change the subscription subject
 */

import * as NATS from "nats";

async function main() {
  // Get configuration from environment variables or use defaults
  const natsUrl = process.env.NATS_URL || "nats://localhost:4222";
  const subject = process.env.NATS_SUBJECT || "conversation.segments.>";
  
  console.log(`Connecting to NATS server: ${natsUrl}`);
  console.log(`Subscribing to subject: ${subject}`);
  
  try {
    // Connect to NATS server
    const nc = await NATS.connect({ servers: natsUrl });
    console.log("✅ Connected to NATS server");

    // Subscribe to conversation segments
    const sub = nc.subscribe(subject);
    console.log("✅ Subscription active");
    
    console.log("\n🔍 Waiting for conversation segments...");
    console.log("   (Press Ctrl+C to exit)\n");
    
    // Process incoming messages
    (async () => {
      for await (const msg of sub) {
        try {
          const subject = msg.subject;
          const data = JSON.parse(msg.data.toString());
          
          // Print message header
          console.log("\n" + "=".repeat(80));
          console.log(`📨 RECEIVED MESSAGE ON: ${subject}`);
          console.log("-".repeat(80));
          
          // Print segment metadata
          console.log(`🆔 Session ID: ${data.sessionId}`);
          console.log(`🤖 Agent ID: ${data.agentId}`);
          console.log(`⏰ Timestamp: ${data.timestamp}`);
          console.log(`📊 Message Count: ${data.messageCount}`);
          
          // Print conversation
          console.log("\n📝 CONVERSATION:");
          console.log("-".repeat(30));
          
          if (data.messages && Array.isArray(data.messages)) {
            for (const message of data.messages) {
              const sender = message.sender.toUpperCase();
              const prefix = sender === "USER" ? "👤" : "🤖";
              console.log(`${prefix} ${sender}: ${message.content}`);
            }
          } else {
            console.log("❌ No messages in segment");
          }
          
          console.log("=".repeat(80) + "\n");
        } catch (error) {
          console.error("❌ Error processing message:", error);
          console.error("Raw data:", msg.data.toString());
        }
      }
    })();
    
    // Handle shutdown
    const cleanup = () => {
      console.log("\n🛑 Shutting down...");
      sub.unsubscribe();
      nc.close();
      process.exit(0);
    };
    
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the subscriber
main().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
