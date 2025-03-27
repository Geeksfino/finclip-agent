#!/usr/bin/env bun

import { CxAgent } from './CxAgent';
import readline from 'readline';
import { LoggingConfig } from "@finogeek/actgent/core";
import { Logger, logger, LogLevel } from '@finogeek/actgent/core'
import path from "path";
import { program } from 'commander';
import { startUI } from './src/cli/ui';

// Configure command line options
program
    .name('cxagent')
    .description('Customer Experience Agent powered by actgent framework')
    .version(process.env.npm_package_version || '1.0.6')
    .option('--log-level <level>', 'set logging level (trace, debug, info, warn, error, fatal)', 'info')
    .option('--ui', 'start a web UI to visualize and interact with the agent')
    .option('--ui-port <port>', 'specify the port for the web UI (default: 5173)', '5173')
    .option('--inspect', 'start the enhanced inspector UI to visualize agent configuration')
    .option('--inspect-port <port>', 'specify the port for the inspector UI (default: 5173)', '5173')
    .allowUnknownOption(false)
    .parse(process.argv);

const options = program.opts();
logger.setLevel(options.logLevel.toLowerCase() as LogLevel);

const loggerConfig: LoggingConfig = {
    destination: path.join(process.cwd(), `CxAgent.log`)
};

// Check if UI or Inspector mode is enabled
if (options.inspect) {
    logger.info('Starting CxAgent in Inspector mode...');

    // Start the agent
    CxAgent.run(loggerConfig);

    // Import and start the new inspector UI
    const inspectPort = options.inspectPort;
    import('./inspector/bridge.js').then(({ startUI: startInspector }) => {
        startInspector({
            port: parseInt(inspectPort),
            brainPath: path.join(process.cwd(), 'brain.md')
        }).then(() => {
            logger.info(`CxAgent Inspector is running at http://localhost:${inspectPort}`);
            logger.info('Press Ctrl+C to stop');
        }).catch((error) => {
            logger.error('Failed to start Inspector:', error);
            process.exit(1);
        });
    }).catch((error) => {
        logger.error('Failed to import Inspector module:', error);
        logger.error('Make sure the inspector directory is properly set up.');
        process.exit(1);
    });
} else if (options.ui) {
    logger.info('Starting CxAgent in UI mode...');

    // Start the agent
    CxAgent.run(loggerConfig);

    // Start the legacy UI
    const uiPort = options.uiPort;
    startUI({
        port: parseInt(uiPort),
        brainPath: path.join(process.cwd(), 'brain.md')
    }).then(() => {
        logger.info(`CxAgent UI is running at http://localhost:${uiPort}`);
        logger.info('Press Ctrl+C to stop');
    }).catch((error) => {
        logger.error('Failed to start UI:', error);
        process.exit(1);
    });
} else {
    // Create readline interface for CLI mode
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    CxAgent.run(loggerConfig);
    CxAgent.registerStreamCallback((delta: string) => {
        process.stdout.write(".");
    });

    // Add prompt configuration
    const defaultPrompt = "You: ";
    const prompt = process.env.AGENT_PROMPT || defaultPrompt;

    // Helper function for questions
    function askQuestion(question: string, resolve: (answer: string) => void) {
        rl.question(`${question}\n${prompt}`, resolve);
    }

    // Handle initial user input
    async function handleInitialInput(): Promise<string> {
        let input = '';
        do {
            input = await new Promise<string>((resolve) => {
                askQuestion("How may I help you today?", resolve);
            });

            if (input.toLowerCase().trim() === '/exit') {
                console.log("Thank you for using the CxAgent. Goodbye!");
                process.exit(0);
            }

            if (input.trim() === '') {
                console.log("Please input something to continue.");
            }
        } while (input.trim() === '');

        return input;
    }

    // Handle chat responses
    function setupResponseHandler(session: any) {
        session.onEvent((response: any) => {
            console.log("event");
            if (typeof response === 'string') {
                process.stdout.write(`\nCxAgent: `);
                process.stdout.write("Structured output to be handled by a tool:\n");
                process.stdout.write(JSON.stringify(response, null, 2));
                process.stdout.write(`\n\n${defaultPrompt}`);
            } else if (typeof response === 'object') {
                if ('clarification' in response) {
                    const { questions } = response.clarification;
                    if (questions) {
                        console.log(`CxAgent: ${questions.join('\n')}`);
                    }
                } else if ('confirmation' in response) {
                    const { prompt, options } = response.confirmation;
                    if (prompt) {
                        console.log(`CxAgent: ${prompt}`);
                        if (options) {
                            console.log(`Options: ${options.join(', ')}`);
                        }
                    }
                } else if ('exception' in response) {
                    const { reason, suggestedAction } = response.exception;
                    if (reason) {
                        console.log(`CxAgent Error: ${reason}`);
                        if (suggestedAction) {
                            console.log(`Suggestion: ${suggestedAction}`);
                        }
                    }
                } else {
                    process.stdout.write(`\nCxAgent: `);
                    process.stdout.write("Structured output to be handled by a tool:\n");
                    process.stdout.write(JSON.stringify(response, null, 2));
                    process.stdout.write(`\n\n${defaultPrompt}`);
                }
            }
        });

        session.onException((response: any) => {
            console.log(`CxAgent Error:`, JSON.stringify(response, null, 2));
        });

        session.onConversation((response: any) => {
            process.stdout.write(`\nCxAgent: `);
            process.stdout.write(JSON.stringify(response, null, 2));
            process.stdout.write(`\n\n${defaultPrompt}`);
        });
    }

    // Handle ongoing chat
    async function handleChat(session: any): Promise<void> {
        while (true) {
            const userInput = await new Promise<string>((resolve) => {
                askQuestion("", resolve);
            });

            if (userInput.toLowerCase().trim() === '/exit') {
                console.log("Thank you for using the CxAgent. Shutting down...");
                await CxAgent.shutdown();
                break;
            }

            if (userInput.trim() === '') {
                continue;
            }

            try {
                await session.chat(userInput);
            } catch (error) {
                console.error("Error during chat:", error);
            }
        }
    }

    // Main chat loop
    async function chatLoop(): Promise<void> {
        try {
            console.log("~~~ Welcome to the Customer Experience Agent ~~~");
            console.log("Type '/exit' to end the conversation.");

            const initialInput = await handleInitialInput();
            const session = await CxAgent.createSession("user", initialInput);

            setupResponseHandler(session);
            await handleChat(session);

        } catch (error) {
            console.error("An error occurred:", error);
        } finally {
            rl.close();
            process.exit(0);
        }
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log("\nShutting down...");
        await CxAgent.shutdown();
        if (!options.ui) {
            rl.close();
        }
        process.exit(0);
    });

    // Start the chat loop only if not in UI mode
    if (!options.ui) {
        chatLoop();
    }
}
