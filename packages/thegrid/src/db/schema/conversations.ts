import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  json,
  boolean,
} from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  systemMessage: text("system_message"),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  tool_call_id: text("tool_call_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  size: integer("size").notNull(),
  dataUrl: text("data_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New tables for agent execution tracking
export const agentExecutions = pgTable("agent_executions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  messageId: integer("message_id").references(() => messages.id), // Links to final assistant response
  triggeringMessageId: integer("triggering_message_id").references(
    () => messages.id
  ), // Links to user message that triggered execution
  agentType: varchar("agent_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("running"), // running, completed, failed
  autonomousMode: boolean("autonomous_mode").default(false),
  totalSteps: integer("total_steps").default(0),
  streamToken: text("stream_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentExecutionSteps = pgTable("agent_execution_steps", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id")
    .references(() => agentExecutions.id)
    .notNull(),
  stepType: varchar("step_type", { length: 50 }).notNull(), // user_message, thinking, llm_response, tool_execution, tool_response, finished, error, memory_saved
  content: text("content").notNull(),
  metadata: json("metadata"), // For storing additional data like tool parameters, etc.
  stepOrder: integer("step_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
