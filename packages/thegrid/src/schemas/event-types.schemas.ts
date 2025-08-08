import { z } from "@hono/zod-openapi";
import { BaseEventSchema } from "./base.schemas";

// =============================================================================
// EVENT TYPE-SPECIFIC PAYLOAD SCHEMAS
// =============================================================================

/**
 * Figma to Storyblok Ready Event Payload
 */
export const FigmaToStoryblokReadyPayloadSchema = z.object({
  figmaData: z.unknown(),
  irfResult: z.unknown(),
  storyblokResult: z.unknown(),
  finalStoryblokStory: z.unknown(),
  metadata: z.object({
    figmaFileName: z.string(),
    componentCount: z.number(),
    nodeCount: z.number(),
    storyName: z.string(),
    storySlug: z.string(),
  }),
});

/**
 * Figma to Storyblok Approved Event Payload
 */
export const FigmaToStoryblokApprovedPayloadSchema = z.object({
  pipelineId: z.string().uuid(),
  approvalStepId: z.string().uuid(),
  finalStoryblokStory: z.unknown(),
  metadata: z.object({
    figmaFileName: z.string(),
    storyName: z.string(),
    storySlug: z.string(),
  }),
});

/**
 * Storyblok Editor Completed Event Payload
 */
export const StoryblokEditorCompletedPayloadSchema = z.object({
  originalStoryblok: z.unknown(),
  irf: z.unknown(),
  editedStoryblok: z.unknown(),
  metadata: z.object({
    transformationTime: z.string(),
    originalComponentCount: z.number(),
    finalComponentCount: z.number(),
    storyName: z.string(),
    storySlug: z.string(),
  }),
});

/**
 * Release Ready Event Payload
 */
export const ReleaseReadyPayloadSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  prNumber: z.string(),
});

/**
 * Approval Granted Event Payload
 */
export const ApprovalGrantedPayloadSchema = z.object({
  pipelineId: z.string().uuid(),
  approvalStepId: z.string().uuid(),
  repoOwner: z.string().optional(),
  repoName: z.string().optional(),
  prNumber: z.string().optional(),
  summary: z.string().optional(),
  commits: z.array(z.unknown()).optional(),
  prDetails: z.unknown().optional(),
});

// =============================================================================
// EVENT TYPE DISCRIMINATED UNIONS
// =============================================================================

/**
 * Event Type Discriminated Union Schema
 */
export const EventTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("figma-to-storyblok.ready"),
    payload: FigmaToStoryblokReadyPayloadSchema,
  }),
  z.object({
    type: z.literal("figma-to-storyblok.approved"),
    payload: FigmaToStoryblokApprovedPayloadSchema,
  }),
  z.object({
    type: z.literal("storyblok-editor.completed"),
    payload: StoryblokEditorCompletedPayloadSchema,
  }),
  z.object({
    type: z.literal("release.ready"),
    payload: ReleaseReadyPayloadSchema,
  }),
  z.object({
    type: z.literal("approval.granted"),
    payload: ApprovalGrantedPayloadSchema,
  }),
]);

/**
 * Complete Event Schema - Base + Type-specific
 */
export const EventSchema = BaseEventSchema.and(EventTypeSchema);

// =============================================================================
// EVENT INPUT/OUTPUT SCHEMAS
// =============================================================================

/**
 * Event Type Enum
 */
export const EventTypeEnum = z.enum([
  "figma-to-storyblok.ready",
  "figma-to-storyblok.approved",
  "storyblok-editor.completed",
  "release.ready",
  "approval.granted",
]);

/**
 * Emit Event Input Schema
 */
export const EmitEventInputSchema = z.object({
  type: EventTypeEnum,
  source: z.string(),
  payload: z.unknown(), // Will be validated based on type
  metadata: z.record(z.unknown()).optional(),
});

// =============================================================================
// DOMAIN-SPECIFIC EVENT SCHEMAS
// =============================================================================

/**
 * Pipeline Events - Events related to pipeline execution
 */
export const PipelineEventSchema = z.union([
  z.object({
    type: z.literal("pipeline.created"),
    payload: z.object({
      pipelineId: z.string().uuid(),
      pipelineType: z.string(),
      createdBy: z.string(),
    }),
  }),
  z.object({
    type: z.literal("pipeline.started"),
    payload: z.object({
      pipelineId: z.string().uuid(),
      startedAt: z.date(),
    }),
  }),
  z.object({
    type: z.literal("pipeline.completed"),
    payload: z.object({
      pipelineId: z.string().uuid(),
      completedAt: z.date(),
      duration: z.string(),
      status: z.enum(["completed", "failed"]),
    }),
  }),
  z.object({
    type: z.literal("pipeline.step.created"),
    payload: z.object({
      pipelineId: z.string().uuid(),
      stepId: z.string().uuid(),
      stepName: z.string(),
    }),
  }),
  z.object({
    type: z.literal("pipeline.step.completed"),
    payload: z.object({
      pipelineId: z.string().uuid(),
      stepId: z.string().uuid(),
      status: z.enum(["completed", "failed"]),
      duration: z.string().optional(),
    }),
  }),
]);

/**
 * Approval Events - Events related to approval processes
 */
export const ApprovalEventSchema = z.union([
  z.object({
    type: z.literal("approval.created"),
    payload: z.object({
      approvalId: z.string().uuid(),
      pipelineStepId: z.string().uuid(),
      approvalType: z.string(),
      requiredApprovals: z.number().default(1),
    }),
  }),
  z.object({
    type: z.literal("approval.granted"),
    payload: ApprovalGrantedPayloadSchema,
  }),
  z.object({
    type: z.literal("approval.rejected"),
    payload: z.object({
      approvalId: z.string().uuid(),
      pipelineStepId: z.string().uuid(),
      reason: z.string(),
      rejectedBy: z.string(),
      rejectedAt: z.date(),
    }),
  }),
]);

// =============================================================================
// TYPE INFERENCE - Event types from schemas
// =============================================================================

export type FigmaToStoryblokReadyPayload = z.infer<
  typeof FigmaToStoryblokReadyPayloadSchema
>;
export type FigmaToStoryblokApprovedPayload = z.infer<
  typeof FigmaToStoryblokApprovedPayloadSchema
>;
export type StoryblokEditorCompletedPayload = z.infer<
  typeof StoryblokEditorCompletedPayloadSchema
>;
export type ReleaseReadyPayload = z.infer<typeof ReleaseReadyPayloadSchema>;
export type ApprovalGrantedPayload = z.infer<
  typeof ApprovalGrantedPayloadSchema
>;

export type EventType = z.infer<typeof EventTypeSchema>;
export type Event = z.infer<typeof EventSchema>;
export type EventTypeEnumType = z.infer<typeof EventTypeEnum>;

export type EmitEventInput = z.infer<typeof EmitEventInputSchema>;
export type PipelineEvent = z.infer<typeof PipelineEventSchema>;
export type ApprovalEvent = z.infer<typeof ApprovalEventSchema>;
