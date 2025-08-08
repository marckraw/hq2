import { ProgressMessageSchema } from "./api-types";

// Export all types from api-types
export * from "./api-types";

// You can add more shared types here
export interface SharedUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export type SharedStatus = "idle" | "loading" | "success" | "error";

// Utility types
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export {
  ProgressMessageSchema,
  ProgressMessageMetadataSchema,
  EnhancedProgressMessageSchema,
  ToolDisplayConfigSchema,
  AgentSuggestionSchema,
  ErrorRecoverySchema,
  validateProgressMessage,
  validateEnhancedProgressMessage,
} from "./api-types";
export type {
  ProgressMessage,
  ProgressMessageMetadata,
  EnhancedProgressMessage,
  ToolDisplayConfig,
  AgentSuggestion,
  ErrorRecovery,
} from "./api-types";
