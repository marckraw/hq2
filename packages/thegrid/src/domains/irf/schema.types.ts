import { z } from "@hono/zod-openapi";
import {
  aiInsightsSchema,
  allowedNamedSlotsSchema,
  intermediateLayoutSchema,
  intermediateNodeBaseSchema,
  slotDefinitionSchema,
} from "./schema";

// TYPES
export type IntermediateNodeType = z.infer<
  typeof intermediateNodeBaseSchema
>["type"];

/**
 * This type is created manually due to circular references in the
 * intermediateNodeSchema Zod schema. The Zod schema defines a recursive
 * structure for intermediate nodes, which can lead to circular dependencies
 * when inferring types directly. Therefore, we define this interface to
 * maintain type safety while avoiding circular reference issues.
 *
 * instead of:
 * export type IntermediateNode = z.infer<typeof intermediateNodeSchema>;
 */
export interface IntermediateNode {
  type: IntermediateNodeType;
  name: string;
  props?: Record<string, any>;
  design?: Record<string, any>;
  parentNodeName?: string;
  parentNodeTypeName?: IntermediateNodeType;

  // Content organization: Components can have EITHER children OR slots, not both
  // This is determined by the node registry definition
  children?: IntermediateNode[];
  slots?: {
    [slotName: string]: IntermediateNode[];
  };

  componentKey?: string;
  meta?: Record<string, any>;
  aiInsights?: AIInsights;
}

// INFERRED TYPES
export type AIInsights = z.infer<typeof aiInsightsSchema>;
export type IntermediateLayout = z.infer<typeof intermediateLayoutSchema>;
export type SlotDefinition = z.infer<typeof slotDefinitionSchema>;
export type AllowedNamedSlots = z.infer<typeof allowedNamedSlotsSchema>;
