import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  data: jsonb("data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type for the session data
export interface SessionData {
  message: {
    content: string;
    role: string;
  };
  conversationId: number;
  userMessageId?: number; // ID of the user message that triggered the session
  autonomousMode: boolean;
  agentType: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    dataUrl: string;
  }>;
  modelId: string;
  contextData?: {
    contextType?: string;
    selectedSpace?: string;
    selectedStory?: string;
  };
}
