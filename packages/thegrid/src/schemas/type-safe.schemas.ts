// =============================================================================
// TYPE-SAFE SCHEMAS - New inheritance-like pattern schemas
// =============================================================================

// Base schemas
export * from "./base.schemas";

// Pipeline type schemas
export * from "./pipeline-types.schemas";

// Approval type schemas
export * from "./approval-types.schemas";

// Event type schemas
export * from "./event-types.schemas";

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

import { z } from "@hono/zod-openapi";
import {
  PipelineSchema,
  PipelineTypeEnum,
  FigmaToStoryblokMetadataSchema,
  StoryblokEditorMetadataSchema,
  IRFArchitectMetadataSchema,
  type Pipeline,
} from "./pipeline-types.schemas";

import {
  ApprovalSchema,
  ApprovalTypeEnum,
  FigmaToStoryblokApprovalMetadataSchema,
  StoryblokEditorApprovalMetadataSchema,
  IRFArchitectApprovalMetadataSchema,
} from "./approval-types.schemas";

import {
  EventSchema,
  EventTypeEnum,
  FigmaToStoryblokReadyPayloadSchema,
  FigmaToStoryblokApprovedPayloadSchema,
  StoryblokEditorCompletedPayloadSchema,
  ApprovalGrantedPayloadSchema,
} from "./event-types.schemas";

/**
 * Pipeline metadata validator based on pipeline type
 */
export const validatePipelineMetadata = (type: string, metadata: unknown) => {
  switch (type) {
    case "figma-to-storyblok":
      return FigmaToStoryblokMetadataSchema.parse(metadata);
    case "storyblok-editor":
      return StoryblokEditorMetadataSchema.parse(metadata);
    case "irf-architect":
      return IRFArchitectMetadataSchema.parse(metadata);
    default:
      throw new Error(`Unknown pipeline type: ${type}`);
  }
};

/**
 * Transform database pipeline (with jsonb metadata) to typed pipeline
 */
export const transformDatabasePipeline = (dbPipeline: any): Pipeline => {
  const validatedMetadata = validatePipelineMetadata(dbPipeline.type, dbPipeline.metadata);

  return PipelineSchema.parse({
    ...dbPipeline,
    // Default to 'unknown' for legacy records without origin field
    origin: dbPipeline.origin || "unknown",
    metadata: validatedMetadata,
  });
};

/**
 * Transform typed pipeline to database format (with jsonb metadata)
 */
export const transformPipelineToDatabase = (typedPipeline: Pipeline): any => {
  return {
    ...typedPipeline,
    metadata: typedPipeline.metadata as any, // Cast to jsonb for database
  };
};

/**
 * Approval metadata validator based on approval type
 */
export const validateApprovalMetadata = (approvalType: string, metadata: unknown) => {
  switch (approvalType) {
    case "figma-to-storyblok":
      return FigmaToStoryblokApprovalMetadataSchema.parse(metadata);
    case "storyblok-editor":
      return StoryblokEditorApprovalMetadataSchema.parse(metadata);
    case "irf-architect":
      return IRFArchitectApprovalMetadataSchema.parse(metadata);
    default:
      throw new Error(`Unknown approval type: ${approvalType}`);
  }
};

/**
 * Event payload validator based on event type
 */
export const validateEventPayload = (eventType: string, payload: unknown) => {
  switch (eventType) {
    case "figma-to-storyblok.ready":
      return FigmaToStoryblokReadyPayloadSchema.parse(payload);
    case "figma-to-storyblok.approved":
      return FigmaToStoryblokApprovedPayloadSchema.parse(payload);
    case "storyblok-editor.completed":
      return StoryblokEditorCompletedPayloadSchema.parse(payload);
    case "approval.granted":
      return ApprovalGrantedPayloadSchema.parse(payload);
    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }
};

/**
 * Type guards for runtime type checking
 */
export const isPipelineType = (type: string): type is z.infer<typeof PipelineTypeEnum> => {
  return PipelineTypeEnum.safeParse(type).success;
};

export const isApprovalType = (type: string): type is z.infer<typeof ApprovalTypeEnum> => {
  return ApprovalTypeEnum.safeParse(type).success;
};

export const isEventType = (type: string): type is z.infer<typeof EventTypeEnum> => {
  return EventTypeEnum.safeParse(type).success;
};

/**
 * Schema registry for dynamic validation
 */
export const SCHEMA_REGISTRY = {
  pipelines: {
    base: PipelineSchema,
    types: PipelineTypeEnum,
    metadata: {
      "figma-to-storyblok": FigmaToStoryblokMetadataSchema,
      "storyblok-editor": StoryblokEditorMetadataSchema,
      "irf-architect": IRFArchitectMetadataSchema,
    },
  },
  approvals: {
    base: ApprovalSchema,
    types: ApprovalTypeEnum,
    metadata: {
      "figma-to-storyblok": FigmaToStoryblokApprovalMetadataSchema,
      "storyblok-editor": StoryblokEditorApprovalMetadataSchema,
      "irf-architect": IRFArchitectApprovalMetadataSchema,
    },
  },
  events: {
    base: EventSchema,
    types: EventTypeEnum,
    payloads: {
      "figma-to-storyblok.ready": FigmaToStoryblokReadyPayloadSchema,
      "figma-to-storyblok.approved": FigmaToStoryblokApprovedPayloadSchema,
      "storyblok-editor.completed": StoryblokEditorCompletedPayloadSchema,
      "approval.granted": ApprovalGrantedPayloadSchema,
    },
  },
} as const;
