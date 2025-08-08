import { db } from "../../../db";
import { pipelines, pipelineSteps } from "../../../db/schema/pipelines";
import { eq, desc, count } from "drizzle-orm";
import {
  type PipelineMetadata as _PipelineMetadata,
  type CreatePipelineInput,
  type PipelineStatus as _PipelineStatus,
  type UpdatePipelineStatusInput as _UpdatePipelineStatusInput,
  type CreatePipelineStepInput,
  type PipelineStepStatus as _PipelineStepStatus,
  type UpdatePipelineStepInput as _UpdatePipelineStepInput,
  type ListPipelinesOptions,
  CreatePipelineInputSchema,
  CreatePipelineStepInputSchema,
  UpdatePipelineStepInputSchema,
  ListPipelinesOptionsSchema,
} from "../../../schemas/services.schemas";

export const createPipelineService = () => {
  const createPipeline = async (data: CreatePipelineInput) => {
    // Validate input
    const validatedData = CreatePipelineInputSchema.parse(data);

    const [pipeline] = await db
      .insert(pipelines)
      .values({
        name: validatedData.name,
        description: validatedData.description ?? null,
        status: "running",
        source: validatedData.source,
        type: validatedData.type,
        metadata: validatedData.metadata ?? null,
      })
      .returning();

    return pipeline;
  };

  const updatePipelineStatus = async (
    id: string,
    status: "running" | "completed" | "failed"
  ) => {
    const [pipeline] = await db
      .update(pipelines)
      .set({ status, updatedAt: new Date() })
      .where(eq(pipelines.id, id))
      .returning();

    return pipeline;
  };

  const createPipelineStep = async (data: CreatePipelineStepInput) => {
    // Validate input
    const validatedData = CreatePipelineStepInputSchema.parse(data);

    const [step] = await db
      .insert(pipelineSteps)
      .values({
        pipelineId: validatedData.pipelineId,
        name: validatedData.name,
        description: validatedData.description ?? null,
        status: "pending",
        metadata: validatedData.metadata ?? null,
      })
      .returning();

    return step;
  };

  const updatePipelineStep = async (
    id: string,
    data: {
      status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "waiting_approval";
      startedAt?: Date;
      completedAt?: Date;
      duration?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    // Validate input
    const validatedInput = UpdatePipelineStepInputSchema.parse({ id, data });

    const updateObject = {
      ...validatedInput.data,
      updatedAt: new Date(),
      startedAt: validatedInput.data.startedAt ?? null,
      completedAt: validatedInput.data.completedAt ?? null,
      duration: validatedInput.data.duration ?? null,
      metadata: validatedInput.data.metadata ?? null,
    };

    const [step] = await db
      .update(pipelineSteps)
      .set(updateObject)
      .where(eq(pipelineSteps.id, validatedInput.id))
      .returning();

    return step;
  };

  const getPipeline = async (id: string) => {
    const [pipeline] = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.id, id))
      .limit(1);

    if (!pipeline) return null;

    const steps = await db
      .select()
      .from(pipelineSteps)
      .where(eq(pipelineSteps.pipelineId, id))
      .orderBy(desc(pipelineSteps.createdAt));

    return {
      ...pipeline,
      steps,
    };
  };

  const listPipelines = async (options?: ListPipelinesOptions) => {
    // Validate input if provided
    const validatedOptions = options
      ? ListPipelinesOptionsSchema.parse(options)
      : { limit: 50, offset: 0 };

    // Get total count of pipelines
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(pipelines);
    const totalCount = totalCountResult?.count || 0;

    const pipelineList = await db
      .select()
      .from(pipelines)
      .orderBy(desc(pipelines.createdAt))
      .limit(validatedOptions.limit || 50)
      .offset(validatedOptions.offset || 0);

    // Get steps for each pipeline
    const pipelinesWithSteps = await Promise.all(
      pipelineList.map(async (pipeline) => {
        const steps = await db
          .select()
          .from(pipelineSteps)
          .where(eq(pipelineSteps.pipelineId, pipeline.id))
          .orderBy(desc(pipelineSteps.createdAt));

        return {
          ...pipeline,
          steps,
        };
      })
    );

    return {
      data: pipelinesWithSteps,
      total: totalCount,
      limit: validatedOptions.limit || 50,
      offset: validatedOptions.offset || 0,
    };
  };

  const deletePipeline = async (id: string) => {
    await db.delete(pipelines).where(eq(pipelines.id, id));
  };

  const getPipelineStepById = async (id: string) => {
    const [step] = await db
      .select()
      .from(pipelineSteps)
      .where(eq(pipelineSteps.id, id))
      .limit(1);
    return step;
  };

  const updatePipelineMetadata = async (
    id: string,
    metadata: Record<string, unknown>
  ) => {
    const [pipeline] = await db
      .update(pipelines)
      .set({ 
        metadata, 
        updatedAt: new Date() 
      })
      .where(eq(pipelines.id, id))
      .returning();

    return pipeline;
  };

  return {
    createPipeline,
    updatePipelineStatus,
    createPipelineStep,
    updatePipelineStep,
    getPipeline,
    listPipelines,
    deletePipeline,
    getPipelineStepById,
    updatePipelineMetadata,
  };
};

export const pipelineService = createPipelineService();

// Export the type for the service registry
export type PipelineService = typeof pipelineService;
