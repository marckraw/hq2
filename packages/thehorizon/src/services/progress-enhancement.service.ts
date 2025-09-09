import type { ToolDisplayConfig, EnhancedProgressMessage, AgentSuggestion, ProgressMessage } from "core.mrck.dev";

// Tool display configurations
const TOOL_CONFIGS: Record<string, ToolDisplayConfig> = {
  create_image: {
    name: "create_image",
    userFriendlyName: "Image Generation",
    description: "Creating a custom image based on your description",
    estimatedTime: "15-30 seconds",
    icon: "🎨",
    phase: "working",
    requiresConfirmation: false,
  },
  read_url: {
    name: "read_url",
    userFriendlyName: "Web Content Reading",
    description: "Reading and analyzing webpage content",
    estimatedTime: "5-10 seconds",
    icon: "🔍",
    phase: "working",
    requiresConfirmation: false,
  },
  analyze_youtube_video: {
    name: "analyze_youtube_video",
    userFriendlyName: "YouTube Analysis",
    description: "Analyzing YouTube video content and transcription",
    estimatedTime: "20-45 seconds",
    icon: "📺",
    phase: "working",
    requiresConfirmation: false,
  },
  get_figma_data: {
    name: "get_figma_data",
    userFriendlyName: "Figma Data Retrieval",
    description: "Fetching design data from Figma",
    estimatedTime: "10-20 seconds",
    icon: "🎨",
    phase: "working",
    requiresConfirmation: false,
  },
  save_memory: {
    name: "save_memory",
    userFriendlyName: "Memory Storage",
    description: "Saving important information for future reference",
    estimatedTime: "2-5 seconds",
    icon: "🧠",
    phase: "finalizing",
    requiresConfirmation: false,
  },
  compose_plan: {
    name: "compose_plan",
    userFriendlyName: "Planning",
    description: "Creating a structured plan for your request",
    estimatedTime: "5-15 seconds",
    icon: "📋",
    phase: "understanding",
    requiresConfirmation: false,
  },
  evaluate_response: {
    name: "evaluate_response",
    userFriendlyName: "Quality Check",
    description: "Evaluating the response quality and completeness",
    estimatedTime: "3-8 seconds",
    icon: "✅",
    phase: "finalizing",
    requiresConfirmation: false,
  },
};

// Agent suggestions based on user input patterns
const AGENT_SUGGESTIONS: AgentSuggestion[] = [
  {
    trigger: "figma|design|component|storyblok",
    suggestedAgent: "figma-to-storyblok",
    reason: "I can help transform Figma designs into Storyblok components",
    confidence: 0.9,
  },
  {
    trigger: "image|picture|photo|generate.*visual|create.*image",
    suggestedAgent: "general",
    reason: "I have access to powerful image generation tools",
    confidence: 0.8,
  },
  {
    trigger: "youtube|video|transcribe|analyze.*video",
    suggestedAgent: "general",
    reason: "I can analyze YouTube videos and extract their content",
    confidence: 0.85,
  },
  {
    trigger: "url|website|webpage|read.*site|scrape",
    suggestedAgent: "general",
    reason: "I can read and analyze web content for you",
    confidence: 0.8,
  },
  {
    trigger: "write|content|article|blog|document",
    suggestedAgent: "general",
    reason: "General assistant can help with content creation",
    confidence: 0.85,
  },
  {
    trigger: "rephrase|rewrite|improve.*text|better.*wording",
    suggestedAgent: "rephraser",
    reason: "I focus on improving text clarity and readability",
    confidence: 0.9,
  },
];

