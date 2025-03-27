# CxAgent MCP Configuration

This directory contains configuration files for MCP (Model Context Protocol) servers and preprocessors.

## MCP Servers Configuration

The `mcp_config.json` file defines MCP servers that CxAgent can connect to. These servers provide additional capabilities to the agent, such as searching through files or accessing external knowledge bases.

### Example Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "${HOME}/Documents",
        "${HOME}/Downloads"
      ]
    },
    "example-server": {
      "command": "bun",
      "args": [
        "run",
        "start"
      ],
      "cwd": "${HOME}/repos/mygithub/example-mcp-server"
    }
  }
}
```

### Configuration Options

Each MCP server entry supports the following options:

- `command`: The command to run to start the MCP server
- `args`: Array of arguments to pass to the command
- `cwd` (optional): Working directory for the command
- `env` (optional): Environment variables to set when running the command

### Environment Variables

You can use the following placeholders in your configuration:

- `${HOME}`: Will be replaced with the user's home directory
- `${CWD}`: Will be replaced with the current working directory

## MCP Preprocessor Configuration

The `preproc-mcp.json` file configures the query preprocessor that enhances user queries before they're sent to the LLM. This can improve the quality of responses by adding relevant context.

### Example Configuration

```json
{
  "preprocessor": {
    "type": "mcp",
    "config": {
      "serverName": "example-server",
      "toolName": "retrieve_context"
    }
  }
}
```

## Usage

Place these configuration files in the `conf` directory of your project. CxAgent will automatically detect and use them if present.

You can also create these files in the current working directory when running CxAgent, and they will be used instead of the default configurations.
