import { z } from "@hono/zod-openapi";
import { AgentCapabilitySchema, AgentTypeSchema } from "@mrck-labs/grid-core";

// Inferred types
export type AgentType = z.infer<typeof AgentTypeSchema>;
export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;

export { AgentTypeSchema, AgentCapabilitySchema };
