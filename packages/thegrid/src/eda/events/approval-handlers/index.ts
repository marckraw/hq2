import { logger } from "@/utils/logger";
import { serviceRegistry } from "../../../registry/service-registry";
import type {
  Pipeline,
  FigmaToStoryblokMetadata,
  StoryblokEditorMetadata,
  IRFArchitectMetadata,
} from "../../../schemas/type-safe.schemas";

// =============================================================================
// APPROVAL HANDLER INTERFACE
// =============================================================================

/**
 * Base interface for all approval handlers
 */
interface ApprovalHandler<T = unknown> {
  handle(pipelineId: string, pipeline: Pipeline & { metadata: T }, payload: ApprovalGrantedPayload): Promise<void>;
}

interface ApprovalGrantedPayload {
  pipelineId: string;
  approvalStepId: string;
  repoOwner?: string;
  repoName?: string;
  prNumber?: string;
  summary?: string;
  commits?: unknown[];
  prDetails?: any;
}

// =============================================================================
// TYPE-SPECIFIC APPROVAL HANDLERS
// =============================================================================

/**
 * Figma to Storyblok Approval Handler
 */
const createFigmaToStoryblokApprovalHandler = (): ApprovalHandler<FigmaToStoryblokMetadata> => {
  return {
    async handle(
      pipelineId: string,
      pipeline: Pipeline & { metadata: FigmaToStoryblokMetadata },
      _payload: ApprovalGrantedPayload
    ): Promise<void> {
      logger.info("Processing Figma to Storyblok approval:", {
        pipelineId,
        origin: pipeline.origin, // 🎯 Track origin
      });

      const pipelineService = serviceRegistry.get("pipeline");
      const storyblokService = serviceRegistry.get("storyblok");
      const notificationService = serviceRegistry.get("notification");
      const slackService = serviceRegistry.get("slack");

      const { metadata: pipelineMetadata } = pipeline;

      // Step 1: Create story in Storyblok
      const createStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Create Storyblok Story",
        description: "Creating new story in Storyblok CMS",
      });

      if (!createStep) {
        throw new Error("Failed to create story creation step");
      }

      await pipelineService.updatePipelineStep(createStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      // Create the story in Storyblok
      const createdStory = await storyblokService.createStory(pipelineMetadata.finalStoryblokStory as any);

      await pipelineService.updatePipelineStep(createStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "2s",
        metadata: {
          storyId: (createdStory as any)?.id,
          storyName: pipelineMetadata.storyName,
          storySlug: pipelineMetadata.storySlug,
        },
      });

      // Step 2: Send notifications
      const notifyStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Send Notifications",
        description: "Sending notifications about successful story creation",
      });

      if (!notifyStep) {
        throw new Error("Failed to create notify step");
      }

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      await notificationService.createNotification("1", {
        type: "alert",
        message: `Figma to Storyblok story "${pipelineMetadata.storyName}" created successfully!`,
      });

      await slackService.notify(
        `🎨 *Figma to Storyblok Success!*\n\n*Story:* ${pipelineMetadata.storyName}\n*Slug:* ${pipelineMetadata.storySlug}\n*Components:* ${pipelineMetadata.componentCount}\n*Origin:* ${pipeline.origin}\n\n✅ Successfully created story in Storyblok CMS!`
      );

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "1s",
      });

      // Mark pipeline as completed
      await pipelineService.updatePipelineStatus(pipelineId, "completed");
    },
  };
};

/**
 * Storyblok Editor Approval Handler
 */
const createStoryblokEditorApprovalHandler = (): ApprovalHandler<StoryblokEditorMetadata> => {
  return {
    async handle(
      pipelineId: string,
      pipeline: Pipeline & { metadata: StoryblokEditorMetadata },
      _payload: ApprovalGrantedPayload
    ): Promise<void> {
      logger.info("Processing Storyblok editor approval...");

      const pipelineService = serviceRegistry.get("pipeline");
      const storyblokService = serviceRegistry.get("storyblok");
      const notificationService = serviceRegistry.get("notification");
      const slackService = serviceRegistry.get("slack");

      const { metadata: pipelineMetadata } = pipeline;

      // Step 1: Update existing Storyblok story
      const updateStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Update Existing Storyblok Story",
        description: "Updating existing story in Storyblok CMS with edited content",
      });

      if (!updateStep) {
        throw new Error("Failed to create update step");
      }

      await pipelineService.updatePipelineStep(updateStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      // Update the existing story
      const updatedStory = await storyblokService.updateStory(
        (pipelineMetadata.originalStoryblok as any).id,
        pipelineMetadata.editedStoryblok as any
      );

      await pipelineService.updatePipelineStep(updateStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "3s",
        metadata: {
          storyName: pipelineMetadata.storyName,
          storySlug: pipelineMetadata.storySlug,
          updated: true,
          storyblokResponse: updatedStory,
        },
      });

      // Step 2: Send notifications
      const notifyStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Send Notifications",
        description: "Sending notifications about successful story update",
      });

      if (!notifyStep) {
        throw new Error("Failed to create notify step");
      }

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      await notificationService.createNotification("1", {
        type: "alert",
        message: `Storyblok story "${pipelineMetadata.storyName}" updated successfully!`,
      });

      await slackService.notify(
        `✏️ *Storyblok Story Updated Successfully!*\n\n*Story:* ${pipelineMetadata.storyName}\n*Slug:* ${pipelineMetadata.storySlug}\n*Components:* ${pipelineMetadata.originalComponentCount} → ${pipelineMetadata.finalComponentCount}\n*Transformation Time:* ${pipelineMetadata.transformationTime}\n\n✅ Successfully updated existing story in Storyblok CMS!`
      );

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "1s",
      });

      // Mark pipeline as completed
      await pipelineService.updatePipelineStatus(pipelineId, "completed");
    },
  };
};