const createProgressEnhancementService = () => {
  /**
   * Extract tool name from various message formats
   */
  const extractToolName = (message: ProgressMessage): string | null => {
    // From metadata
    if (message.metadata?.functionName) {
      return message.metadata.functionName;
    }

    // From content patterns
    const content = message.content.toLowerCase();

    // Pattern: "agent executing: tool_name"
    const executingMatch = content.match(/executing[:\s]+([a-z_]+)/);
    if (executingMatch) {
      return executingMatch[1] || null;
    }

    // Pattern: "tool_name execution"
    const toolMatch = content.match(/([a-z_]+)\s+execution/);
    if (toolMatch) {
      return toolMatch[1] || null;
    }

    return null;
  };

  /**
   * Extract tool arguments from message metadata
   */
  const extractToolArgs = (message: ProgressMessage): Record<string, any> => {
    try {
      if (message.metadata?.toolCallArguments) {
        return typeof message.metadata.toolCallArguments === "string"
          ? JSON.parse(message.metadata.toolCallArguments)
          : message.metadata.toolCallArguments;
      }
    } catch (error) {
      console.warn("Failed to parse tool arguments:", error);
    }
    return {};
  };

  /**
   * Generate user-friendly content for tool execution
   */
  const generateToolExecutionMessage = (toolName: string, args: Record<string, any>): string => {
    const config = TOOL_CONFIGS[toolName];
    if (!config) {
      return `🔧 Working on ${toolName.replace(/_/g, " ")}...`;
    }

    switch (toolName) {
      case "create_image": {
        const prompt = args.prompt || args.description || "your image";
        const shortPrompt = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;
        return `${config.icon} Creating "${shortPrompt}"...`;
      }

      case "read_url": {
        const url = args.url || "";
        const domain = url ? new URL(url).hostname.replace("www.", "") : "the webpage";
        return `${config.icon} Reading content from ${domain}...`;
      }

      case "analyze_youtube_video":
        return `${config.icon} Analyzing that YouTube video...`;

      case "get_figma_data":
        return `${config.icon} Fetching your Figma design...`;

      case "save_memory":
        return `${config.icon} Saving this information for later...`;

      case "compose_plan":
        return `${config.icon} Creating a plan for your request...`;

      case "evaluate_response":
        return `${config.icon} Checking response quality...`;

      default:
        return `${config.icon} ${config.description}...`;
    }
  };

  /**
   * Generate user-friendly content for tool response
   */
  const generateToolResponseMessage = (toolName: string, success: boolean = true): string => {
    const config = TOOL_CONFIGS[toolName];
    if (!config) {
      return success ? `✅ ${toolName.replace(/_/g, " ")} completed` : `❌ ${toolName.replace(/_/g, " ")} failed`;
    }

    if (success) {
      switch (toolName) {
        case "create_image":
          return `${config.icon} Image created successfully!`;
        case "read_url":
          return `${config.icon} Content extracted and analyzed`;
        case "analyze_youtube_video":
          return `${config.icon} Video analysis complete`;
        case "get_figma_data":
          return `${config.icon} Figma data retrieved`;
        case "save_memory":
          return `${config.icon} Information saved to memory`;
        case "compose_plan":
          return `${config.icon} Plan created`;
        case "evaluate_response":
          return `${config.icon} Quality check passed`;
        default:
          return `✅ ${config.userFriendlyName} completed`;
      }
    } else {
      return `❌ ${config.userFriendlyName} encountered an issue`;
    }
  };

  /**
   * Main function to enhance progress messages
   */
  const enhanceProgressMessage = (message: ProgressMessage): EnhancedProgressMessage => {
    const toolName = extractToolName(message);
    const toolArgs = extractToolArgs(message);
    const config = toolName ? TOOL_CONFIGS[toolName] : null;

    // Base enhanced message
    const enhanced: EnhancedProgressMessage = {
      ...message,
      userFriendlyContent: message.content,
      phase: config?.phase || "working",
      priority: "medium",
      estimatedDuration: config ? parseInt(config.estimatedTime) || 10 : 10,
      canCollapse: false,
      icon: config?.icon || "🤖",
      toolName: toolName || undefined,
      shouldReplace: false,
    };

    // Enhance based on message type
    switch (message.type) {
      case "tool_execution":
        if (toolName) {
          enhanced.userFriendlyContent = generateToolExecutionMessage(toolName, toolArgs);
          enhanced.shouldReplace = true; // Replace previous tool execution
        }
        break;

      case "tool_response":
        if (toolName) {
          enhanced.userFriendlyContent = generateToolResponseMessage(toolName, true);
          enhanced.icon = "✅";
        }
        break;

      case "thinking":
        enhanced.userFriendlyContent = "🤔 Thinking about your request...";
        enhanced.phase = "understanding";
        enhanced.shouldReplace = true;
        break;

      case "finished":
        enhanced.userFriendlyContent = "🎉 Task completed successfully!";
        enhanced.phase = "finalizing";
        enhanced.icon = "🎉";
        enhanced.progressPercentage = 100;
        break;

      // Note: "error" type will be handled by default case
    }

    return enhanced;
  };

  /**
   * Suggest a better agent based on user input
   */
  const suggestAgent = (userInput: string): AgentSuggestion | null => {
    const lowerInput = userInput.toLowerCase();

    for (const suggestion of AGENT_SUGGESTIONS) {
      const regex = new RegExp(suggestion.trigger, "i");
      if (regex.test(lowerInput)) {
        return suggestion;
      }
    }

    return null;
  };

  /**
   * Get tool configuration
   */
  const getToolConfig = (toolName: string): ToolDisplayConfig | null => {
    return TOOL_CONFIGS[toolName] || null;
  };

  /**
   * Get all tool configurations
   */
  const getAllToolConfigs = (): Record<string, ToolDisplayConfig> => {
    return TOOL_CONFIGS;
  };

  return {
    enhanceProgressMessage,
    suggestAgent,
    getToolConfig,
    getAllToolConfigs,
  };
};

export const progressEnhancementService = createProgressEnhancementService();

export type ProgressEnhancementService = ReturnType<typeof createProgressEnhancementService>;
