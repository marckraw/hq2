import { z } from "@hono/zod-openapi";
import {
  simplifiedFigmaResponseSchema,
  recognizerContextSchema,
  transformationResultSchema,
  transformationOptionsSchema,
} from "./transformer.service.schemas";

// Re-export IntermediateNode from IRF schema for convenience
export type { IntermediateNode } from "../../../../domains/irf/schema.types";

export interface SimplifiedFigmaNode {
  id: string;
  name: string;
  type: string;
  children?: SimplifiedFigmaNode[];
  componentId?: string;
  componentProperties?: Record<string, any>;
  text?: string;
  textStyle?: string;
  fills?: string | any[];
  layout?: any;
  borderRadius?: string;
}

// Other inferred types

export type SimplifiedFigmaResponse = z.infer<
  typeof simplifiedFigmaResponseSchema
>;
export type RecognizerContext = z.infer<typeof recognizerContextSchema>;
export type TransformationResult = z.infer<typeof transformationResultSchema>;
export type TransformationOptions = z.infer<typeof transformationOptionsSchema>;
