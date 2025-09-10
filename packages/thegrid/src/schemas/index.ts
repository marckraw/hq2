import { logger } from "@/utils/logger";

// Import all schemas for SchemaRegistry
import { ChatMessageSchema, ToolCallSchema } from "./shared.schemas";
import { AgentTypeSchema, AgentInputSchema, AgentResponseSchema } from "./agent.schemas";
import { FigmaNodeSchema, FigmaFileSchema } from "./figma.schemas";
import { StoryblokStorySchema, StoryblokComponentDataSchema } from "./storyblok.schemas";
import { AIMessageSchema } from "./additional.schemas";
import { ProgressMessageSchema } from "core.mrck.dev";

// Main schemas export file
// This file exports all validation schemas for the application

// Master schema exports - Single source of truth for all Zod schemas and types

// Core schemas (ChatMessage, ToolCall, etc.)
export {
  ChatMessageSchema,
  ToolCallSchema,
  ToolFunctionSchema,
  MessageSchema,
  AttachmentSchema as CoreAttachmentSchema,
  ImageAttachmentSchema,
  TaskStatusSchema,
  validateChatMessage,
  validateToolCall,
  validateAttachment,
} from "./shared.schemas";

// Export types separately to fix isolatedModules issue
export type {
  ChatMessage,
  ToolCall,
  ToolFunction as CoreToolFunction,
  Message,
  Attachment as CoreAttachment,
  ImageAttachment,
  TaskStatus,
} from "./shared.schemas";

// Agent-specific schemas
export * from "./agent.schemas";
export * from "../agent/schemas/agent-config.schemas";

// Conversation schemas
export {
  SessionDataSchema,
  validateSessionData,
  validateProgressMessage as validateConversationProgressMessage,
} from "./conversation.schemas";

// Agent flow schemas
export {
  AgentFlowContextSchema,
  AgentFlowOptionsSchema,
  FlowStepResultSchema,
  ToolExecutionResultSchema,
  UploadedAttachmentSchema,
  validateAgentFlowContext,
  validateAgentFlowOptions,
  validateUploadedAttachment,
  validateFlowStepResult,
  validateToolExecutionResult,
} from "./agent-flow.schemas";

export {
  ProgressMessageSchema as ConversationProgressMessageSchema,
  ProgressMessageMetadataSchema,
} from "core.mrck.dev";

// Export conversation types separately
export type { SessionData } from "./conversation.schemas";

// Export agent flow types separately
export type {
  AgentFlowContext,
  AgentFlowOptions,
  FlowStepResult,
  ToolExecutionResult,
  UploadedAttachment,
} from "./agent-flow.schemas";

// Re-export shared types from thecore
export type { ProgressMessage as ConversationProgressMessage, ProgressMessageMetadata } from "core.mrck.dev";

// Execution tracking schemas
export * from "./execution.schemas";

// Figma integration schemas
export {
  FigmaColorSchema,
  FigmaFillSchema,
  FigmaBoundingBoxSchema,
  FigmaStrokeSchema,
  FigmaEffectSchema,
  FigmaStyleSchema,
  FigmaNodeSchema,
  FigmaFileMetadataSchema,
  FigmaPageSchema,
  FigmaFileSchema,
  FigmaErrorSchema as FigmaErrorSchemaType,
  validateFigmaNode,
  validateFigmaFile,
} from "./figma.schemas";

// Export Figma types separately
export type {
  FigmaColor,
  FigmaFill,
  FigmaBoundingBox,
  FigmaStroke,
  FigmaEffect,
  FigmaStyle,
  FigmaNode,
  FigmaFileMetadata,
  FigmaPage,
  FigmaFile,
  FigmaError as FigmaErrorType,
} from "./figma.schemas";

// Additional type schemas (AIMessage, ProgressMessage, etc.)
export {
  AttachmentSchema as AdditionalAttachmentSchema,
  UserMessageSchema,
  SystemMessageSchema,
  ToolMessageSchema,
  AssistantMessageSchema,
  AIMessageSchema,
  ToolFunctionInputSchema,
  ToolFunctionResultSchema,
  ProgressMessageSchema as AdditionalProgressMessageSchema,
  FigmaErrorSchema as AdditionalFigmaErrorSchema,
  GenericErrorSchema,
  FileAttachmentSchema,
  EnhancedAttachmentSchema,
  TimelineMessageSchema,
  TimelineExecutionStepSchema,
  TimelineItemSchema,
  RateLimitInfoSchema,
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
  ApiResponseSchema,
  validateAIMessage,
  validateProgressMessage as validateAdditionalProgressMessage,
  validateFileAttachment,
  validateTimelineItem,
} from "./additional.schemas";

