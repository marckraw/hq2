import { z } from "@hono/zod-openapi";
import { BaseApprovalSchema } from "./base.schemas";

// =============================================================================
// APPROVAL TYPE-SPECIFIC METADATA SCHEMAS
// =============================================================================

/**
 * Figma to Storyblok Approval Metadata
 */
export const FigmaToStoryblokApprovalMetadataSchema = z.object({
  approvalType: z.literal("figma-to-storyblok"),
  storyName: z.string(),
  storySlug: z.string(),
  previewUrl: z.string().optional(),
  figmaFileName: z.string(),
  componentCount: z.number(),
  finalStoryblokStory: z.unknown(),
  requiresReview: z.boolean().default(true),
});

/**
 * Changelog Approval Metadata
 */
export const ChangelogApprovalMetadataSchema = z.object({
  approvalType: z.literal("changelog"),
  repoOwner: z.string(),
  repoName: z.string(),
  prNumber: z.string(),
  prTitle: z.string(),
  summary: z.string(),
  changelogPreview: z.string(),
  releaseNotes: z.string().optional(),
  impactLevel: z.enum(["minor", "major", "breaking"]).default("minor"),
});

/**
 * Storyblok Editor Approval Metadata
 */
export const StoryblokEditorApprovalMetadataSchema = z.object({
  approvalType: z.literal("storyblok-editor"),
  storyName: z.string(),
  storySlug: z.string(),
  originalVersion: z.string(),
  editedVersion: z.string(),
  changesPreview: z.string(),
  componentChanges: z.array(
    z.object({
      component: z.string(),
      changeType: z.enum(["added", "removed", "modified"]),
      description: z.string(),
    })
  ),
  backupRequired: z.boolean().default(true),
});

/**
 * IRF Architect Approval Metadata
 */
export const IRFArchitectApprovalMetadataSchema = z.object({
  approvalType: z.literal("irf-architect"),
  architectureType: z.string(),
  inputFiles: z.array(z.string()),
  outputFiles: z.array(z.string()),
  transformationRules: z.array(z.unknown()),
  complexityScore: z.number(),
  estimatedImpact: z.enum(["low", "medium", "high"]),
  requiredApprovals: z.number().default(1),
});

// =============================================================================
// APPROVAL TYPE DISCRIMINATED UNIONS
// =============================================================================

/**
 * Approval Type Discriminated Union Schema
 */
export const ApprovalTypeSchema = z.discriminatedUnion("approvalType", [
  z.object({
    approvalType: z.literal("figma-to-storyblok"),
    metadata: FigmaToStoryblokApprovalMetadataSchema,
  }),
  z.object({
    approvalType: z.literal("changelog"),
    metadata: ChangelogApprovalMetadataSchema,
  }),
  z.object({
    approvalType: z.literal("storyblok-editor"),
    metadata: StoryblokEditorApprovalMetadataSchema,
  }),
  z.object({
    approvalType: z.literal("irf-architect"),
    metadata: IRFArchitectApprovalMetadataSchema,
  }),
]);

/**
 * Complete Approval Schema - Base + Type-specific
 */
export const ApprovalSchema = BaseApprovalSchema.and(ApprovalTypeSchema);

// =============================================================================
// APPROVAL INPUT/OUTPUT SCHEMAS
// =============================================================================

/**
 * Approval Type Enum
 */
export const ApprovalTypeEnum = z.enum([
  "figma-to-storyblok",
  "changelog",
  "storyblok-editor",
  "irf-architect",
]);

/**
 * Create Approval Input Schema
 */
export const CreateApprovalInputSchema = z.object({
  pipelineStepId: z.string().uuid(),
  approvalType: ApprovalTypeEnum,
  risk: z.enum(["low", "medium", "high"]).default("low"),
  metadata: z.unknown(), // Will be validated based on approvalType
});

/**
 * Approve Approval Input Schema
 */
export const ApproveApprovalInputSchema = z.object({
  reason: z.string().optional(),
  additionalData: z.record(z.unknown()).optional(),
});

/**
 * Reject Approval Input Schema
 */
export const RejectApprovalInputSchema = z.object({
  reason: z.string(),
  feedback: z.string().optional(),
  suggestedChanges: z.array(z.string()).optional(),
});

/**
 * Get Approvals Filter Schema
 */
export const GetApprovalsFilterSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  risk: z.enum(["low", "medium", "high"]).optional(),
  approvalType: ApprovalTypeEnum.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// =============================================================================
// APPROVAL WITH RELATIONS SCHEMA
// =============================================================================

/**
 * Approval with Pipeline and Step Relations
 */
export const ApprovalWithRelationsSchema = ApprovalSchema.and(
  z.object({
    step: z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        status: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
      .optional(),
    pipeline: z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        type: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
      .optional(),
    summary: z.unknown().optional(),
  })
);

// =============================================================================
// TYPE INFERENCE - Approval types from schemas
// =============================================================================

export type FigmaToStoryblokApprovalMetadata = z.infer<
  typeof FigmaToStoryblokApprovalMetadataSchema
>;
export type ChangelogApprovalMetadata = z.infer<
  typeof ChangelogApprovalMetadataSchema
>;
export type StoryblokEditorApprovalMetadata = z.infer<
  typeof StoryblokEditorApprovalMetadataSchema
>;
export type IRFArchitectApprovalMetadata = z.infer<
  typeof IRFArchitectApprovalMetadataSchema
>;

export type ApprovalType = z.infer<typeof ApprovalTypeSchema>;
export type Approval = z.infer<typeof ApprovalSchema>;
export type ApprovalTypeEnumType = z.infer<typeof ApprovalTypeEnum>;

export type CreateApprovalInput = z.infer<typeof CreateApprovalInputSchema>;
export type ApproveApprovalInput = z.infer<typeof ApproveApprovalInputSchema>;
export type RejectApprovalInput = z.infer<typeof RejectApprovalInputSchema>;
export type GetApprovalsFilter = z.infer<typeof GetApprovalsFilterSchema>;
export type ApprovalWithRelations = z.infer<typeof ApprovalWithRelationsSchema>;
