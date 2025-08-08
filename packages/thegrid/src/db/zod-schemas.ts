// Type-safe drizzle-zod schemas with proper type inference
// This file preserves actual types from drizzle-zod without lint errors

import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import * as dbSchema from "./schema";

// ===== CONVERSATIONS SCHEMAS =====
export const conversationSelectSchema = createSelectSchema(
  dbSchema.conversations
);
export const conversationInsertSchema = createInsertSchema(
  dbSchema.conversations
);
export const conversationUpdateSchema = createUpdateSchema(
  dbSchema.conversations
);

// ===== MESSAGES SCHEMAS =====
export const messageSelectSchema = createSelectSchema(dbSchema.messages);
export const messageInsertSchema = createInsertSchema(dbSchema.messages);
export const messageUpdateSchema = createUpdateSchema(dbSchema.messages);

// ===== ATTACHMENTS SCHEMAS =====
export const attachmentSelectSchema = createSelectSchema(dbSchema.attachments);
export const attachmentInsertSchema = createInsertSchema(dbSchema.attachments);
export const attachmentUpdateSchema = createUpdateSchema(dbSchema.attachments);

// ===== PIPELINES SCHEMAS =====
export const pipelineSelectSchema = createSelectSchema(dbSchema.pipelines);
export const pipelineInsertSchema = createInsertSchema(dbSchema.pipelines);
export const pipelineUpdateSchema = createUpdateSchema(dbSchema.pipelines);

export const pipelineStepSelectSchema = createSelectSchema(
  dbSchema.pipelineSteps
);
export const pipelineStepInsertSchema = createInsertSchema(
  dbSchema.pipelineSteps
);
export const pipelineStepUpdateSchema = createUpdateSchema(
  dbSchema.pipelineSteps
);

// ===== AGENT EXECUTION SCHEMAS =====
export const agentExecutionSelectSchema = createSelectSchema(
  dbSchema.agentExecutions
);
export const agentExecutionInsertSchema = createInsertSchema(
  dbSchema.agentExecutions
);
export const agentExecutionUpdateSchema = createUpdateSchema(
  dbSchema.agentExecutions
);

export const agentExecutionStepSelectSchema = createSelectSchema(
  dbSchema.agentExecutionSteps
);
export const agentExecutionStepInsertSchema = createInsertSchema(
  dbSchema.agentExecutionSteps
);
export const agentExecutionStepUpdateSchema = createUpdateSchema(
  dbSchema.agentExecutionSteps
);

// ===== MEMORY SCHEMAS ===== (Removed - memory system no longer in use)

// ===== OTHER SCHEMAS =====
export const sessionSelectSchema = createSelectSchema(dbSchema.sessions);
export const sessionInsertSchema = createInsertSchema(dbSchema.sessions);
export const sessionUpdateSchema = createUpdateSchema(dbSchema.sessions);

export const signalSelectSchema = createSelectSchema(dbSchema.signals);
export const signalInsertSchema = createInsertSchema(dbSchema.signals);
export const signalUpdateSchema = createUpdateSchema(dbSchema.signals);

export const notificationSelectSchema = createSelectSchema(
  dbSchema.notifications
);
export const notificationInsertSchema = createInsertSchema(
  dbSchema.notifications
);
export const notificationUpdateSchema = createUpdateSchema(
  dbSchema.notifications
);

export const fileSelectSchema = createSelectSchema(dbSchema.files);
export const fileInsertSchema = createInsertSchema(dbSchema.files);
export const fileUpdateSchema = createUpdateSchema(dbSchema.files);

export const approvalSelectSchema = createSelectSchema(dbSchema.approvals);
export const approvalInsertSchema = createInsertSchema(dbSchema.approvals);
export const approvalUpdateSchema = createUpdateSchema(dbSchema.approvals);

export const changelogSelectSchema = createSelectSchema(dbSchema.changelogs);
export const changelogInsertSchema = createInsertSchema(dbSchema.changelogs);
export const changelogUpdateSchema = createUpdateSchema(dbSchema.changelogs);

export const storyblokComponentSelectSchema = createSelectSchema(
  dbSchema.storyblokComponents
);
export const storyblokComponentInsertSchema = createInsertSchema(
  dbSchema.storyblokComponents
);
export const storyblokComponentUpdateSchema = createUpdateSchema(
  dbSchema.storyblokComponents
);

// ===== INFERRED TYPES (These will have the correct types!) =====

// Get the actual inferred types using a different approach
type InferSchema<T> = T extends { _output: infer U } ? U : never;

export type ConversationSelect = InferSchema<typeof conversationSelectSchema>;
export type ConversationInsert = InferSchema<typeof conversationInsertSchema>;
export type ConversationUpdate = InferSchema<typeof conversationUpdateSchema>;

export type MessageSelect = InferSchema<typeof messageSelectSchema>;
export type MessageInsert = InferSchema<typeof messageInsertSchema>;
export type MessageUpdate = InferSchema<typeof messageUpdateSchema>;

export type AttachmentSelect = InferSchema<typeof attachmentSelectSchema>;
export type AttachmentInsert = InferSchema<typeof attachmentInsertSchema>;
export type AttachmentUpdate = InferSchema<typeof attachmentUpdateSchema>;

export type PipelineSelect = InferSchema<typeof pipelineSelectSchema>;
export type PipelineInsert = InferSchema<typeof pipelineInsertSchema>;
export type PipelineUpdate = InferSchema<typeof pipelineUpdateSchema>;

export type PipelineStepSelect = InferSchema<typeof pipelineStepSelectSchema>;
export type PipelineStepInsert = InferSchema<typeof pipelineStepInsertSchema>;
export type PipelineStepUpdate = InferSchema<typeof pipelineStepUpdateSchema>;

export type AgentExecutionSelect = InferSchema<
  typeof agentExecutionSelectSchema
>;
export type AgentExecutionInsert = InferSchema<
  typeof agentExecutionInsertSchema
>;
export type AgentExecutionUpdate = InferSchema<
  typeof agentExecutionUpdateSchema
>;

export type AgentExecutionStepSelect = InferSchema<
  typeof agentExecutionStepSelectSchema
>;
export type AgentExecutionStepInsert = InferSchema<
  typeof agentExecutionStepInsertSchema
>;
export type AgentExecutionStepUpdate = InferSchema<
  typeof agentExecutionStepUpdateSchema
>;

// ===== VALIDATION HELPERS =====

// These work perfectly and preserve types
export const validateConversationInsert = (
  data: unknown
): ConversationInsert | null => {
  const result = conversationInsertSchema.safeParse(data);
  return result.success ? result.data : null;
};

export const validateMessageInsert = (data: unknown): MessageInsert | null => {
  const result = messageInsertSchema.safeParse(data);
  return result.success ? result.data : null;
};

export const validatePipelineInsert = (
  data: unknown
): PipelineInsert | null => {
  const result = pipelineInsertSchema.safeParse(data);
  return result.success ? result.data : null;
};
