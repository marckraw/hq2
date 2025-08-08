import type { Scorer } from "autoevals";
import { evalite } from "evalite";
import { identifyRelevantComponents } from "../../src/agent/factories/IRFArchitectAgent/handlers";
import { createLLMService } from "../../src/domains/ai/services/LLMService/llm.service";
import { serviceRegistry } from "../../src/registry/service-registry";
import { registerLangfuseService } from "../utils";

// Register LLM service
const registerLLMService = () => {
  if (!serviceRegistry.has("llm")) {
    serviceRegistry.register("llm", () => createLLMService({ dangerouslyAllowBrowser: true }));
  }
};

// Custom scorer for component arrays
const ComponentArrayScorer: Scorer<any, {}> = async ({ output, expected }) => {
  try {
    const components = Array.isArray(output) ? output : [];

    // Must include all expected components
    const missingRequired = expected.expectedComponents.filter((comp: string) => !components.includes(comp));

    // Should not include forbidden components
    const includedForbidden = expected.forbiddenComponents
      ? expected.forbiddenComponents.filter((comp: string) => components.includes(comp))
      : [];

    // Calculate score - perfect score only if no missing required and no forbidden included
    const score = missingRequired.length === 0 && includedForbidden.length === 0 ? 1 : 0;

    return {
      name: "ComponentIdentification",
      score,
      details: {
        identifiedComponents: components,
        missingRequired,
        includedForbidden,
        totalIdentified: components.length,
      },
    };
  } catch (error) {
    return {
      name: "ComponentIdentification",
      score: 0,
      details: { error: "Failed to process output" },
    };
  }
};

evalite("LLM Component Identification - Advanced Cases", {
  data: async () => {
    return [
      // 1. FAQ Section - should map to accordion
      {
        input: "Create a FAQ section with expandable questions and answers",
        expected: {
          expectedComponents: ["accordion"],
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 2. Customer testimonials - should identify blockquote
      {
        input: "Add customer testimonials with quotes",
        expected: {
          expectedComponents: ["blockquote"],
          forbiddenComponents: ["text", "alert"],
        },
      },

      // 3. Navigation menu - should use list
      {
        input: "Create a navigation menu with multiple links",
        expected: {
          expectedComponents: ["list"],
          forbiddenComponents: ["table", "accordion"],
        },
      },

      // 4. Product grid - should use layout components
      {
        input: "Build a product showcase in a grid layout",
        expected: {
          expectedComponents: ["section"], // At minimum should identify sections
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 5. Warning message - should identify alert
      {
        input: "Show an error notification with warning message",
        expected: {
          expectedComponents: ["alert"],
          forbiddenComponents: ["blockquote", "text"],
        },
      },

      // 6. Data comparison - should identify table
      {
        input: "Display a feature comparison chart between plans",
        expected: {
          expectedComponents: ["table"],
          forbiddenComponents: ["list", "blockquote"],
        },
      },

      // 7. Article content - should identify content components
      {
        input: "Create an article with title and body paragraphs",
        expected: {
          expectedComponents: ["headline", "text"],
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 8. Visual separator
      {
        input: "Add a horizontal line to separate content sections",
        expected: {
          expectedComponents: ["divider"],
          forbiddenComponents: ["text", "headline"],
        },
      },

      // 9. Image gallery
      {
        input: "Create a photo gallery with multiple images",
        expected: {
          expectedComponents: ["image"],
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 10. Company information display
      {
        input: "Display company contact information and address",
        expected: {
          expectedComponents: ["text"], // Basic text display
          forbiddenComponents: ["table", "alert"],
        },
      },
    ];
  },

  task: async (input: string) => {
    registerLangfuseService();
    registerLLMService();

    // Use the production utility function directly
    const components = await identifyRelevantComponents(input, {
      tags: ["component-identification-advanced-eval"],
    });

    return components;
  },

  scorers: [ComponentArrayScorer],
});
