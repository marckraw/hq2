import { z } from "@hono/zod-openapi";

// =============================================================================
// APPROVAL SERVICE SCHEMAS
// =============================================================================

export const ApprovalStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const ApprovalRiskSchema = z.enum(["low", "medium", "high"]);

export const CreateApprovalInputSchema = z.object({
  pipelineStepId: z.string(),
});

export const RejectApprovalInputSchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
});

export const GetApprovalsInputSchema = z.object({
  status: ApprovalStatusSchema.optional(),
  risk: ApprovalRiskSchema.optional(),
  approvalType: z.string().optional(), // For future use when approvalType column is added
  search: z.string().optional(),
  origin: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const ApprovalUpdateDataSchema = z.object({
  status: z.literal("rejected"),
  rejectedAt: z.date(),
  reason: z.string().nullable(),
});

export const ApprovalWithRelationsSchema = z.object({
  id: z.string(),
  pipelineStepId: z.string(),
  status: ApprovalStatusSchema,
  risk: ApprovalRiskSchema,
  reason: z.string().nullable(),
  createdAt: z.date(),
  approvedAt: z.date().nullable(),
  rejectedAt: z.date().nullable(),
  step: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      status: z.string(),
      metadata: z.record(z.unknown()).nullable(),
    })
    .nullable(),
  pipeline: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      type: z.string(),
      metadata: z.record(z.unknown()).nullable(),
    })
    .nullable(),
  summary: z.unknown().optional(),
});

// =============================================================================
// PIPELINE SERVICE SCHEMAS
// =============================================================================

export const PipelineMetadataSchema = z
  .object({
    repoOwner: z.string().optional(),
    repoName: z.string().optional(),
    prNumber: z.union([z.string(), z.number()]).optional(),
    summary: z.string().optional(),
    commits: z.array(z.unknown()).optional(),
    prDetails: z.record(z.unknown()).optional(),
  })
  .catchall(z.unknown());

export const CreatePipelineInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  source: z.string(),
  type: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const PipelineStatusSchema = z.enum(["running", "completed", "failed"]);

export const UpdatePipelineStatusInputSchema = z.object({
  id: z.string(),
  status: PipelineStatusSchema,
});

export const CreatePipelineStepInputSchema = z.object({
  pipelineId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const PipelineStepStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "waiting_approval",
]);

export const UpdatePipelineStepInputSchema = z.object({
  id: z.string(),
  data: z.object({
    status: PipelineStepStatusSchema,
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    duration: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const ListPipelinesOptionsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// =============================================================================
// GITHUB SERVICE SCHEMAS
// =============================================================================

export const GitHubCommitAuthorSchema = z.object({
  name: z.string(),
  email: z.string(),
  date: z.string(),
});

export const GitHubCommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: GitHubCommitAuthorSchema,
  }),
});

export const PullRequestCommitAuthorSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    date: z.string().optional(),
  })
  .nullable();

export const PullRequestCommitSchema = z.object({
  sha: z.string(),
  node_id: z.string(),
  url: z.string(),
  html_url: z.string(),
  comments_url: z.string(),
  commit: z.object({
    url: z.string(),
    author: PullRequestCommitAuthorSchema,
    committer: PullRequestCommitAuthorSchema,
    message: z.string(),
    comment_count: z.number(),
    tree: z.object({
      sha: z.string(),
      url: z.string(),
    }),
    verification: z
      .object({
        verified: z.boolean(),
        reason: z.string(),
        signature: z.string().nullable(),
        payload: z.string().nullable(),
      })
      .optional(),
  }),
  files: z.array(z.unknown()).optional(),
});

export const GetPullRequestCommitsInputSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  prNumber: z.string(),
});

export const GetPullRequestDetailsInputSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  prNumber: z.string(),
});

// =============================================================================
// NOTIFICATION SERVICE SCHEMAS
// =============================================================================

export const NotificationTypeSchema = z.enum(["alert", "reminder", "insight"]);

