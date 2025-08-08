import { z } from "@hono/zod-openapi";

// Setting categories
export const SettingCategoryEnum = z.enum([
  "agent",
  "prompts",
  "interface",
  "notifications",
]);

// Agent settings validation
export const AgentSettingsSchema = z.object({
  defaultModel: z.enum(["gpt-4", "gpt-3.5", "claude-3"]),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(10000),
  autoSave: z.boolean(),
});

// Prompt settings validation
export const PromptSettingsSchema = z.object({
  codeReview: z.string().min(1),
  bugFix: z.string().min(1),
  documentation: z.string().min(1),
});

// Interface settings validation
export const InterfaceSettingsSchema = z.object({
  colorMode: z.enum(["system", "light", "dark"]),
  theme: z.enum(["default", "pink", "sage"]),
  codeHighlighting: z.boolean(),
  showLineNumbers: z.boolean(),
  autoComplete: z.boolean(),
  enabledSnippets: z.array(z.string()).optional(),
  debugMode: z.boolean(),
});

// Notification settings validation
export const NotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  sound: z.boolean(),
  desktop: z.boolean(),
});

// API request schemas
export const GetSettingsRequestSchema = z.object({
  category: SettingCategoryEnum.optional(),
});

export const CreateSettingRequestSchema = z.object({
  category: SettingCategoryEnum,
  key: z.string().min(1).max(100),
  value: z.unknown(), // Will be validated based on category
  description: z.string().optional(),
});

export const UpdateSettingRequestSchema = z.object({
  category: SettingCategoryEnum,
  key: z.string().min(1).max(100),
  value: z.unknown(), // Will be validated based on category
  description: z.string().optional(),
});

export const DeleteSettingRequestSchema = z.object({
  category: SettingCategoryEnum,
  key: z.string().min(1).max(100),
});

// Response schemas
export const SettingResponseSchema = z.object({
  id: z.string().uuid(),
  category: SettingCategoryEnum,
  key: z.string(),
  value: z.unknown(),
  description: z.string().nullable(),
  createdAt: z.string(), // JSON serializes Date to string
  updatedAt: z.string(), // JSON serializes Date to string
});

export const SettingsResponseSchema = z.array(SettingResponseSchema);

// Bulk update schema for frontend
export const BulkUpdateSettingsRequestSchema = z.object({
  agent: AgentSettingsSchema.partial().optional(),
  prompts: PromptSettingsSchema.partial().optional(),
  interface: InterfaceSettingsSchema.partial().optional(),
  notifications: NotificationSettingsSchema.partial().optional(),
});

// Type exports
export type SettingCategory = z.infer<typeof SettingCategoryEnum>;
export type AgentSettings = z.infer<typeof AgentSettingsSchema>;
export type PromptSettings = z.infer<typeof PromptSettingsSchema>;
export type InterfaceSettings = z.infer<typeof InterfaceSettingsSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type CreateSettingRequest = z.infer<typeof CreateSettingRequestSchema>;
export type UpdateSettingRequest = z.infer<typeof UpdateSettingRequestSchema>;
export type DeleteSettingRequest = z.infer<typeof DeleteSettingRequestSchema>;
export type SettingResponse = z.infer<typeof SettingResponseSchema>;
export type BulkUpdateSettingsRequest = z.infer<
  typeof BulkUpdateSettingsRequestSchema
>;
