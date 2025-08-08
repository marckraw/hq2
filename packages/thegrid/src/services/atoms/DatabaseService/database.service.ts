import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "../../../db";

import { desc, eq } from "drizzle-orm";
import {
  agentExecutions,
  agentExecutionSteps,
  attachments,
  conversations,
  messages,
} from "../../../db/schema/conversations";

// Types for timeline data
export interface TimelineMessage {
  type: "message";
  data: typeof messages.$inferSelect;
  timestamp: Date;
}

export interface TimelineExecutionStep {
  type: "execution_step";
  data: typeof agentExecutionSteps.$inferSelect & {
    execution: {
      id: number;
      agentType: string;
      autonomousMode: boolean;
      messageId: number | null;
      triggeringMessageId: number | null;
    };
  };
  timestamp: Date;
}

export type TimelineItem = TimelineMessage | TimelineExecutionStep;

export interface ConversationWithExecutions {
  messages: (typeof messages.$inferSelect)[];
  executions: any[]; // We'll improve this type later
  timeline: TimelineItem[];
}

export const createDatabaseService = () => {
  // Initialize Drizzle
  const db = drizzle(pool);

  // Chat-related methods
  const createConversation = async ({
    title,
    systemMessage,
  }: {
    title: string;
    systemMessage: string;
  }) => {
    const [conversation] = await db
      .insert(conversations)
      .values({ title, systemMessage: systemMessage ?? "" })
      .returning();

    return conversation;
  };

  const addMessage = async ({
    conversationId,
    role,
    content,
    tool_call_id,
  }: {
    conversationId: number;
    role: string;
    content: string;
    tool_call_id?: string;
  }) => {
    const [message] = await db
      .insert(messages)
      .values({
        conversationId,
        role,
        content,
        tool_call_id,
      } as any)
      .returning();

    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return message;
  };

  const getConversationHistory = async (conversationId: number) => {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  };

  const getConversationWithExecutions = async (
    conversationId: number
  ): Promise<ConversationWithExecutions> => {
    // Get all messages
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Get all executions with their steps
    const executionsWithSteps = await db
      .select({
        execution: agentExecutions,
        step: agentExecutionSteps,
      })
      .from(agentExecutions)
      .leftJoin(
        agentExecutionSteps,
        eq(agentExecutions.id, agentExecutionSteps.executionId)
      )
      .where(eq(agentExecutions.conversationId, conversationId))
      .orderBy(agentExecutions.createdAt, agentExecutionSteps.stepOrder);

    // Group steps by execution
    const executionsMap = new Map();
    executionsWithSteps.forEach(({ execution, step }) => {
      if (!executionsMap.has(execution.id)) {
        executionsMap.set(execution.id, {
          ...execution,
          steps: [],
        });
      }
      if (step) {
        executionsMap.get(execution.id).steps.push(step);
      }
    });

    const executions = Array.from(executionsMap.values());

    // Create timeline items
    const timelineItems: TimelineItem[] = [];

    // Add all messages as timeline items
    allMessages.forEach((message) => {
      timelineItems.push({
        type: "message",
        data: message,
        timestamp: message.createdAt,
      });
    });

    // Add execution steps as timeline items
    executions.forEach((execution) => {
      execution.steps.forEach((step: any) => {
        timelineItems.push({
          type: "execution_step",
          data: {
            ...step,
            execution: {
              id: execution.id,
              agentType: execution.agentType,
              autonomousMode: execution.autonomousMode,
              messageId: execution.messageId,
              triggeringMessageId: execution.triggeringMessageId,
            },
          },
          timestamp: step.createdAt,
        });
      });
    });

    // Sort all timeline items chronologically
    timelineItems.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      messages: allMessages,
      executions,
      timeline: timelineItems,
    };
  };

  const getConversations = async () => {
    return db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));
  };

  const getConversationAttachments = async (conversationId: number) => {
    return db
      .select()
      .from(attachments)
      .where(eq(attachments.conversationId, conversationId))
      .orderBy(attachments.createdAt);
  };

  const addAttachment = async ({
    conversationId,
    name,
    type,
    size,
    dataUrl,
  }: {
    conversationId: number;
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  }) => {
    const [attachment] = await db
      .insert(attachments)
      .values({
        conversationId,
        name,
        type,
        size,
        dataUrl,
      })
      .returning();

    return attachment;
  };

  const deleteConversation = async (conversationId: number) => {
    // Get all agent executions for this conversation first
    const conversationExecutions = await db
      .select({ id: agentExecutions.id })
      .from(agentExecutions)
      .where(eq(agentExecutions.conversationId, conversationId));

    // Delete agent execution steps first (due to foreign key constraints)
    for (const execution of conversationExecutions) {
      await db
        .delete(agentExecutionSteps)
        .where(eq(agentExecutionSteps.executionId, execution.id));
    }

    // Delete agent executions
    await db
      .delete(agentExecutions)
      .where(eq(agentExecutions.conversationId, conversationId));

    // Delete all messages in the conversation
    await db
      .delete(messages)
      .where(eq(messages.conversationId, conversationId));

    // Delete all attachments in the conversation
    await db
      .delete(attachments)
      .where(eq(attachments.conversationId, conversationId));

    // Delete the conversation itself
    await db.delete(conversations).where(eq(conversations.id, conversationId));

    return { success: true };
  };

  // Get recent agent execution with stream token for session reuse
  const getRecentAgentExecution = async (conversationId: number) => {
    const [execution] = await db
      .select()
      .from(agentExecutions)
      .where(eq(agentExecutions.conversationId, conversationId))
      .orderBy(desc(agentExecutions.createdAt))
      .limit(1);

    return execution;
  };

  // Return public interface
  return {
    createConversation,
    addMessage,
    getConversationHistory,
    getConversationWithExecutions,
    getConversations,
    getConversationAttachments,
    addAttachment,
    deleteConversation,
    getRecentAgentExecution,
  };
};

export const databaseService = createDatabaseService();
export type DatabaseService = ReturnType<typeof createDatabaseService>;
