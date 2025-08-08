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

evalite("LLM Component Identification - Edge Cases", {
  data: async () => {
    return [
      // 1. Completely empty request
      {
        input: "",
        expected: {
          expectedComponents: [],
          forbiddenComponents: [],
        },
      },

      // 2. Non-English request
      {
        input: "Créer une section avec titre et image", // French
        expected: {
          expectedComponents: ["section", "headline", "image"],
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 3. Technical jargon - should ignore code-related terms
      {
        input: "Implement a React component with useState hook for dynamic rendering",
        expected: {
          expectedComponents: [], // This is about code, not UI components
          forbiddenComponents: [],
        },
      },

      // 4. Contradictory requests
      {
        input: "Add a table but don't use any table components, use text instead",
        expected: {
          expectedComponents: ["text"],
          forbiddenComponents: ["table"],
        },
      },

      // 5. False friends - "card" context matters
      {
        input: "Add credit card payment information",
        expected: {
          expectedComponents: ["text"], // Credit card info = text, not editorial card
          forbiddenComponents: ["editorial-card"],
        },
      },

      // 6. Multiple conflicting interpretations
      {
        input: "Add a header with navigation and alerts",
        expected: {
          expectedComponents: ["header", "alert"],
          forbiddenComponents: ["footer"],
        },
      },

      // 7. Non-UI related request
      {
        input: "Set up database connections and API endpoints",
        expected: {
          expectedComponents: [], // This is backend, not UI
          forbiddenComponents: ["section", "text", "image"],
        },
      },

      // 8. Layout vs Content confusion
      {
        input: "Make the content responsive and mobile-friendly",
        expected: {
          expectedComponents: [], // This is about styling, not adding components
          forbiddenComponents: [],
        },
      },

      // 9. Extremely verbose request - should extract key components
      {
        input:
          "I need a comprehensive solution for displaying customer testimonials in an engaging format that builds trust",
        expected: {
          expectedComponents: ["blockquote"], // Key component: testimonials = blockquote
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 10. Color and styling focused - not component related
      {
        input: "Make everything blue with rounded corners and drop shadows",
        expected: {
          expectedComponents: [], // This is styling, not component structure
          forbiddenComponents: [],
        },
      },

      // 11. SEO/Marketing focused - not visual components
      {
        input: "Optimize the meta tags and schema markup for better search rankings",
        expected: {
          expectedComponents: [], // This is SEO, not visual components
          forbiddenComponents: ["section", "text", "image"],
        },
      },

      // 12. Mixed languages and special characters
      {
        input: "添加一个标题 & Überschrift mit Text", // Chinese + German + English
        expected: {
          expectedComponents: ["headline", "text"],
          forbiddenComponents: ["table", "alert"],
        },
      },

      // 13. Component names that sound like other components
      {
        input: "Create a card table for poker game display",
        expected: {
          expectedComponents: ["table"], // Card table = table, not editorial-card
          forbiddenComponents: ["editorial-card"],
        },
      },

      // 14. Implicit negation
      {
        input: "Show product information without using any tables or lists",
        expected: {
          expectedComponents: ["text"],
          forbiddenComponents: ["table", "list"],
        },
      },

      // 15. Performance/optimization focused - not about adding components
      {
        input: "Lazy load images and defer JavaScript execution",
        expected: {
          expectedComponents: [], // This is about performance, not adding components
          forbiddenComponents: ["section", "text", "headline"],
        },
      },

      // 16. Vague business language
      {
        input: "Increase user engagement and conversion rates",
        expected: {
          expectedComponents: [], // Too vague to identify specific components
          forbiddenComponents: [],
        },
      },

      // 17. Numbers and measurements - should focus on content
      {
        input: "Add a 300x250 banner with 24px font",
        expected: {
          expectedComponents: ["section"], // Banner = section
          forbiddenComponents: ["image", "table"],
        },
      },

      // 18. Time-based or dynamic content
      {
        input: "Display real-time stock prices that update every second",
        expected: {
          expectedComponents: ["text"], // Displaying data = text
          forbiddenComponents: ["image", "blockquote"],
        },
      },

      // 19. Conditional requests - should identify basic components
      {
        input: "If the user is logged in, show their profile, otherwise show a login form",
        expected: {
          expectedComponents: ["text"], // Profile/login info = text
          forbiddenComponents: [],
        },
      },

      // 20. Brand/product specific terms - should generalize
      {
        input: "Add a Shopify checkout widget with PayPal integration",
        expected: {
          expectedComponents: ["section"], // Widget = section
          forbiddenComponents: ["table", "image"],
        },
      },
    ];
  },

  task: async (input: string) => {
    registerLangfuseService();
    registerLLMService();

    // Use the production utility function directly
    const components = await identifyRelevantComponents(input, {
      tags: ["component-identification-edge-cases-eval"],
    });

    return components;
  },

  scorers: [ComponentArrayScorer],
});
