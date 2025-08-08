import { serviceRegistry } from "../../../registry/service-registry";

// ✅ Modern ES module imports with proper types
import { createLLMService } from "./LLMService/llm.service";
import { conversationService } from "./ConversationService/conversation.service";
import { decisionMakerService } from "./DecisionMakerService/decision-maker.service";
import { langfuseService } from "@mrck-labs/grid-core";

import type { LLMService } from "./LLMService/llm.service";
import type { ConversationService } from "./ConversationService/conversation.service";
import type { DecisionMakerService } from "./DecisionMakerService/decision-maker.service";
import type { LangfuseService } from "@mrck-labs/grid-core";

// Register AI services
const registerAIServices = () => {
  // ✅ Register LLM service (eager loading - core service)
  serviceRegistry.register("llm", () => createLLMService({ dangerouslyAllowBrowser: false }));

  // TODO: Register other AI services
  serviceRegistry.register("conversation", () => conversationService);
  serviceRegistry.register("decisionMaker", () => decisionMakerService);
  serviceRegistry.register("langfuse", () => langfuseService);
};

// Domain-specific service accessors (functional style)
const createAIServices = () => {
  return {
    llm: () => createLLMService({ dangerouslyAllowBrowser: false }),
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
