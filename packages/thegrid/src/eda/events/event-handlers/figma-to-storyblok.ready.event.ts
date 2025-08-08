import { logger } from "@/utils/logger";
import { serviceRegistry } from "../../../registry/service-registry";
import { EventPayloads } from "../types";

export const figmaToStoryblokReadyEventHandler = async (
  payload: EventPayloads["figma-to-storyblok.ready"]
) => {
  const { finalStoryblokStory, metadata, irfResult } = payload;

  // Get services from registry
  const pipelineService = serviceRegistry.get("pipeline");
  const slackService = serviceRegistry.get("slack");
  const notificationService = serviceRegistry.get("notification");
  const approvalService = serviceRegistry.get("approval");

  try {
    // Create a pipeline for this Figma to Storyblok transformation
    const pipeline = await pipelineService.createPipeline({
      name: `Figma to Storyblok Pipeline - ${metadata.storyName}`,
      description: "Creating Storyblok page from Figma design",
      source: "figma-to-storyblok",
      type: "cms-publication",
      metadata: {
        figmaFileName: metadata.figmaFileName,
        storyName: metadata.storyName,
        storySlug: metadata.storySlug,
        componentCount: metadata.componentCount,
        nodeCount: metadata.nodeCount,
        irfResult,
        finalStoryblokStory,
      },
    });

    if (!pipeline) {
      throw new Error("Failed to create pipeline");
    }

    // Step 1: Transformation completed (already done)
    const transformationStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Figma to Storyblok Transformation",
      description: "Converting Figma design to Storyblok components",
    });

    if (!transformationStep) {
      throw new Error("Failed to create transformation step");
    }

    await pipelineService.updatePipelineStep(transformationStep.id, {
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      duration: "1s",
      metadata: {
        componentCount: metadata.componentCount,
        nodeCount: metadata.nodeCount,
      },
    });

    // Step 2: Approval required before CMS publication
    const approvalStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Approval: Storyblok CMS Publication",
      description:
        "Waiting for human approval before publishing to Storyblok CMS.",
      metadata: {
        irfResult,
        storyName: metadata.storyName,
        storySlug: metadata.storySlug,
        finalStoryblokStory,
      },
    });

    if (!approvalStep) {
      throw new Error("Failed to create approval step");
    }

    await pipelineService.updatePipelineStep(approvalStep.id, {
      status: "waiting_approval",
      startedAt: new Date(),
      metadata: {
        storyName: metadata.storyName,
        storySlug: metadata.storySlug,
        finalStoryblokStory,
      },
    });
    await approvalService.createApproval({
      pipelineStepId: approvalStep.id,
      approvalType: "figma-to-storyblok",
      risk: "medium",
    });

    // Send notification about the approval
    await notificationService.createNotification("1", {
      type: "alert",
      message: `Figma to Storyblok transformation complete! Approval needed for "${metadata.storyName}" publication.`,
    });
    await slackService.notify(
      `🎨 *Figma to Storyblok Ready for Approval*\n\n*Story:* ${metadata.storyName}\n*Slug:* ${metadata.storySlug}\n*Components:* ${metadata.componentCount}\n\n✅ Transformation complete! Awaiting approval for CMS publication.`
    );

    // PAUSE PIPELINE: Wait for approval.granted event to resume
  } catch (error: any) {
    logger.error("Error processing figma-to-storyblok.ready event:", error);
    const errorMessage = `Failed to create approval for Figma to Storyblok: ${
      metadata.storyName
    }: ${error.message || "Unknown error"}`;
    await notificationService.createNotification("1", {
      type: "alert",
      message: errorMessage,
    });
    await slackService.notify(`❌ ${errorMessage}`);
  }
};