// Export additional types separately
export type {
  Attachment as AdditionalAttachment,
  UserMessage,
  SystemMessage,
  ToolMessage,
  AssistantMessage,
  AIMessage,
  ToolFunctionInput,
  ToolFunctionResult,
  ProgressMessage as AdditionalProgressMessage,
  FigmaError as AdditionalFigmaError,
  GenericError,
  FileAttachment,
  EnhancedAttachment,
  TimelineMessage,
  TimelineExecutionStep,
  TimelineItem,
  RateLimitInfo,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  ToolFunction as AdditionalToolFunction,
} from "./additional.schemas";

// Storyblok CMS schemas
export * from "./storyblok.schemas";

// Service Schemas
export * from "./services.schemas";

// Enhanced progress schemas
export * from "./enhanced-progress.schemas";

// Schema validation helpers - centralized validation patterns
export const createValidationResult = <T>(result: {
  success: boolean;
  data?: T;
  error?: any;
}): { success: true; data: T } | { success: false; error: string } => {
  if (result.success && result.data) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error?.message || "Validation failed",
  };
};

// Generic validation wrapper
export const createValidator = <T>(schema: any) => {
  return (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    logger.warn(`Schema validation failed:`, result.error.format());
    return { success: false, error: result.error.message };
  };
};

// Type guard utilities
export const isValidSchema = <T>(schema: any, data: unknown): data is T => {
  return schema.safeParse(data).success;
};

// Safe parsing with detailed logging
export const safeParse = <T>(schema: any, data: unknown, context?: string): T | null => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const contextStr = context ? ` in ${context}` : "";
  logger.warn(`Schema validation failed${contextStr}:`, {
    errors: result.error.format(),
    data: JSON.stringify(data, null, 2),
  });

  return null;
};

// Validation with graceful degradation
export const validateWithFallback = <T>(schema: any, data: unknown, fallback: T, context?: string): T => {
  const parsed = safeParse<T>(schema, data, context);
  return parsed !== null ? parsed : fallback;
};

// Moved to top of file

// Schema registry for validation - now with normal imports
export const SchemaRegistry = {
  // Core schemas
  chatMessage: ChatMessageSchema,
  toolCall: ToolCallSchema,

  // Agent schemas
  agentType: AgentTypeSchema,
  agentInput: AgentInputSchema,
  agentResponse: AgentResponseSchema,

  // Figma schemas
  figmaNode: FigmaNodeSchema,
  figmaFile: FigmaFileSchema,

  // Storyblok schemas
  storyblokStory: StoryblokStorySchema,
  storyblokComponent: StoryblokComponentDataSchema,

  // Additional schemas
  aiMessage: AIMessageSchema,
  progressMessage: ProgressMessageSchema,
};

// Dynamic validation using registry
export const validateWithRegistry = <T>(
  schemaName: keyof typeof SchemaRegistry,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const schema = SchemaRegistry[schemaName];
    return createValidator<T>(schema)(data);
  } catch (error) {
    return {
      success: false,
      error: `Failed to load schema '${schemaName}': ${error}`,
    };
  }
};

// Schema information for debugging
export const getSchemaInfo = () => ({
  availableSchemas: Object.keys(SchemaRegistry),
  totalSchemas: Object.keys(SchemaRegistry).length,
  categories: {
    core: ["chatMessage", "toolCall"],
    agent: ["agentType", "agentInput", "agentResponse"],
    figma: ["figmaNode", "figmaFile"],
    storyblok: ["storyblokStory", "storyblokComponent"],
    additional: ["aiMessage", "progressMessage"],
    components: ["componentDefinition", "componentRegistry"],
  },
});

// Export schema validation status
export const SCHEMA_VERSION = "1.0.0";
export const SCHEMA_LAST_UPDATED = new Date().toISOString();

logger.info(`📋 Schema system loaded - Version ${SCHEMA_VERSION}`);
logger.info(`   Available schemas: ${Object.keys(SchemaRegistry).length}`);
logger.info(`   Categories: core, agent, figma, storyblok, additional, components`);

// =============================================================================
// LEGACY SCHEMA EXPORTS - Keep existing for backward compatibility
// =============================================================================

export * from "./services.schemas";
export * from "./agent.schemas";
export * from "./conversation.schemas";
export * from "./figma.schemas";
export * from "./storyblok.schemas";

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
