import { z } from "@hono/zod-openapi";
import { SimplifiedFigmaNode } from "./transformer.service.types";
import {
  intermediateLayoutSchema,
  intermediateNodeType,
} from "../../../../domains/irf/schema";

// Simplified Figma Node Schema (recursive) - using explicit typing
const simplifiedFigmaNodeBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  componentId: z.string().optional(),
  componentProperties: z.record(z.any()).optional(),
  text: z.string().optional(),
  textStyle: z.string().optional(),
  fills: z.union([z.string(), z.array(z.any())]).optional(),
  layout: z.any().optional(),
  borderRadius: z.string().optional(),
});

export const simplifiedFigmaNodeSchema: z.ZodType<SimplifiedFigmaNode> =
  simplifiedFigmaNodeBaseSchema.extend({
    children: z.lazy(() => z.array(simplifiedFigmaNodeSchema)).optional(),
  });

// Simplified Figma Response Schema
export const simplifiedFigmaResponseSchema = z.object({
  metadata: z.object({
    name: z.string(),
    lastModified: z.string(),
    components: z.record(z.any()).optional(),
    componentSets: z.record(z.any()).optional(),
    fileKey: z.string().optional(),
    nodeId: z.string().optional(),
  }),
  nodes: z.array(simplifiedFigmaNodeSchema),
  globalVars: z
    .object({
      styles: z.record(z.any()).optional(),
    })
    .optional(),
});

// Recognizer Context Schema
export const recognizerContextSchema = z.object({
  componentIdMap: z.record(z.string()), // e.g. { "1:641": "editorial-card" }
  knownTypes: z.array(intermediateNodeType), // all valid component types
  globalVars: z.record(z.any()).optional(), // global styles and variables
});

// Transformation Result Schema
export const transformationResultSchema = z.object({
  success: z.boolean(),
  layout: intermediateLayoutSchema,
  metadata: z.object({
    sourceFile: z.string(),
    transformedAt: z.string(),
    nodeCount: z.number(),
    componentCount: z.number(),
    fileKey: z.string().optional(),
    nodeId: z.string().optional(),
  }),
  errors: z.array(z.string()).optional(),
});

// Transformation Options Schema
export const transformationOptionsSchema = z.object({
  includeHiddenLayers: z.boolean().optional(),
  preserveNaming: z.boolean().optional(),
  useAIFallback: z.boolean().optional(),
  customMappings: z.record(z.string()).optional(),
  enableAIInsights: z.boolean().optional(), // Enable/disable AI insights generation
});
