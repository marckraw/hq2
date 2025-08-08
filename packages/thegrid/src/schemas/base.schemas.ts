import { z } from "@hono/zod-openapi";

// =============================================================================
// ORIGIN TRACKING - Where pipelines/approvals are triggered from
// =============================================================================

/**
 * Origin enum - tracks where pipelines and approvals are initiated from
 */
export const OriginSchema = z.enum([
  "thehorizon", // Frontend app (current default)
  "slack", // Slack slash commands, buttons, etc.
  "storyblok-ui", // Direct Storyblok interface
  "storyblok-plugin", // Storyblok plugin system
  "email", // Email-based triggers/approvals
  "api", // Direct API calls
  "webhook", // External webhook triggers
  "system", // Automated/scheduled triggers
  "unknown", // Fallback for legacy data
]);

export type Origin = z.infer<typeof OriginSchema>;

// =============================================================================
// BASE SCHEMAS - Common fields for all entities
// =============================================================================

/**
 * Base Event Schema - Common fields for all events
 */
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  source: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Base Pipeline Schema - Common fields for all pipelines
 */
export const BasePipelineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(["running", "completed", "failed"]),
  origin: OriginSchema, // Where the pipeline was triggered from
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Base Pipeline Step Schema - Common fields for all pipeline steps
 */
export const BasePipelineStepSchema = z.object({
  id: z.string().uuid(),
  pipelineId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum([
    "pending",
    "in_progress",
    "completed",
    "failed",
    "waiting_approval",
  ]),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  duration: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Base Approval Schema - Common fields for all approvals
 */
export const BaseApprovalSchema = z.object({
  id: z.string().uuid(),
  pipelineStepId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
  risk: z.enum(["low", "medium", "high"]),
  reason: z.string().optional(),
  origin: OriginSchema, // Where the approval was triggered/responded from
  createdAt: z.date(),
  approvedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
});

// =============================================================================
// TYPE INFERENCE - Base types from schemas
// =============================================================================

export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type BasePipeline = z.infer<typeof BasePipelineSchema>;
export type BasePipelineStep = z.infer<typeof BasePipelineStepSchema>;
export type BaseApproval = z.infer<typeof BaseApprovalSchema>;
