import { logger } from "@/utils/logger";
import { irfValidationService } from "./validation";
import type { IntermediateLayout } from "../../../domains/irf/schema.types";

// Example of a valid IRF layout
const validIRF: IntermediateLayout = {
  version: "1.0",
  name: "Example Layout",
  content: [
    {
      type: "page",
      name: "Home Page",
      children: [
        {
          type: "section",
          name: "Hero Section",
          children: [
            {
              type: "headline",
              name: "Welcome Headline",
            },
            {
              type: "text",
              name: "Welcome Text",
            },
          ],
        },
        {
          type: "section",
          name: "Content Section",
          children: [
            {
              type: "list",
              name: "Features List",
              children: [
                {
                  type: "list-item",
                  name: "Feature 1",
                  children: [
                    {
                      type: "text",
                      name: "Feature 1 Text",
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Feature 2",
                  children: [
                    {
                      type: "text",
                      name: "Feature 2 Text",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  globalVars: {
    styles: {},
  },
};

// Example of an invalid IRF layout (invalid relationships)
const invalidIRF = {
  version: "1.0",
  name: "Invalid Layout",
  content: [
    {
      type: "page",
      name: "Bad Page",
      children: [
        {
          type: "headline", // Headlines can't have children
          name: "Bad Headline",
          children: [
            {
              type: "section", // Section as child of headline is invalid
              name: "Bad Section",
            },
          ],
        },
        {
          type: "list",
          name: "Bad List",
          children: [
            {
              type: "headline", // Headlines can't be in lists
              name: "Bad Headline in List",
            },
          ],
        },
      ],
    },
  ],
};

// Example usage
export function runValidationExamples() {
  logger.info("=== IRF Validation Examples ===\n");

  // Test valid IRF
  logger.info("1. Testing valid IRF layout:");
  const validResult = irfValidationService.validate(validIRF);
  logger.info("Result:", validResult.isValid ? "✅ Valid" : "❌ Invalid");
  if (!validResult.isValid) {
    logger.info(
      "Feedback:",
      irfValidationService.generateFeedback(validResult)
    );
  }

  // Test invalid IRF
  logger.info("2. Testing invalid IRF layout:");
  const invalidResult = irfValidationService.validate(invalidIRF);
  logger.info("Result:", invalidResult.isValid ? "✅ Valid" : "❌ Invalid");
  if (!invalidResult.isValid) {
    logger.info("Feedback:");
    logger.info(irfValidationService.generateFeedback(invalidResult));
  }

  // Test malformed JSON
  logger.info("3. Testing malformed JSON:");
  const malformedResult = irfValidationService.validate({ invalid: true });
  logger.info("Result:", malformedResult.isValid ? "✅ Valid" : "❌ Invalid");
  if (!malformedResult.isValid) {
    logger.info("Feedback:");
    logger.info(irfValidationService.generateFeedback(malformedResult));
  }
}

// Usage examples for the agent
export const examplePrompts = [
  "Generate a layout with a page containing a hero section with headline and text",
  "Create a layout with sections containing lists and list items",
  "Build a page with multiple sections, each having headlines and editorial cards",
  "Generate a complex layout with carousels, banners, and interactive elements",
];

// Run examples if this file is executed directly
if (require.main === module) {
  runValidationExamples();
}
