import { logger } from "@/utils/logger";
import { serviceRegistry } from "../../../registry/service-registry";
import { createStoryblokService } from "@/domains/integration/services/StoryblokService/storyblok.service";
import { wait } from "../../../utils";

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
 * Direct function that performs the storyblok approval granted logic
 * Can be called directly or via event handler.
 */
export const approvalGrantedEventFunction = async (payload: ApprovalGrantedEventPayload) => {
  const { pipelineId, approvalStepId, repoOwner, repoName, prNumber, summary, prDetails } = payload;

  // Get services from registry
  const pipelineService = serviceRegistry.get("pipeline");
  const slackService = serviceRegistry.get("slack");
  const notificationService = serviceRegistry.get("notification");
  const changelogService = serviceRegistry.get("changelog");

  try {
    // Mark approval step as completed
    await pipelineService.updatePipelineStep(approvalStepId, {
      status: "completed",
      completedAt: new Date(),
      duration: "1s",
    });

    // Get pipeline to determine type
    const pipeline = await pipelineService.getPipeline(pipelineId);
    if (!pipeline) {
      logger.error("Pipeline not found:", pipelineId);
      return;
    }

    // Handle different pipeline types
    if (pipeline.type === "cms-publication" && pipeline.source === "figma-to-storyblok") {
      // 🎨 Handle Figma to Storyblok CMS publication
      logger.info("Processing Figma to Storyblok approval...");

      const pipelineMetadata = pipeline.metadata as any;
      const finalStoryblokStory = pipelineMetadata?.finalStoryblokStory;

      const spaceId = pipelineMetadata?.spaceId || "317084";
      if (!spaceId) {
        throw new Error("No space ID found in pipeline metadata");
      }

      const storyblokService = createStoryblokService({
        spaceId,
      });

      if (!finalStoryblokStory) {
        throw new Error("No Storyblok story data found in pipeline metadata");
      }

      // Step 3: Publish to Storyblok CMS
      const publishStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Publish to Storyblok CMS",
        description: "Creating story in Storyblok CMS",
      });

      if (!publishStep) {
        throw new Error("Failed to create publish step");
      }

      await pipelineService.updatePipelineStep(publishStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });
      await wait(3000);

      // 🚀 Publish to Storyblok CMS using the service
      try {
        // const publishedStory = await storyblokService.getAllStories();
        const publishedStory = await storyblokService.createAndAttachStory({
          name: finalStoryblokStory.name,
          slug: finalStoryblokStory.slug,
          content: finalStoryblokStory.content,
          published: false, // Create as draft first
          tag_list: finalStoryblokStory.tag_list || [],
          is_startpage: finalStoryblokStory.is_startpage || false,
        });

        logger.info("Successfully published to Storyblok CMS:", publishedStory);

        await pipelineService.updatePipelineStep(publishStep.id, {
          status: "completed",
          completedAt: new Date(),
          duration: "3s",
          metadata: {
            storyName: finalStoryblokStory.name,
            storySlug: finalStoryblokStory.slug,
            published: true,
            storyblokResponse: publishedStory,
          },
        });
      } catch (storyblokError: any) {
        logger.error("Failed to publish to Storyblok:", storyblokError);
        await pipelineService.updatePipelineStep(publishStep.id, {
          status: "failed",
          completedAt: new Date(),
          duration: "3s",
          metadata: {
            error: storyblokError.message || "Unknown error",
          },
        });
        throw storyblokError;
      }

      // Step 4: Send notifications
      const notifyStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Send Notifications",
        description: "Sending notifications about successful publication",
      });

      if (!notifyStep) {
        throw new Error("Failed to create notify step");
      }

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });
      await wait(1000);

      await notificationService.createNotification("1", {
        type: "alert",
        message: `Storyblok page "${finalStoryblokStory.name}" published successfully!`,
      });

      await slackService.notify(
        `🎉 *Storyblok Page Published!*\n\n*Story:* ${finalStoryblokStory.name}\n*Slug:* ${finalStoryblokStory.slug}\n*Components:* ${pipelineMetadata.componentCount}\n\n✅ Successfully published to Storyblok CMS!`
      );

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "1s",
      });

      // Mark pipeline as completed
      await pipelineService.updatePipelineStatus(pipelineId, "completed");
    } else if (pipeline.type === "cms-publication" && pipeline.source === "storyblok-editor") {
      // ✏️ Handle Storyblok Editor CMS publication
      logger.info("Processing Storyblok Editor approval...");

      const pipelineMetadata = pipeline.metadata as any;

      console.log("#################");
      console.log("This is pipeline Metadata in approval.granted.event.ts");
      console.log(pipelineMetadata);
      console.log("#################");
      const editedStoryblok = pipelineMetadata?.editedStoryblok;
      const originalStoryblok = pipelineMetadata?.originalStoryblok;

      const spaceId = pipelineMetadata?.spaceId;
      if (!spaceId) {
        throw new Error("No space ID found in pipeline metadata");
      }

      const storyblokService = createStoryblokService({
        spaceId,
      });

      if (!editedStoryblok) {
        throw new Error("No edited Storyblok data found in pipeline metadata");
      }

      // Step 3: Update existing Storyblok story
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
      await wait(3000);

      // 🚀 Update existing Storyblok story using the service
      try {
        // Original story found - proceed with update
        // Debug: Log the original story to understand the slug format
        logger.info("Original story data:", {
          id: originalStoryblok.id,
          slug: editedStoryblok.slug,
          full_slug: editedStoryblok.full_slug,
          name: editedStoryblok.name,
        });

        // Prepare update payload - only update content, keep everything else the same
        const updatePayload: any = {
          name: editedStoryblok.name, // Keep original name
          slug: editedStoryblok.slug, // Keep original slug
          content: editedStoryblok.content, // Only update the content
          tag_list: editedStoryblok.tag_list, // Keep original tags
          is_startpage: editedStoryblok.is_startpage, // Keep original startpage setting
          parent_id: editedStoryblok.parent_id, // Keep original parent
          position: editedStoryblok.position, // Keep original position
        };

        const updatedStory = await storyblokService.updateStory(originalStoryblok.id, updatePayload, {
          forceUpdate: true, // Override any locks
          publish: false, // Keep as draft for now
        });

        logger.info("Successfully updated Storyblok story:", updatedStory);

        await pipelineService.updatePipelineStep(updateStep.id, {
          status: "completed",
          completedAt: new Date(),
          duration: "3s",
          metadata: {
            originalStoryId: originalStoryblok.id,
            storyName: editedStoryblok.name || pipelineMetadata.storyName,
            storySlug: editedStoryblok.slug || pipelineMetadata.storySlug,
            updated: true,
            storyblokResponse: updatedStory,
          },
        });
      } catch (storyblokError: any) {
        logger.error("Failed to update Storyblok story:", storyblokError);
        await pipelineService.updatePipelineStep(updateStep.id, {
          status: "failed",
          completedAt: new Date(),
          duration: "3s",
          metadata: {
            error: storyblokError.message || "Unknown error",
          },
        });
        throw storyblokError;
      }

      // Step 4: Send notifications
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
      await wait(1000);

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
    } else if (pipeline.type === "changelog") {
      // 📝 Handle changelog creation (existing logic)
      logger.info("Processing changelog approval...");

      // Step 5: Create changelog
      const createChangelogStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Create Changelog",
        description: "Creating changelog entry in database",
      });

      if (!createChangelogStep) {
        throw new Error("Failed to create changelog step");
      }

      await pipelineService.updatePipelineStep(createChangelogStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });
      await wait(3000);
      await changelogService.createChangelog({
        repoOwner: repoOwner || "",
        repoName: repoName || "",
        prNumber: prNumber ? String(prNumber) : "",
        title: typeof prDetails?.title === "string" ? prDetails.title : undefined,
        summary: typeof summary === "string" ? summary.replace(/^"|"$/g, "").replace(/\\n/g, "\n") : "",
        createdBy: "system",
      });
      await pipelineService.updatePipelineStep(createChangelogStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "1s",
      });

      // Step 6: Send notifications
      const notifyStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Send Notifications",
        description: "Sending notifications to Slack and Horizon",
      });

      if (!notifyStep) {
        throw new Error("Failed to create notify step");
      }

      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "in_progress",
        startedAt: new Date(),
      });
      await wait(3000);
      await notificationService.createNotification("1", {
        type: "alert",
        message: `Release changelog created for ${repoOwner}/${repoName} PR #${prNumber}`,
      });
      const slackMessage = `🚀 *New Release Changelog*\n\n*Repository:* ${repoOwner}/${repoName}\n*PR:* #${prNumber}\n*Title:* ${prDetails?.title}\n\n*Summary:*\n${summary}`;
      const cleanSummary = slackMessage.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
      await slackService.notify(cleanSummary);
      await pipelineService.updatePipelineStep(notifyStep.id, {
        status: "completed",
        completedAt: new Date(),
        duration: "1s",
      });

      // Mark pipeline as completed
      await pipelineService.updatePipelineStatus(pipelineId, "completed");
    } else {
      logger.info(`Unknown pipeline type: ${pipeline.type}, source: ${pipeline.source}`);
    }
  } catch (error: any) {
    logger.error("Error resuming pipeline after approval:", error);
    // Mark pipeline as failed
    await pipelineService.updatePipelineStatus(pipelineId, "failed");
  }
};

/**
 * Event handler wrapper that calls the function but doesn't return anything
 * This maintains the event-driven architecture contract
 */
export const approvalGrantedEventHandler = async (payload: ApprovalGrantedEventPayload): Promise<void> => {
  // Call the function but don't return the value (event handlers return void)
  await approvalGrantedEventFunction(payload);
};
