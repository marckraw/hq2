import { logger } from "@/utils/logger";
import { serviceRegistry } from "../../../registry/service-registry";
import { EventPayloads } from "../types";

/**
 * Direct function that performs the storyblok editor completion logic
 * and returns the approvalId. Can be called directly or via event handler.
 */
export const storyblokEditorCompletedFunction = async (
  payload: EventPayloads["storyblok-editor.completed"]
): Promise<any> => {
  const { editedStoryblok, metadata, irf, originalStoryblok } = payload;

  // Get services from registry
  const pipelineService = serviceRegistry.get("pipeline");
  const slackService = serviceRegistry.get("slack");
  const notificationService = serviceRegistry.get("notification");
  const approvalService = serviceRegistry.get("approval");
  const diffService = serviceRegistry.get("diff");

  try {
    // Generate diff between original and edited Storyblok stories
    logger.info("Generating diff between original and edited Storyblok stories");
    const diff = await diffService.generateStoryblokDiff(originalStoryblok, editedStoryblok, {
      includeVisualDiff: true,
      includeMarkdownDiff: true,
      ignoreProperties: ["_uid", "_editable", "updated_at"],
    });

    const diffSummary = diffService.generateDiffSummary(diff);
    logger.info("Diff generated successfully", {
      summary: diff.summary,
      textSummary: diffSummary,
    });

    // Create a pipeline for this Storyblok editing operation
    const pipeline = await pipelineService.createPipeline({
      name: `Storyblok Editor Pipeline - ${metadata.storyName}`,
      description: "Editing Storyblok content via IRF transformation",
      source: "storyblok-editor",
      type: "cms-publication",
      metadata: {
        source: "storyblok-editor",
        storyName: metadata.storyName,
        storySlug: metadata.storySlug,
        originalComponentCount: metadata.originalComponentCount,
        finalComponentCount: metadata.finalComponentCount,
        spaceId: metadata.spaceId,
        transformationTime: metadata.transformationTime,
        irf,
        editedStoryblok,
        originalStoryblok,
        diff,
        diffSummary,
      },
    });

    if (!pipeline) {
      throw new Error("Failed to create pipeline");
    }

    // Step 1: Content editing completed (already done)
    const editingStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Storyblok Content Editing",
      description: "Converting Storyblok to IRF, editing, and converting back",
    });

    if (!editingStep) {
      throw new Error("Failed to create editing step");
    }

    await pipelineService.updatePipelineStep(editingStep.id, {
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      duration: metadata.transformationTime,
      metadata: {
        originalComponentCount: metadata.originalComponentCount,
        finalComponentCount: metadata.finalComponentCount,
      },
    });

    // Step 2: Approval required before CMS publication
    const approvalStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Approval: Storyblok Content Update",
      description: "Waiting for human approval before updating Storyblok content.",
      metadata: {
        source: "storyblok-editor",
        irf,
        storyName: metadata.storyName,
        storySlug: metadata.storySlug,
        editedStoryblok,
        originalStoryblok,
        diff,
        diffSummary,
      },
    });

    if (!approvalStep) {
      throw new Error("Failed to create approval step");
    }

    await pipelineService.updatePipelineStep(approvalStep.id, {
      status: "waiting_approval",
      startedAt: new Date(),
      metadata: {
        source: "storyblok-editor",
        storyName: metadata.storyName,
        storySlug: metadata.storySlug,
        editedStoryblok,
        originalStoryblok,
        diff,
        diffSummary,
      },
    });

    const approval = await approvalService.createApproval({
      pipelineStepId: approvalStep.id,
      approvalType: "storyblok-editor",
      risk: "low",
    });

    // Send notification about the approval
    await notificationService.createNotification("1", {
      type: "alert",
      message: `Storyblok content editing complete! Approval needed for "${metadata.storyName}" update.`,
    });
    await slackService.notify(
      `✏️ *Storyblok Editor Ready for Approval*\n\n*Story:* ${metadata.storyName}\n*Slug:* ${metadata.storySlug}\n*Components:* ${metadata.originalComponentCount} → ${metadata.finalComponentCount}\n*Transformation Time:* ${metadata.transformationTime}\n*Changes:* ${diffSummary}\n\n✅ Content editing complete! Awaiting approval for CMS update.`
    );

    // Return the approvalId when called directly
    return approval;
  } catch (error: any) {
    logger.error("Error processing storyblok-editor.completed:", error);
    const errorMessage = `Failed to create approval for Storyblok editing: ${
      metadata.storyName
    }: ${error.message || "Unknown error"}`;
    await notificationService.createNotification("1", {
      type: "alert",
      message: errorMessage,
    });
    await slackService.notify(`❌ ${errorMessage}`);

    // Return undefined on error
    return undefined;
  }
};

/**
 * Event handler wrapper that calls the function but doesn't return anything
 * This maintains the event-driven architecture contract
 */
export const storyblokEditorCompletedEventHandler = async (
  payload: EventPayloads["storyblok-editor.completed"]
): Promise<void> => {
  // Call the function but don't return the value (event handlers return void)
  await storyblokEditorCompletedFunction(payload);
};
