import { createLLMService } from "../src/domains/ai/services/LLMService/llm.service";
import { serviceRegistry } from "../src/registry/service-registry";
import { createLangfuseService } from "@mrck-labs/grid-core";

// Register LLM service
export const registerLLMService = () => {
  if (!serviceRegistry.has("llm")) {
    serviceRegistry.register("llm", () => createLLMService({ dangerouslyAllowBrowser: true }));
  }
};

// Register LLM service
export const registerLangfuseService = () => {
  if (!serviceRegistry.has("langfuse")) {
    serviceRegistry.register("langfuse", () => createLangfuseService());
  }
};
