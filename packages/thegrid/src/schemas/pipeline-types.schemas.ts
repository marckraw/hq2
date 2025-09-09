import { z } from "@hono/zod-openapi";
import { BasePipelineSchema, BasePipelineStepSchema } from "./base.schemas";

// =============================================================================
// PIPELINE TYPE-SPECIFIC METADATA SCHEMAS
// =============================================================================

/**
 * Figma to Storyblok Pipeline Metadata
 */
export const FigmaToStoryblokMetadataSchema = z.object({
  figmaFileName: z.string(),
  storyName: z.string(),
  storySlug: z.string(),
  componentCount: z.number(),
  nodeCount: z.number(),
  irfResult: z.unknown(),
  finalStoryblokStory: z.unknown(),
  originalStoryblokId: z.string().optional(), // For updates
});

/**
 * Storyblok Editor Pipeline Metadata
 */
export const StoryblokEditorMetadataSchema = z.object({
  originalStoryblok: z.unknown(),
  irf: z.unknown(),
  editedStoryblok: z.unknown(),
  transformationTime: z.string(),
  originalComponentCount: z.number(),
  finalComponentCount: z.number(),
  storyName: z.string(),
  storySlug: z.string(),
});

/**
 * IRF Architect Pipeline Metadata
 */
export const IRFArchitectMetadataSchema = z.object({
  inputFiles: z.array(z.string()),
  outputFiles: z.array(z.string()),
  transformationRules: z.array(z.unknown()),
  architectureType: z.string(),
  complexityScore: z.number().optional(),
});

// =============================================================================
// PIPELINE TYPE DISCRIMINATED UNIONS
// =============================================================================

/**
 * Pipeline Type Discriminated Union Schema
 */
export const PipelineTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("figma-to-storyblok"),
    source: z.literal("figma-to-storyblok"),
    metadata: FigmaToStoryblokMetadataSchema,
  }),
  z.object({
    type: z.literal("storyblok-editor"),
    source: z.literal("storyblok-editor"),
    metadata: StoryblokEditorMetadataSchema,
  }),
  z.object({
    type: z.literal("irf-architect"),
    source: z.literal("irf-architect"),
    metadata: IRFArchitectMetadataSchema,
  }),
]);

/**
 * Complete Pipeline Schema - Base + Type-specific
 */
export const PipelineSchema = BasePipelineSchema.and(PipelineTypeSchema);

/**
 * Pipeline Step Type-specific Metadata
 */
export const PipelineStepMetadataSchema = z.union([
  // Transformation step metadata
  z.object({
    stepType: z.literal("transformation"),
    inputData: z.unknown(),
    outputData: z.unknown(),
    transformationRules: z.array(z.unknown()).optional(),
  }),
  // Approval step metadata
  z.object({
    stepType: z.literal("approval"),
    approvalType: z.string(),
    requiresHumanApproval: z.boolean(),
    riskLevel: z.enum(["low", "medium", "high"]),
  }),
  // Notification step metadata
  z.object({
    stepType: z.literal("notification"),
    channels: z.array(z.string()),
    message: z.string(),
    recipients: z.array(z.string()).optional(),
  }),
  // Publication step metadata
  z.object({
    stepType: z.literal("publication"),
    target: z.string(),
    publishedId: z.string().optional(),
    publishedUrl: z.string().optional(),
  }),
  // Generic step metadata
  z.object({
    stepType: z.literal("generic"),
    data: z.record(z.unknown()),
  }),
]);

/**
 * Complete Pipeline Step Schema - Base + Type-specific metadata
 */
export const PipelineStepSchema = BasePipelineStepSchema.and(
  z.object({
    metadata: PipelineStepMetadataSchema.optional(),
  })
);

// =============================================================================
// PIPELINE INPUT/OUTPUT SCHEMAS
// =============================================================================

/**
 * Pipeline Type Enum
 */
export const PipelineTypeEnum = z.enum(["figma-to-storyblok", "storyblok-editor", "irf-architect"]);

/**
 * Create Pipeline Input Schema
 */
export const CreatePipelineInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: PipelineTypeEnum,
  source: z.string(),
  metadata: z.unknown(), // Will be validated based on type
});

/**
 * Create Pipeline Step Input Schema
 */
export const CreatePipelineStepInputSchema = z.object({
  pipelineId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  metadata: PipelineStepMetadataSchema.optional(),
});

/**
 * Update Pipeline Step Input Schema
 */
export const UpdatePipelineStepInputSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "failed", "waiting_approval"]).optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  duration: z.string().optional(),
  metadata: PipelineStepMetadataSchema.optional(),
});

// =============================================================================
// TYPE INFERENCE - Pipeline types from schemas
// =============================================================================

export type FigmaToStoryblokMetadata = z.infer<typeof FigmaToStoryblokMetadataSchema>;
export type StoryblokEditorMetadata = z.infer<typeof StoryblokEditorMetadataSchema>;
export type IRFArchitectMetadata = z.infer<typeof IRFArchitectMetadataSchema>;

export type PipelineType = z.infer<typeof PipelineTypeSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;
export type PipelineStepMetadata = z.infer<typeof PipelineStepMetadataSchema>;
export type PipelineStep = z.infer<typeof PipelineStepSchema>;

export type CreatePipelineInput = z.infer<typeof CreatePipelineInputSchema>;
export type CreatePipelineStepInput = z.infer<typeof CreatePipelineStepInputSchema>;
export type UpdatePipelineStepInput = z.infer<typeof UpdatePipelineStepInputSchema>;

// =============================================================================
// DATABASE SCHEMAS - For data coming from/going to database with jsonb
// =============================================================================

/**
 * Database Pipeline Schema - What actually comes from DB (with jsonb metadata)
 */
export const DatabasePipelineSchema = BasePipelineSchema.and(
  z.object({
    type: PipelineTypeEnum,
    source: z.string(),
    metadata: z.unknown(), // jsonb in database
  })
);

export type DatabasePipeline = z.infer<typeof DatabasePipelineSchema>;
