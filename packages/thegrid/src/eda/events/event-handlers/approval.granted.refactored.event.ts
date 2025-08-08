import { logger } from "@/utils/logger";
import { serviceRegistry } from "../../../registry/service-registry";
import { approvalHandlerFactory } from "../approval-handlers";
import { transformDatabasePipeline } from "../../../schemas/type-safe.schemas";

interface ApprovalGrantedEventPayload {
  pipelineId: string;
  approvalStepId: string;
  repoOwner?: string;
  repoName?: string;
  prNumber?: string;
  summary?: string;
  commits?: unknown[];
  prDetails?: any;
}

/**
 * Type-safe approval granted event handler
 *
 * ✅ Replaces messy if/else logic with factory pattern
 * ✅ Uses type-safe handlers for each pipeline type
 * ✅ Validates pipeline metadata at runtime
 * ✅ Provides better error handling and logging
 */
export const approvalGrantedEventHandler = async (
  payload: ApprovalGrantedEventPayload
) => {
  const { pipelineId } = payload;

  try {
    logger.info("Processing approval granted event:", {
      pipelineId,
      approvalStepId: payload.approvalStepId,
    });

    // Get services
    const pipelineService = serviceRegistry.get("pipeline");

    // Fetch the pipeline from database
    const dbPipeline = await pipelineService.getPipeline(pipelineId);
    if (!dbPipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    // ✅ Transform database pipeline to type-safe pipeline with validation
    const typedPipeline = transformDatabasePipeline(dbPipeline);

    logger.info("Pipeline metadata validated:", {
      pipelineId,
      type: typedPipeline.type,
      source: typedPipeline.source,
      origin: typedPipeline.origin, // 🎯 Track where pipeline came from
    });

    // Get the approval step
    const step = await pipelineService.getPipelineStepById(
      payload.approvalStepId
    );
    if (!step) {
      throw new Error(`Pipeline step not found: ${payload.approvalStepId}`);
    }

    // Mark the approval step as completed
    await pipelineService.updatePipelineStep(payload.approvalStepId, {
      status: "completed",
      completedAt: new Date(),
      duration: "1s",
    });

    // ✅ Type-safe dispatch - no more if/else!
    const handler = approvalHandlerFactory.getHandler(typedPipeline.type);

    logger.info("Dispatching to type-safe handler:", {
      pipelineType: typedPipeline.type,
      origin: typedPipeline.origin,
      handlerFound: true,
    });

    // ✅ Handler receives fully typed pipeline with validated metadata
    await handler.handle(pipelineId, typedPipeline, payload);

    logger.info("Approval processing completed successfully:", {
      pipelineId,
      pipelineType: typedPipeline.type,
      origin: typedPipeline.origin,
    });
  } catch (error: any) {
    logger.error("Error processing approval granted event:", {
      pipelineId,
      error: error.message,
      stack: error.stack,
    });

    // Mark pipeline as failed
    const pipelineService = serviceRegistry.get("pipeline");
    await pipelineService.updatePipelineStatus(pipelineId, "failed");

    // If it's an unknown pipeline type, log supported types
    if (error.message.includes("No approval handler found")) {
      logger.error("Supported pipeline types:", {
        supportedTypes: approvalHandlerFactory.getSupportedTypes(),
      });
    }

    throw error;
  }
};
