import { z } from "@hono/zod-openapi";

// Memory types focused on conversational AI and user learning
export const MemoryType = {
  // Personal information about the user
  PERSONAL_FACT: "personal_fact", // "User lives in Warsaw, Poland"
  PREFERENCE: "preference", // "User prefers TypeScript over JavaScript"
  GOAL: "goal", // "User wants to learn machine learning"
  HABIT: "habit", // "User exercises every morning"

  // Professional/work context
  WORK_CONTEXT: "work_context", // "User works as a frontend developer"
  PROJECT: "project", // "User is building an AI chat system"
  SKILL: "skill", // "User is experienced with React"

  // Conversational context
  IMPORTANT_CONTEXT: "important_context", // Something user explicitly wants remembered
  CONVERSATION_INSIGHT: "conversation_insight", // Insights derived from conversations
  USER_INSTRUCTION: "user_instruction", // "Always remind me to take breaks"

  // Relationships and social context
  RELATIONSHIP: "relationship", // "User has a friend named John who codes"
  LOCATION: "location", // "User frequently visits coffee shop X"

  // Learning and interests
  INTEREST: "interest", // "User is interested in AI and blockchain"
  LEARNING: "learning", // "User is currently learning about vector databases"

  // General context
  GENERAL: "general", // Catch-all for other important info
} as const;

export type MemoryTypeEnum = (typeof MemoryType)[keyof typeof MemoryType];

export const memoryRequestSchema = z.object({
  type: z.enum([
    MemoryType.PERSONAL_FACT,
    MemoryType.PREFERENCE,
    MemoryType.GOAL,
    MemoryType.HABIT,
    MemoryType.WORK_CONTEXT,
    MemoryType.PROJECT,
    MemoryType.SKILL,
    MemoryType.IMPORTANT_CONTEXT,
    MemoryType.CONVERSATION_INSIGHT,
    MemoryType.USER_INSTRUCTION,
    MemoryType.RELATIONSHIP,
    MemoryType.LOCATION,
    MemoryType.INTEREST,
    MemoryType.LEARNING,
    MemoryType.GENERAL,
  ]),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  // New fields for conversational context
  conversationId: z.string().optional(), // Link to specific conversation
  confidence: z.number().min(0).max(1).optional().default(1), // How confident we are about this memory
  source: z
    .enum(["user_explicit", "ai_inferred", "conversation_analysis"])
    .optional()
    .default("user_explicit"),
});
