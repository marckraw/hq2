// Re-export types from Zod schemas to maintain compatibility
// All types are now inferred from Zod schemas for better validation

export type {
  AIMessage,
  ToolFunction as ToolFn,
  FigmaError,
} from "./schemas/additional.schemas";
