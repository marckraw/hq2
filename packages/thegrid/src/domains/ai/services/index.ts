import { serviceRegistry } from "../../../registry/service-registry";

// ✅ Modern ES module imports with proper types
import { baseLLMService } from "@mrck-labs/grid-core";
import { conversationService } from "./ConversationService/conversation.service";
import { decisionMakerService } from "./DecisionMakerService/decision-maker.service";
import { langfuseService } from "@mrck-labs/grid-core";

import type { LLMService } from "@mrck-labs/grid-core";
import type { ConversationService } from "./ConversationService/conversation.service";
import type { DecisionMakerService } from "./DecisionMakerService/decision-maker.service";
import type { LangfuseService } from "@mrck-labs/grid-core";

// Register AI services
const registerAIServices = () => {
  // ✅ Register LLM service (eager loading - core service)
  // Initialize Grid-core LLM service
  const llmService = baseLLMService({ toolExecutionMode: "vercel-native" } as any);
  serviceRegistry.register("llm", () => llmService);

  // TODO: Register other AI services
  serviceRegistry.register("conversation", () => conversationService);
  serviceRegistry.register("decisionMaker", () => decisionMakerService);
  serviceRegistry.register("langfuse", () => langfuseService);
};

// Domain-specific service accessors (functional style)
const createAIServices = () => {
  return {
    llm: () => serviceRegistry.get("llm"),
    conversation: () => conversationService,
    decisionMaker: () => decisionMakerService,
    langfuse: () => langfuseService as LangfuseService,
  };
};

// Initialize services on import
registerAIServices();

// Export domain services
export const aiServices = createAIServices();

// Individual exports for convenience
export const { llm, conversation, decisionMaker, langfuse } = aiServices;

// Type exports
export type AIServices = {
  llm: LLMService;
  conversation: ConversationService;
  decisionMaker: DecisionMakerService;
  langfuse: LangfuseService;
};
