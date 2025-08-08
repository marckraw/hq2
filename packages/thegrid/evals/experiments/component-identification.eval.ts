import type { Scorer } from "autoevals";
import { evalite } from "evalite";
import { identifyRelevantComponents } from "../../src/agent/factories/IRFArchitectAgent/handlers";
import { registerLangfuseService, registerLLMService } from "../utils";

// Custom scorer for component arrays (not JSON strings)
const ComponentArrayScorer: Scorer<any, {}> = async ({ output, expected }) => {
  try {
    const components = Array.isArray(output) ? output : JSON.parse(output).components || [];

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

evalite("LLM Component Identification", {
  data: async () => {
    return [
      {
        input: "Create a hero section with headline and image",
        expected: {
          expectedComponents: ["section", "headline", "image"],
          forbiddenComponents: ["table", "alert"],
        },
      },
      {
        input: "Build a contact form layout with text sections",
        expected: {
          expectedComponents: ["section", "text"],
          forbiddenComponents: ["table", "blockquote"],
        },
      },
      {
        input: "Add a pricing table with multiple columns",
        expected: {
          expectedComponents: ["table"],
          forbiddenComponents: ["blockquote", "alert"],
        },
      },
      {
        input: "Create a content section with divider",
        expected: {
          expectedComponents: ["section", "divider"],
          forbiddenComponents: ["table", "alert"],
        },
      },
      {
        input: "Create a text section with paragraph content",
        expected: {
          expectedComponents: ["text", "section"],
          forbiddenComponents: ["table", "alert"],
        },
      },
      {
        input: "Design a gallery with multiple images",
        expected: {
          expectedComponents: ["image"],
          forbiddenComponents: ["table", "alert"],
        },
      },
      {
        input: "Add an alert notification message",
        expected: {
          expectedComponents: ["alert"],
          forbiddenComponents: ["table", "blockquote"],
        },
      },
      {
        input: "Include a blockquote with author citation",
        expected: {
          expectedComponents: ["blockquote"],
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
      tags: ["component-identification-eval"],
    });

    return components; // Return array directly
  },

  scorers: [ComponentArrayScorer],
});
