import { logger } from "@/utils/logger";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

const createMCPService = async ({
  mcpSSEUrl,
  serverName,
  transportType,
  transportArgs,
}: {
  mcpSSEUrl?: string;
  serverName: string;
  transportType: "sse" | "stdio";
  transportArgs?: any;
}) => {
  if (process.env.RAILWAY_ENVIRONMENT_NAME === "production") return;

  const setupMCPClient = async () => {
    const newClient = new Client(
      { name: serverName, version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    let transport;
    if (transportType === "sse") {
      // // workaround import SSEClientTransport from the SDK - normally its broken for cjs becasue of the dependency of it not supporting cjs (pkce-challenge)
      // // https://github.com/modelcontextprotocol/typescript-sdk/issues/213
      const SSEClientTransport = (
        await import("@modelcontextprotocol/sdk/client/sse.js")
      ).SSEClientTransport;

      transport = new SSEClientTransport(new URL("/sse", mcpSSEUrl), {
        requestInit: {
          headers: {
            Accept: "text/event-stream",
          },
        },
      });
    } else {
      const StdioClientTransport = (
        await import("@modelcontextprotocol/sdk/client/stdio.js")
      ).StdioClientTransport;

      transport = new StdioClientTransport(transportArgs);
    }

    try {
      await newClient.connect(transport as Transport);
    } catch (error) {
      logger.error("Error connecting to MCP:", error);
      throw new Error("Error connecting to MCP");
    }

    // // Get tools from server capabilities
    const capabilities = await newClient.listTools();
    const availableTools = capabilities.tools.map((tool) => {
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: capabilities.tools[0]?.inputSchema?.properties,
            required: [
              ...(Object.keys(
                capabilities.tools[0]?.inputSchema?.properties ?? {}
              ) ?? []),
            ],
            additionalProperties: false,
          },
        },
      };
    });

    return { newClient, isConnected: true, tools: availableTools };
  };

  const isTool = (name: string) => {
    return tools.some((tool) => tool.function.name === name);
  };

  const { newClient, isConnected, tools } = await setupMCPClient();

  const handleToolCall = async (response: {
    name: string;
    arguments: string;
  }) => {
    const toolName = response.name;
    const toolResponse = await callTool(toolName, response.arguments);
    return toolResponse;
  };

  const callTool = async (toolName: string, args: string) => {
    if (isTool(toolName)) {
      const { content } = await newClient.callTool({
        name: toolName,
        arguments: JSON.parse(args),
      });
      return Array.isArray(content) && content.length > 0
        ? content[0].text
        : "No response from the tool.";
    }

    return "Tool not found.";
  };

  // Return public interface
  return {
    handleToolCall,
    callTool,
    client: newClient,
    isConnected,
    tools,
    isTool,
    setupMCPClient,
  };
};

export { createMCPService };
