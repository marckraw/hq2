import type { Tool } from "@mrck-labs/grid-core";
import { userLogger } from "../../../utils/logger";

/**
 * Unified tool registry using closure pattern
 * Only supports tools created with createNamedTool
 */
export const createToolRegistry = () => {
  const tools = new Map<string, Tool>();

  const register = (tool: Tool): void => {
    if (!tool.name || !tool.description || !tool.execute) {
      throw new Error("Invalid tool: must have name, description, and execute function");
    }
    userLogger.log(`[toolRegistry] 📝 Registering tool: ${tool.name}`);
    tools.set(tool.name, tool);
  };

  const execute = async (name: string, args: any): Promise<any> => {
    const tool = tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found in registry`);
    }

    if (!tool.execute) {
      throw new Error(`Tool ${name} has no execute function`);
    }

    userLogger.log(`[toolRegistry] 🔧 Executing tool: ${name}`);
    // Tools from createNamedTool expect (args, options)
    // Create minimal options to satisfy the interface
    const options = {
      toolCallId: `call_${Date.now()}`,
      messages: []
    };
    return tool.execute(args, options);
  };

  const has = (name: string): boolean => {
    return tools.has(name);
  };

  const getDefinitions = () => {
    return Array.from(tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description || "",
      parameters: tool.parameters
    }));
  };

  const getToolNames = (): string[] => {
    return Array.from(tools.keys());
  };

  const clear = (): void => {
    tools.clear();
  };

  return {
    register,
    execute,
    has,
    getDefinitions,
    getToolNames,
    clear
  };
};

// Create singleton instance
export const toolRegistry = createToolRegistry();