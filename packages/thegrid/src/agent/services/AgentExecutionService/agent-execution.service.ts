import { db } from "../../../db/index";
import {
  agentExecutions,
  agentExecutionSteps,
} from "../../../db/schema/conversations";
import { eq, desc } from "drizzle-orm";

export interface AgentExecutionData {
  id?: number;
  conversationId: number;
  messageId?: number;
  triggeringMessageId?: number;
  agentType: string;
  status: "running" | "completed" | "failed";
  autonomousMode: boolean;
  totalSteps: number;
  streamToken?: string;
}

export interface AgentExecutionStep {
  id?: number;
  executionId: number;
  stepType: string;
  content: string;
  metadata?: Record<string, any>;
  stepOrder: number;
}

export const createAgentExecutionService = () => {
  /**
   * Create a new agent execution record
   */
  const createExecution = async (
    data: Omit<AgentExecutionData, "id">
  ): Promise<number> => {
    const [execution] = await db
      .insert(agentExecutions)
      .values({
        conversationId: data.conversationId,
        messageId: data.messageId,
        triggeringMessageId: data.triggeringMessageId,
        agentType: data.agentType,
        status: data.status,
        autonomousMode: data.autonomousMode,
        totalSteps: data.totalSteps,
        streamToken: data.streamToken,
      } as any)
      .returning({ id: agentExecutions.id });

    return execution!.id;
  };

  /**
   * Update agent execution status and total steps
   */
  const updateExecution = async (
    executionId: number,
    updates: Partial<
      Pick<
        AgentExecutionData,
        "status" | "totalSteps" | "messageId" | "triggeringMessageId"
      >
    >
  ): Promise<void> => {
    await db
      .update(agentExecutions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(agentExecutions.id, executionId));
  };

  /**
   * Add a step to an agent execution
   */
  const addStep = async (step: Omit<AgentExecutionStep, "id">): Promise<number> => {
    const [stepRecord] = await db
      .insert(agentExecutionSteps)
      .values({
        executionId: step.executionId,
        stepType: step.stepType,
        content: step.content,
        metadata: step.metadata,
        stepOrder: step.stepOrder,
      })
      .returning({ id: agentExecutionSteps.id });

    return stepRecord!.id;
  };

  /**
   * Get agent execution with all steps
   */
  const getExecutionWithSteps = async (executionId: number) => {
    const execution = await db
      .select()
      .from(agentExecutions)
      .where(eq(agentExecutions.id, executionId))
      .limit(1);

    if (!execution.length) {
      return null;
    }

    const steps = await db
      .select()
      .from(agentExecutionSteps)
      .where(eq(agentExecutionSteps.executionId, executionId))
      .orderBy(agentExecutionSteps.stepOrder);

    return {
      execution: execution[0],
      steps,
    };
  };

  /**
   * Get all executions for a conversation
   */
  const getExecutionsForConversation = async (conversationId: number) => {
    const executions = await db
      .select()
      .from(agentExecutions)
      .where(eq(agentExecutions.conversationId, conversationId))
      .orderBy(desc(agentExecutions.createdAt));

    const executionsWithSteps = await Promise.all(
      executions.map(async (execution) => {
        const steps = await db
          .select()
          .from(agentExecutionSteps)
          .where(eq(agentExecutionSteps.executionId, execution.id))
          .orderBy(agentExecutionSteps.stepOrder);

        return {
          execution,
          steps,
        };
      })
    );

    return executionsWithSteps;
  };

  /**
   * Get execution by stream token
   */
  const getExecutionByStreamToken = async (streamToken: string) => {
    const execution = await db
      .select()
      .from(agentExecutions)
      .where(eq(agentExecutions.streamToken, streamToken))
      .limit(1);

    return execution.length > 0 ? execution[0] : null;
  };

  /**
   * Delete execution and all its steps
   */
  const deleteExecution = async (executionId: number): Promise<void> => {
    // Delete steps first (due to foreign key constraint)
    await db
      .delete(agentExecutionSteps)
      .where(eq(agentExecutionSteps.executionId, executionId));

    // Delete execution
    await db.delete(agentExecutions).where(eq(agentExecutions.id, executionId));
  };

  return {
    createExecution,
    updateExecution,
    addStep,
    getExecutionWithSteps,
    getExecutionsForConversation,
    getExecutionByStreamToken,
    deleteExecution,
  };
};

export const agentExecutionService = createAgentExecutionService();

export type AgentExecutionService = ReturnType<typeof createAgentExecutionService>;