export const CreateNotificationInputSchema = z.object({
  userId: z.string(),
  data: z.object({
    type: NotificationTypeSchema,
    message: z.string(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  message: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  read: z.boolean(),
});

export const MaybeNotifyUserInputSchema = z.object({
  userId: z.string(),
  data: z.object({
    type: NotificationTypeSchema,
    message: z.string(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

// =============================================================================
// LLM SERVICE SCHEMAS
// =============================================================================

export const ChatMessageRoleSchema = z.enum([
  "system",
  "user",
  "assistant",
  "tool",
]);

export const ChatMessageSchema = z.object({
  role: ChatMessageRoleSchema,
  content: z.string(),
  name: z.string().optional(),
  tool_calls: z.array(z.unknown()).optional(),
  tool_call_id: z.string().optional(),
});

export const LLMToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.unknown().optional(), // Could be ZodObject or regular object
});

export const RunLLMInputSchema = z.object({
  model: z.string().optional(),
  messages: z.array(ChatMessageSchema),
  tools: z.array(LLMToolSchema),
});

export const RunOpenRouterLLMInputSchema = z.object({
  model: z.string().optional(),
  messages: z.array(ChatMessageSchema),
  tools: z.array(LLMToolSchema),
});

export const RunCleanLLMInputSchema = z.object({
  model: z.string().optional(),
  messages: z.array(ChatMessageSchema),
  tools: z.array(LLMToolSchema),
});

export const RunCleanLLMWithJSONResponseInputSchema = z.object({
  model: z.string().optional(),
  messages: z.array(ChatMessageSchema),
  tools: z.array(LLMToolSchema).optional(),
});

export const ToolCallInputSchema = z.object({
  userMessage: z.string(),
  toolArgs: z.record(z.unknown()),
});

// =============================================================================
// SLACK SERVICE SCHEMAS
// =============================================================================

export const SlackNotifyInputSchema = z.object({
  message: z.string(),
});

export const SlackNotificationPayloadSchema = z.object({
  message: z.string(),
  channel: z.string(),
});

// =============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// =============================================================================

// Approval types
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type ApprovalRisk = z.infer<typeof ApprovalRiskSchema>;
export type CreateApprovalInput = z.infer<typeof CreateApprovalInputSchema>;
export type RejectApprovalInput = z.infer<typeof RejectApprovalInputSchema>;
export type GetApprovalsInput = z.infer<typeof GetApprovalsInputSchema>;
export type ApprovalUpdateData = z.infer<typeof ApprovalUpdateDataSchema>;
export type ApprovalWithRelations = z.infer<typeof ApprovalWithRelationsSchema>;

// Pipeline types
export type PipelineMetadata = z.infer<typeof PipelineMetadataSchema>;
export type CreatePipelineInput = z.infer<typeof CreatePipelineInputSchema>;
export type PipelineStatus = z.infer<typeof PipelineStatusSchema>;
export type UpdatePipelineStatusInput = z.infer<
  typeof UpdatePipelineStatusInputSchema
>;
export type CreatePipelineStepInput = z.infer<
  typeof CreatePipelineStepInputSchema
>;
export type PipelineStepStatus = z.infer<typeof PipelineStepStatusSchema>;
export type UpdatePipelineStepInput = z.infer<
  typeof UpdatePipelineStepInputSchema
>;
export type ListPipelinesOptions = z.infer<typeof ListPipelinesOptionsSchema>;

// GitHub types
export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
export type PullRequestCommit = z.infer<typeof PullRequestCommitSchema>;
export type GetPullRequestCommitsInput = z.infer<
  typeof GetPullRequestCommitsInputSchema
>;
export type GetPullRequestDetailsInput = z.infer<
  typeof GetPullRequestDetailsInputSchema
>;

// Notification types
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type CreateNotificationInput = z.infer<
  typeof CreateNotificationInputSchema
>;
export type NotificationData = z.infer<typeof NotificationSchema>;
export type MaybeNotifyUserInput = z.infer<typeof MaybeNotifyUserInputSchema>;

// LLM types
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type LLMTool = z.infer<typeof LLMToolSchema>;
export type RunLLMInput = z.infer<typeof RunLLMInputSchema>;
export type RunOpenRouterLLMInput = z.infer<typeof RunOpenRouterLLMInputSchema>;
export type RunCleanLLMInput = z.infer<typeof RunCleanLLMInputSchema>;
export type RunCleanLLMWithJSONResponseInput = z.infer<
  typeof RunCleanLLMWithJSONResponseInputSchema
>;
export type ToolCallInput = z.infer<typeof ToolCallInputSchema>;

// Slack types
export type SlackNotifyInput = z.infer<typeof SlackNotifyInputSchema>;
export type SlackNotificationPayload = z.infer<
  typeof SlackNotificationPayloadSchema
>;
