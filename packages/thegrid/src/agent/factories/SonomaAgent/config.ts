import { type AgentMetadata, createAgentConfig } from "@mrck-labs/grid-core";
import { generalAgentConfig } from "../GeneralAgent/general.config";

export const sonomaMetadata: AgentMetadata = {
  id: "sonoma",
  // underlying type must satisfy grid-core enum
  type: "general",
  name: "Sonoma Assistant",
  description: "Experimental assistant with an alternative system prompt.",
  capabilities: ["planning", "memory_search", "result_synthesis"],
  icon: "🫧",
  version: "0.1.0",
  author: "System",
} as any;

export const sonomaConfig = createAgentConfig({
  id: "sonoma",
  type: "general",
  version: "0.1.0",
  metadata: sonomaMetadata,
  prompts: {
    system: `My name is Sonoma. Amazing agent!`,
    errorCorrection: "If you encounter an error, try alternative approaches or tools to complete the task.",
    fallback: "I apologize, but I'm unable to complete that task with the available tools and information.",
  },
  behavior: generalAgentConfig.behavior,
  tools: generalAgentConfig.tools,
  hooks: generalAgentConfig.hooks,
  orchestration: generalAgentConfig.orchestration,
  features: generalAgentConfig.features,
  customConfig: generalAgentConfig.customConfig,
});
