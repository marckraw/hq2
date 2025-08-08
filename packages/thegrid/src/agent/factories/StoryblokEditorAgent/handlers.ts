import { logger, userLogger } from "@/utils/logger";
import { serviceRegistry } from "@/registry/service-registry";
import { validateIRF, generateAgentFeedback } from "../IRFArchitectAgent/validation";
import { irfTraversingService } from "@/domains/irf/services/IRFTraversingService/irf-traversing.service";
import { exampleData } from "@/domains/irf/example-data";
import { storyblokEditorCompletedFunction } from "@/eda/events/event-handlers/storyblok-editor.completed.event";
import { type CustomHandlers } from "@mrck-labs/grid-core";
import { RequestContext } from "@/routes/api/agent/requestContext";
import { langfuse } from "@/domains/ai/services";

// Interface for preprocessed data
interface PreprocessedStoryblokData {
  storyblokContent: any;
  irfLayout: any;
  editInstructions: string;
  metadata: {
    source: "api" | "example";
    space?: string;
    story?: string;
  };
}

/**
 * Custom handlers for the Storyblok Editor Agent
 * Handles Storyblok fetching, IRF transformations, validation, and event emission
 */
export const createStoryblokEditorHandlers = (): CustomHandlers => {
  const storyblokToIRFService = serviceRegistry.get("storyblokToIRF");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");
  const storyblokService = serviceRegistry.get("storyblok");

  let preprocessedData: PreprocessedStoryblokData | null = null;

  return {
    beforeAct: async ({ input, _config, sendUpdate }) => {
      const _langfuse = serviceRegistry.get("langfuse");
      const conversationContext = RequestContext.get();
      console.log("Test if we can get a context super deep: ");
      console.log(conversationContext);

      await sendUpdate({
        type: "unknown",
        content: "Custom beforeAct handler",
      });

      return {
        messages: input.messages,
        tools: input.tools,
        context: input.context,
      };
    },

    // Transform input to fetch Storyblok content and convert to IRF
    transformInput: async ({ input, sendUpdate }) => {
      const conversationContext = RequestContext.get();
      console.log("Test if we can get a context super deep: ");
      console.log(conversationContext);

      await sendUpdate({
        type: "unknown",
        content: "Working...",
      });

      const firstMessage = input.messages[0];
      if (!firstMessage) {
        throw new Error("No messages provided in input");
      }

      // Extract edit instructions from the message
      const editInstructions = firstMessage.content;

      // Check if we have contextData with Storyblok selections
      const contextData = input.context?.sessionData?.contextData;
      let storyblokContent;
      let metadata: PreprocessedStoryblokData["metadata"];

      if (contextData?.selectedStoryId && contextData?.selectedSpace) {
        // Use real Storyblok content from API
        logger.info("🔍 Fetching real Storyblok content from API...", {
          space: contextData.selectedSpace,
          story: contextData.selectedStoryId,
        });

        try {
          // Debug: List stories to verify
          logger.info("🔍 DEBUG: Fetching all stories from space to verify story exists...");
          const allStories = await storyblokService.getAllStoriesFromSpace(contextData.selectedSpace);
          logger.info(`📋 Found ${allStories.length} stories in space ${contextData.selectedSpace}`);

          // Log first few stories
          allStories.slice(0, 5).forEach((story) => {
            logger.info(`  - Story ID: ${story.id}, Name: "${story.name}", Slug: "${story.slug}"`);
          });

          // Check if target story exists
          const targetStory = allStories.find((story) => story.id.toString() === contextData.selectedStoryId);
          if (targetStory) {
            logger.info(`✅ Found target story: ID ${targetStory.id}, Name: "${targetStory.name}"`);
          } else {
            logger.warn(`❌ Target story ${contextData.selectedStory} NOT found in space ${contextData.selectedSpace}`);
            logger.info(
              "Available story IDs:",
              allStories.map((s) => s.id.toString())
            );
          }

          // Fetch the actual story content
          const storyContent = await storyblokService.getStoryContent(
            contextData.selectedSpace,
            contextData.selectedStoryId
          );

          if (!storyContent) {
            throw new Error("Failed to fetch story content from Storyblok API");
          }

          storyblokContent = storyContent;
          metadata = {
            source: "api",
            space: contextData.selectedSpace,
            story: contextData.selectedStoryId,
          };

          logger.info("✅ Successfully fetched real Storyblok content");
        } catch (error) {
          logger.warn("⚠️ Failed to fetch real Storyblok content, falling back to example data", error);
          // Fallback to example data
          storyblokContent = { ...exampleData.story };
          metadata = { source: "example" };
        }
      } else if (!contextData?.selectedStoryId && contextData?.selectedStory && contextData?.selectedSpace) {
        // no need to fetch the story, becasue we have the story in the context already
        storyblokContent = contextData.selectedStory;
        metadata = {
          source: "api",
          space: contextData.selectedSpace,
          story: contextData.selectedStory,
        };
        userLogger.log(
          "[hq.ef.design] [storyblok-editor.agent.ts] transformInput: [metadata] - no need to fetch the story, becasue we have the story in the context already",
          {
            metadata,
          }
        );
      } else {
        // Fallback to example data when no contextData is provided
        logger.info("📝 No contextData provided, using example Storyblok data");
        storyblokContent = { ...exampleData.story };
        metadata = { source: "example" };
      }

      // Transform Storyblok to IRF
      logger.info("🔄 Transforming Storyblok to IRF...");
      userLogger.log("[hq.ef.design] [storyblok-editor.agent.ts] transformInput: [storyblokContent]", {
        storyblokContent,
      });
      await sendUpdate({
        type: "unknown",
        content: "Transforming Storyblok to IRF...",
      });
      const irfTransformationResult = await storyblokToIRFService.transformStoryblokToIRF(
        // @ts-ignore
        storyblokContent,
        {
          includeMetadata: true,
          globalVars: {},
        }
      );

      if (!irfTransformationResult.success) {
        throw new Error(`Failed to transform Storyblok to IRF: ${irfTransformationResult.errors?.join(", ")}`);
      }

      logger.info("✅ Storyblok to IRF transformation successful");
      await sendUpdate({
        type: "success",
        content: "Transformation successful",
      });

      // Store preprocessed data for later use
      preprocessedData = {
        storyblokContent,
        irfLayout: irfTransformationResult.irfLayout,
        editInstructions,
        metadata,
      };

      // Modify the input messages to include the IRF data
      return {
        ...input,
        messages: [
          {
            role: "system" as const,
            content: input.messages.find((m: any) => m.role === "system")?.content || "",
          },
          {
            role: "user" as const,
            content: `Here is the current IRF structure converted from Storyblok:
  
  ${JSON.stringify(irfTransformationResult.irfLayout, null, 2)}
  
  Edit Instructions: ${editInstructions || "Please make improvements to the content structure"}
  
  Please return the modified IRF structure as JSON.`,
          },
        ],
      };
    },

    // Validate the modified IRF response
    validateResponse: async ({ response, sendUpdate }) => {
      try {
        const modifiedIRF = response.content ? JSON.parse(response.content) : {};
        const validationResult = validateIRF(modifiedIRF);

        if (!validationResult.isValid) {
          await sendUpdate({
            type: "warning",
            content: "IRF validation failed",
          });
          logger.info(`❌ IRF validation failed`, {
            errors: validationResult.errors.length,
            warnings: validationResult.warnings.length,
          });

          // Log detailed validation errors
          logger.error("IRF validation errors:", {
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            feedback: generateAgentFeedback(validationResult),
          });

          return {
            isValid: false,
            errors: [generateAgentFeedback(validationResult)],
          };
        }

        await sendUpdate({
          type: "success",
          content: "IRF validation passed",
        });
        logger.info(`✅ IRF validation passed`);
        return { isValid: true };
      } catch (error) {
        logger.error("Failed to parse or validate IRF response:", error);
        return {
          isValid: false,
          errors: [`Failed to parse JSON response: ${error}`],
        };
      }
    },

    // Transform validated IRF back to Storyblok
    transformOutput: async ({ output, sendUpdate }) => {
      if (!preprocessedData) {
        logger.error("No preprocessed data available for transformation");
        return output;
      }

      try {
        const modifiedIRF = JSON.parse(output.content);

        await sendUpdate({
          type: "unknown",
          content: "Validating Final IRF",
        });
        // Double-check validation before transformation
        const validationResult = validateIRF(modifiedIRF);
        if (!validationResult.isValid) {
          logger.warn("IRF validation failed in transformOutput, skipping transformation");
          logger.error("Validation errors in transformOutput:", {
            errors: validationResult.errors,
            warnings: validationResult.warnings,
          });
          preprocessedData = null; // Clear preprocessed data
          return output; // Return original response without transformation
        }

        // Enrich the IRF
        const enrichedIRF = await irfTraversingService.traverseAndEnrich(modifiedIRF, {
          enrichWithParent: true,
          validateNodes: false,
        });

        await sendUpdate({
          type: "unknown",
          content: "Enriching IRF",
        });

        // Transform back to Storyblok
        logger.info("🔄 Transforming modified IRF back to Storyblok...");
        await sendUpdate({
          type: "unknown",
          content: "Transforming modified IRF back to Storyblok...",
        });
        const storyblokTransformationResult = await irfToStoryblokService.transformIRFToStoryblok(
          enrichedIRF.enrichedLayout,
          {
            includeMetadata: true,
            storyName: preprocessedData.storyblokContent.name,
            storySlug: preprocessedData.storyblokContent.slug,
          }
        );

        if (!storyblokTransformationResult.success) {
          throw new Error(
            `Failed to transform IRF back to Storyblok: ${storyblokTransformationResult.errors?.join(", ")}`
          );
        }

        logger.info("✅ IRF to Storyblok transformation successful");

        // Emit event for integration
        // eventBus.emit("storyblok-editor.completed", {
        //   originalStoryblok: preprocessedData.storyblokContent,
        //   irf: enrichedIRF.enrichedLayout,
        //   editedStoryblok: storyblokTransformationResult.story,
        //   metadata: {
        //     transformationTime: new Date().toISOString(),
        //     originalComponentCount: storyblokTransformationResult.metadata.componentCount,
        //     finalComponentCount: storyblokTransformationResult.metadata.componentCount,
        //     storyName: preprocessedData.storyblokContent.name,
        //     storySlug: preprocessedData.storyblokContent.slug,
        //     spaceId: preprocessedData.metadata.space || "whatever",
        //   },
        // });

        await sendUpdate({
          type: "unknown",
          content: "Creating approval",
        });

        const approval = await storyblokEditorCompletedFunction({
          originalStoryblok: preprocessedData.storyblokContent,
          irf: enrichedIRF.enrichedLayout,
          editedStoryblok: storyblokTransformationResult.story,
          metadata: {
            transformationTime: new Date().toISOString(),
            originalComponentCount: storyblokTransformationResult.metadata.componentCount,
            finalComponentCount: storyblokTransformationResult.metadata.componentCount,
            storyName: preprocessedData.storyblokContent.name,
            storySlug: preprocessedData.storyblokContent.slug,
            spaceId: preprocessedData.metadata.space || "whatever",
          },
        });

        userLogger.info("✅ Approval created with ID:", approval.id);

        await sendUpdate({
          // @ts-ignore
          type: "approvalId",
          content: `Sending approval id to the frontend ${approval.id}`,
          metadata: {
            approvalId: approval.id,
          },
        });

        // Return enriched response with approvalId
        return {
          role: "assistant",
          content: JSON.stringify({
            success: true,
            originalStoryblok: preprocessedData.storyblokContent,
            irf: enrichedIRF.enrichedLayout,
            editedStoryblok: storyblokTransformationResult.story,
            metadata: {
              transformationTime: new Date().toISOString(),
              originalComponentCount: storyblokTransformationResult.metadata.componentCount,
              finalComponentCount: storyblokTransformationResult.metadata.componentCount,
              source: preprocessedData.metadata.source,
            },
          }),
        };
      } catch (error) {
        logger.error("Failed to transform Storyblok output:", error);
        // Return original response if transformation fails
        return output;
      } finally {
        // Clear preprocessed data
        preprocessedData = null;
      }
    },

    // Handle errors during processing
    onError: async ({ error, attempt }) => {
      logger.error(`Storyblok editing error on attempt ${attempt}:`, error);

      // Clear preprocessed data on error
      preprocessedData = null;

      // Let the framework handle retries based on maxRetries config
      return {
        error: error.message || String(error),
        attempt,
        retry: true,
      };
    },
  };
};
