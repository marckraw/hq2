import { logger } from "@/utils/logger";
import { z } from "@hono/zod-openapi";

// Color schema
export const FigmaColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).optional(),
});

// Fill schema
export const FigmaFillSchema = z.object({
  type: z.string(),
  color: FigmaColorSchema.optional(),
  opacity: z.number().optional(),
  visible: z.boolean().optional(),
});

// Bounding box schema
export const FigmaBoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

// Stroke schema
export const FigmaStrokeSchema = z.object({
  type: z.string().optional(),
  color: FigmaColorSchema.optional(),
  opacity: z.number().optional(),
  weight: z.number().optional(),
});

// Effect schema (for shadows, blurs, etc.)
export const FigmaEffectSchema = z.object({
  type: z.string(),
  visible: z.boolean().optional(),
  radius: z.number().optional(),
  color: FigmaColorSchema.optional(),
  offset: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  spread: z.number().optional(),
});

// Style schema
export const FigmaStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.number().optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.number().optional(),
  textAlign: z.enum(["left", "center", "right", "justified"]).optional(),
  fills: z.array(FigmaFillSchema).optional(),
});

// Define the interface first to avoid circular reference
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  characters?: string;
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL";
  itemSpacing?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  fills?: z.infer<typeof FigmaFillSchema>[];
  strokes?: z.infer<typeof FigmaStrokeSchema>[];
  effects?: z.infer<typeof FigmaEffectSchema>[];
  style?: z.infer<typeof FigmaStyleSchema>;
  cornerRadius?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  absoluteBoundingBox?: z.infer<typeof FigmaBoundingBoxSchema>;
  relativeTransform?: number[][];
  visible?: boolean;
  opacity?: number;
  locked?: boolean;
  [key: string]: any;
}

// Recursive Figma node schema using the interface
// TODO: fix this
// @ts-ignore
export const FigmaNodeSchema: z.ZodType<FigmaNode> = z.lazy(() =>
  z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      children: z.array(FigmaNodeSchema).optional(),
      characters: z.string().optional(),
      layoutMode: z.enum(["NONE", "HORIZONTAL", "VERTICAL"]).optional(),
      itemSpacing: z.number().optional(),
      paddingTop: z.number().optional(),
      paddingBottom: z.number().optional(),
      paddingLeft: z.number().optional(),
      paddingRight: z.number().optional(),
      paddingHorizontal: z.number().optional(),
      paddingVertical: z.number().optional(),
      fills: z.array(FigmaFillSchema).optional(),
      strokes: z.array(FigmaStrokeSchema).optional(),
      effects: z.array(FigmaEffectSchema).optional(),
      style: FigmaStyleSchema.optional(),
      cornerRadius: z.number().optional(),
      cornerRadiusTopLeft: z.number().optional(),
      cornerRadiusTopRight: z.number().optional(),
      cornerRadiusBottomLeft: z.number().optional(),
      cornerRadiusBottomRight: z.number().optional(),
      absoluteBoundingBox: FigmaBoundingBoxSchema.optional(),
      relativeTransform: z.array(z.array(z.number())).optional(),
      visible: z.boolean().optional(),
      opacity: z.number().optional(),
      locked: z.boolean().optional(),
      // Allow additional properties for flexibility
    })
    .catchall(z.any())
);

// Figma file metadata schema
export const FigmaFileMetadataSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  version: z.string().optional(),
});

// Figma page schema
export const FigmaPageSchema = z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(FigmaNodeSchema).optional(),
});

// Complete Figma file schema
export const FigmaFileSchema = z.object({
  document: z.object({
    id: z.string(),
    name: z.string(),
    type: z.literal("DOCUMENT"),
    children: z.array(FigmaPageSchema),
  }),
  metadata: FigmaFileMetadataSchema.optional(),
  styles: z.record(z.any()).optional(),
  components: z.record(z.any()).optional(),
});

// Figma error schema
export const FigmaErrorSchema = z.object({
  status: z.number(),
  err: z.string(),
  message: z.string().optional(),
});

// Inferred types
export type FigmaColor = z.infer<typeof FigmaColorSchema>;
export type FigmaFill = z.infer<typeof FigmaFillSchema>;
export type FigmaBoundingBox = z.infer<typeof FigmaBoundingBoxSchema>;
export type FigmaStroke = z.infer<typeof FigmaStrokeSchema>;
export type FigmaEffect = z.infer<typeof FigmaEffectSchema>;
export type FigmaStyle = z.infer<typeof FigmaStyleSchema>;
export type FigmaFileMetadata = z.infer<typeof FigmaFileMetadataSchema>;
export type FigmaPage = z.infer<typeof FigmaPageSchema>;
export type FigmaFile = z.infer<typeof FigmaFileSchema>;
export type FigmaError = z.infer<typeof FigmaErrorSchema>;

// Validation helpers with graceful error handling
export const validateFigmaNode = (
  data: unknown
): { success: true; data: FigmaNode } | { success: false; error: string } => {
  const result = FigmaNodeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("Figma node validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};

export const validateFigmaFile = (
  data: unknown
): { success: true; data: FigmaFile } | { success: false; error: string } => {
  const result = FigmaFileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("Figma file validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};
