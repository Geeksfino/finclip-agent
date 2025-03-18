import { CxAgent } from './CxAgent';
// Import required modules
import { Logger, logger, LogLevel, LoggingConfig } from '@finogeek/actgent/core';
import path from "path";
import { program } from 'commander';
import http from 'http';
import { WebSocketServer } from 'ws';

// Configure command line options
program
  .option('--log-level <level>', 'set logging level (trace, debug, info, warn, error, fatal)', 'info')
  .option('--port <port>', 'port to run the server on', '3000')
  .parse();

const options = program.opts();
const PORT = parseInt(options.port, 10);

logger.setLevel(options.logLevel.toLowerCase() as LogLevel);

const loggerConfig: LoggingConfig = {
  destination: path.join(process.cwd(), `${CxAgent.getName()}-server.log`)
};

// Initialize the agent
CxAgent.run(loggerConfig);
logger.info(`${CxAgent.getName()} initialized`);

// Create HTTP server
const server = http.createServer((req, res) => {
  // Basic routing for REST API
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', agent: CxAgent.getName() }));
    return;
  }

  // Handle other API endpoints here
  
  // Default response for unhandled routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  logger.info('Client connected');
  let session: any = null;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'start') {
        // Start a new chat session
        session = await CxAgent.createSession("user", data.message || 'Hello');
        
        // Set up event handlers
        session.onEvent((response: any) => {
          ws.send(JSON.stringify({
            type: 'event',
            data: response
          }));
        });
        
        session.onException((error: any) => {
          ws.send(JSON.stringify({
            type: 'error',
            data: error
          }));
        });
        
        session.onConversation((conversation: any) => {
          ws.send(JSON.stringify({
            type: 'conversation',
            data: conversation
          }));
        });
        
      } else if (data.type === 'message' && session) {
        // Send message to existing session
        await session.chat(data.message);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Internal server error' }
      }));
    }
  });
  
  ws.on('close', () => {
    logger.info('Client disconnected');
    // Clean up session if needed
  });
});

// Start the server
server.listen(PORT, () => {
  logger.info(`${CxAgent.getName()} server running on port ${PORT}`);
  console.log(`${CxAgent.getName()} server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server shut down');
    process.exit(0);
  });
});
