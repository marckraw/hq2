/**
 *
 * This is the core IRF schema, that defines the structure of the IRF and its nodes and nesting capabilities.
 * It is used to validate the IRF, and to generate the IRF for a page layout.
 *
 * Whenever we add additional component support, or any other extension to the schema validation
 * we should modify this file with changes. It is then used by Master prompt and help LLMs understand the intent.
 *
 */

import { z } from "@hono/zod-openapi";
import { IntermediateNode } from "./schema.types";
import { designIntentSchema } from "./services/DesignIntentMapperService/design-intent";

// AI Insights Schema
export const aiInsightsSchema = z.object({
  confidence: z.number().min(0).max(1), // 0-1 scale of how confident the AI is about the analysis
  suggestedType: z.string(), // AI's suggestion for what type this node should be
  reasoning: z.string(), // AI's explanation for why it thinks this
  semanticMeaning: z.string().optional(), // What the AI thinks this component represents semantically
  designPatterns: z.array(z.string()).optional(), // Design patterns the AI recognizes
  accessibility: z
    .object({
      concerns: z.array(z.string()),
      suggestions: z.array(z.string()),
    })
    .optional(),
  complexity: z.enum(["simple", "moderate", "complex"]), // AI's assessment of component complexity
  userExperience: z.string().optional(), // AI's thoughts on UX implications
  alternativeTypes: z.array(z.string()).optional(), // Other types the AI considered
});

/**
 * List of potential node / component names / types
 * should be extendded when add new type support
 * this are our knownTypes, that are supported by the IRF Architect Agent.
 */
export const INTERMEDIATE_NODE_TYPES = [
  "page",
  "section",
  "text",
  "image",
  "headline",
  "list",
  "list-item",
  "divider",
  "header",
  "footer",
  "editorial-card",
  "group",
  "shape",
  "flex-group",
  "accordion",
  "accordion-item",
  "blockquote",
  "table",
  "table-row",
  "table-cell",
  "alert",
  "button-group",
  "button",
  "drawer",
  /**
   *
   * TODO: nodes below are not yet supported, do not touch for now.
   *
   */
  // "instance",
  // "banner",
  // "carousel",
  // "carousel-item",
  // "video",
  // "link",
  // "cta-card",
  // "link-with-arrow",
  // "button",
  // "input",
  // "select",
  // "checkbox",
  // "radio",
  // "switch",
  // "slider",
] as const;

export const intermediateNodeType = z.enum(INTERMEDIATE_NODE_TYPES);

// Slot Definition Schema - defines a single slot in a component
export const slotDefinitionSchema = z.object({
  description: z.string(), // What this slot is for
  allowedChildren: z.array(intermediateNodeType), // Which node types can go in this slot
  required: z.boolean().default(false), // Whether this slot must have content
  maxItems: z.number().nullable().optional(), // Maximum number of items (null = unlimited)
  minItems: z.number().default(0), // Minimum number of items
});

// Slots Registry Schema - defines all slots for a component
export const allowedNamedSlotsSchema = z.record(
  z.string(),
  slotDefinitionSchema
);

// Intermediate Node Schema Base
export const intermediateNodeBaseSchema = z.object({
  type: intermediateNodeType,
  name: z.string(),
  props: z.record(z.any()).optional(),
  design: designIntentSchema.optional(),
  parentNodeName: z.string().optional(),
  parentNodeTypeName: intermediateNodeType.optional(),
  componentKey: z.string().optional(),
  meta: z.record(z.any()).optional(),
  aiInsights: aiInsightsSchema.optional(), // AI analysis of the node
});

// Intermediate Node Schema (recursive) - using lazy pattern
export const intermediateNodeSchema: z.ZodType<IntermediateNode> =
  intermediateNodeBaseSchema.extend({
    children: z.lazy(() => z.array(intermediateNodeSchema)).optional(),
    // Named slots for components that need multiple content areas
    // Each slot contains an array of nodes
    slots: z
      .lazy(() => z.record(z.string(), z.array(intermediateNodeSchema)))
      .optional(),
  });

// Intermediate Layout Schema
export const intermediateLayoutSchema = z.object({
  version: z.literal("1.0"),
  name: z.string(),
  content: z.array(intermediateNodeSchema),
  globalVars: z
    .object({
      styles: z.record(z.any()).optional(),
    })
    .catchall(z.any())
    .optional(),
});
