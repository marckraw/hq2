import { createMCPService } from "../../../services/atoms/MCPService/mcp.service";

const createMCPServersFactory = () => {
  const createMCPServers = async () => {
    // for now, lets not create this servers - its making it suuuper slow
    const localExampleMCPServer = await createMCPService({
      mcpSSEUrl: "http://localhost:3020",
      serverName: "mcp-example-express",
      transportType: "sse",
    });

    const filesystemAnthropicMCPServer = await createMCPService({
      transportArgs: {
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "/Users/marckraw/Desktop",
          "/Users/marckraw/Downloads",
        ],
      },
      serverName: "some-other-mcp-server-stdio",
      transportType: "stdio",
    });

    return { localExampleMCPServer, filesystemAnthropicMCPServer };
  };

  const createFigmaMCPServiceClient = async () => {
    const figmaMCPServiceClient = await createMCPService({
      mcpSSEUrl: "https://figma-context-mcp-production-a90a.up.railway.app",
      serverName: "figma-context-mcp",
      transportType: "sse",
    });

    return figmaMCPServiceClient;
  };

  // Return public interface
  return {
    createMCPServers,
    createFigmaMCPServiceClient,
  };
};

const mcpServersFactory = createMCPServersFactory();

export { mcpServersFactory, createMCPServersFactory };