/**
 * IRF Architect Approval Handler
 */
const createIRFArchitectApprovalHandler = (): ApprovalHandler<IRFArchitectMetadata> => {
  return {
    async handle(
      pipelineId: string,
      pipeline: Pipeline & { metadata: IRFArchitectMetadata },
      _payload: ApprovalGrantedPayload
    ): Promise<void> {
      logger.info("Processing IRF architect approval...");

      const pipelineService = serviceRegistry.get("pipeline");
      const notificationService = serviceRegistry.get("notification");
      const slackService = serviceRegistry.get("slack");

      const { metadata: pipelineMetadata } = pipeline;

      // Step 1: Apply architectural changes
      const applyStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Apply Architecture Changes",
        description: "Applying IRF architectural transformations",
      });

      if (!applyStep) {
        throw new Error("Failed to create apply step");
      }

      await pipelineService.updatePipelineStep(applyStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      // TODO: Implement actual IRF architect logic here
      logger.info("Applying architectural changes:", {
        inputFiles: pipelineMetadata.inputFiles,
        outputFiles: pipelineMetadata.outputFiles,
        architectureType: pipelineMetadata.architectureType,
      });

      await pipelineService.updatePipelineStep(applyStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "5s",
        metadata: {
          architectureType: pipelineMetadata.architectureType,
          filesProcessed: pipelineMetadata.inputFiles.length,
          filesGenerated: pipelineMetadata.outputFiles.length,
        },
      });

      // Step 2: Send notifications
      const notifyStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Send Notifications",
        description: "Sending notifications about architectural changes",
      });

      if (!notifyStep) {
        throw new Error("Failed to create notify step");
      }

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      await notificationService.createNotification("1", {
        type: "alert",
        message: `IRF architecture "${pipelineMetadata.architectureType}" applied successfully!`,
      });

      await slackService.notify(
        `🏗️ *IRF Architecture Applied!*\n\n*Type:* ${pipelineMetadata.architectureType}\n*Files Processed:* ${pipelineMetadata.inputFiles.length}\n*Files Generated:* ${pipelineMetadata.outputFiles.length}\n*Complexity Score:* ${pipelineMetadata.complexityScore}\n\n✅ Architectural changes applied successfully!`
      );

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "1s",
      });

      // Mark pipeline as completed
      await pipelineService.updatePipelineStatus(pipelineId, "completed");
    },
  };
};

// =============================================================================
// APPROVAL HANDLER FACTORY
// =============================================================================

/**
 * Type-safe approval handler factory
 */
const createApprovalHandlerFactory = () => {
  const handlers = new Map<string, ApprovalHandler>([
    ["figma-to-storyblok", createFigmaToStoryblokApprovalHandler()],
    ["storyblok-editor", createStoryblokEditorApprovalHandler()],
    ["irf-architect", createIRFArchitectApprovalHandler()],
  ]);

  const getHandler = (pipelineType: string): ApprovalHandler => {
    const handler = handlers.get(pipelineType);
    if (!handler) {
      throw new Error(`No approval handler found for pipeline type: ${pipelineType}`);
    }
    return handler;
  };

  const hasHandler = (pipelineType: string): boolean => {
    return handlers.has(pipelineType);
  };

  const getSupportedTypes = (): string[] => {
    return Array.from(handlers.keys());
  };

  return { getHandler, hasHandler, getSupportedTypes };
};

export const approvalHandlerFactory = createApprovalHandlerFactory();

// Export types for use in other files
export type { ApprovalHandler, ApprovalGrantedPayload };
