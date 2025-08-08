import type { IntermediateNodeType } from "@/domains/irf/schema.types";
import { zodIntrospectionService } from "@/domains/irf/services/ZodIntrospectionService/zod-introspection.service";

/**
 * Generates the component identification prompt used by the LLM
 * to filter relevant components based on user request.
 *
 * Used both in production (handleBeforeAct) and evaluations.
 */
export const createComponentIdentificationPrompt = (
  userMessage: string
): string => {
  const availableComponents =
    zodIntrospectionService.getAvailableNodeTypes() as IntermediateNodeType[];

  return `
Available components in the system:
${availableComponents.map((comp) => `- ${comp}: ${zodIntrospectionService.getNodeSchemaInfo(comp)?.description}`).join("\n")}

User request: "${userMessage}"

You are an expert at identifying UI components. Which components from the available list are needed for this request?

Focus on visual UI elements only. For non-UI requests (like styling, backend tasks, or SEO), return an empty array.

Return a JSON object with a "components" array containing the relevant component names.

Examples:
- "Create a hero section with headline and image" → {"components": ["section", "headline", "image"]}
- "Add customer testimonials with quotes" → {"components": ["blockquote"]}
- "Make everything blue" → {"components": []}

Response format: {"components": ["component1", "component2"]}
  `.trim();
};
