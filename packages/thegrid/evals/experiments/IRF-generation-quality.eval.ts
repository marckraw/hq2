import { evalite } from "evalite";
import { createConfigurableAgent } from "../../src/agent/factories/configurable-agent.factory";
import {
  handleBeforeAct,
  handleOnError,
  handleTransformOutput,
  handleValidateResponse,
} from "../../src/agent/factories/IRFArchitectAgent/handlers";
import { irfArchitectAgentConfig } from "../../src/agent/factories/IRFArchitectAgent/irf-architect.config";
import { createLLMService } from "../../src/domains/ai/services/LLMService/llm.service";
import { serviceRegistry } from "../../src/registry/service-registry";
import { ComponentPresence, DesignIntentMatch, IRFValidation } from "../scorers";

// Import IRF services
import { assetService } from "../../src/domains/irf/services/AssetService/asset.service";
import { designIntentMapperService } from "../../src/domains/irf/services/DesignIntentMapperService/design-intent-mapper.service";
import { createIRFToStoryblokService } from "../../src/domains/irf/services/IRFToStoryblokService/irf-to-storyblok.service";
import { createIRFTraversingService } from "../../src/domains/irf/services/IRFTraversingService/irf-traversing.service";
import { storyblokDesignToIRFService } from "../../src/domains/irf/services/StoryblokDesignToIRFService/storyblok-design-to-irf.service";
import { createStoryblokToIRFService } from "../../src/domains/irf/services/StoryblokToIRFService/storyblok-to-irf.service";
import { registerLangfuseService } from "../utils";

// Register all required services
const registerRequiredServices = () => {
  // Register LLM service
  serviceRegistry.register("llm", () => createLLMService({ dangerouslyAllowBrowser: true }));

  // Register IRF services
  serviceRegistry.registerLazy("designIntentMapper", () => designIntentMapperService);
  serviceRegistry.registerLazy("storyblokDesignToIRF", () => storyblokDesignToIRFService);
  serviceRegistry.registerLazy("asset", () => assetService);
  serviceRegistry.registerLazy("irfToStoryblok", createIRFToStoryblokService);
  serviceRegistry.registerLazy("storyblokToIRF", createStoryblokToIRFService);
  serviceRegistry.registerLazy("irfTraversing", createIRFTraversingService);
};

evalite("IRF Generation Quality", {
  // A function that returns an array of test data
  // - TODO: Replace with your test data
  data: async () => {
    return [
      {
        input: "Create a hero section with blue headline and image",
        expected: {
          hasPage: true,
          hasSection: true,
          hasHeadline: true,
          hasImage: true,
          hasDesignIntent: true,
        },
      },
    ];
  },
  // The task to perform
  // - TODO: Replace with your LLM call
  task: async (input) => {
    // Register all required services
    registerLangfuseService();
    registerRequiredServices();

    // Create IRF architect agent directly without using the factory
    const customHandlers = {
      beforeAct: handleBeforeAct,
      validateResponse: handleValidateResponse,
      transformOutput: handleTransformOutput,
      onError: handleOnError,
    };

    const agent = createConfigurableAgent({
      config: irfArchitectAgentConfig,
      customHandlers,
    });

    const result = await agent.act({
      messages: [{ role: "user", content: input }],
    });

    return result.content as string;
  },
  // The scoring methods for the eval
  scorers: [IRFValidation, ComponentPresence, DesignIntentMatch],
});
