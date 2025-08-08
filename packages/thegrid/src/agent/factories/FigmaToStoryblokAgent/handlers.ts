import { logger } from "@/utils/logger";
import { mcpServersFactory } from "../../../domains/integration/factories/mcp-servers.factory";
import { createTransformerService } from "./TransformerService/transformer.service";
import type { SimplifiedFigmaResponse } from "./TransformerService/transformer.service.types";
import { serviceRegistry } from "@/registry/service-registry";
import { agentFlowService } from "../../services/AgentFlowService/agent-flow.service";
import { eventBus } from "../../../eda/events/event-bus";
import { constructFinalStoryblokStory } from "./helpers";
import { irfTraversingService } from "@/domains/irf/services/IRFTraversingService/irf-traversing.service";
import { CustomHandlers } from "../configurable-agent.factory";
import { Agent } from "../agents.factory.types";

/**
 * Custom handlers for the Figma to Storyblok Agent
 * Handles MCP tool initialization, Figma data transformation, and event emission
 */
export const createFigmaToStoryblokHandlers = (): CustomHandlers => {
  let mcpTools: any[] = [];

  return {
    // Initialize MCP tools before acting
    beforeAct: async (input) => {
      try {
        const figmaMcpService = await mcpServersFactory.createFigmaMCPServiceClient();
        mcpTools = figmaMcpService?.tools || [];
        logger.info(`Loaded ${mcpTools.length} MCP tools for Figma integration`);
      } catch (error) {
        logger.warn("Failed to load MCP tools, continuing without them", error);
        mcpTools = [];
      }

      // Add MCP tools to the input
      return {
        ...input,
        tools: [...(input.tools || []), ...mcpTools],
      };
    },

    // Handle tool calls and special Figma logic after response
    afterResponse: async (response, input) => {
      // If no tool calls, return response as-is
      if (!response?.tool_calls || response.tool_calls.length === 0) {
        return response;
      }

      const toolCall = response.tool_calls[0];

      // Send progress update: Tool execution starting
      await agentFlowService.sendUpdate({
        type: "tool_execution",
        content: `🔧 Executing ${toolCall.function.name}...`,
        metadata: {
          source: "figma-to-storyblok-agent",
          functionName: toolCall?.function?.name,
          toolCallId: toolCall?.id,
          toolArgs: toolCall?.function?.arguments,
          agentType: "figma-to-storyblok",
        },
      });

      // Execute the tool
      const toolResponse = await agentFlowService.executeToolForAgent({
        toolCall,
        agentType: "figma-to-storyblok",
        agent: {
          availableTools: [...(input.tools || []), ...mcpTools],
          type: "figma-to-storyblok",
          act: async () => ({ role: "assistant" as const, content: "" }),
        } as unknown as Agent,
        userMessage: input.messages[0]?.content || "",
      });

      // Send progress update: Tool execution completed
      await agentFlowService.sendUpdate({
        type: "tool_response",
        content: `✅ Tool execution completed`,
        metadata: {
          toolResponse,
          source: "figma-to-storyblok-agent",
          functionName: toolCall?.function?.name,
          agentType: "figma-to-storyblok",
          isRaw: true,
        },
      });

      // Store tool response in the response for later processing
      return {
        ...response,
        _toolResponse: toolResponse,
        _toolCall: toolCall,
      };
    },

    // Transform output - apply Figma → IRF → Storyblok pipeline if needed
    transformOutput: async (response) => {
      // Check if this was a Figma tool call
      const toolCall = (response as any)._toolCall;
      const toolResponse = (response as any)._toolResponse;

      if (!toolCall || toolCall.function?.name !== "get_figma_data") {
        // For non-Figma tools, return formatted response
        if (toolResponse) {
          return {
            role: "assistant" as const,
            content:
              `🔧 Tool executed: ${toolCall?.function?.name}\n\n` + `**Response:**\n\`\`\`\n${toolResponse}\n\`\`\``,
            tool_calls: response.tool_calls,
          };
        }
        return response;
      }

      // Special handling for Figma data transformation
      logger.info("Figma tool detected, applying transformation pipeline");

      // Send progress update: Starting transformation
      await agentFlowService.sendUpdate({
        type: "thinking",
        content: "🎨 Figma data received, starting transformation to Storyblok format...",
        metadata: {
          source: "figma-to-storyblok-agent",
          step: "transformation-start",
        },
      });

      try {
        // Parse the tool response
        let figmaData;
        if (typeof toolResponse === "string") {
          try {
            figmaData = JSON.parse(toolResponse);
          } catch (parseError) {
            logger.info("Tool response is not JSON, using as-is");
            figmaData = toolResponse;
          }
        } else {
          figmaData = toolResponse;
        }

        // Transform Figma data to IRF format
        if (figmaData && typeof figmaData === "object") {
          logger.info("Transforming Figma data to IRF format...");

          // Send progress update: Transformation in progress
          await agentFlowService.sendUpdate({
            type: "thinking",
            content: "⚙️ Analyzing Figma components and converting to IRF format...",
            metadata: {
              source: "figma-to-storyblok-agent",
              step: "transformation-processing",
            },
          });

          const transformerService = createTransformerService();
          logger.info("[FigmaToStoryblokAgent] transformerService Instantiated");

          const irfTransformationResult = await transformerService.transformFigmaToIRF(
            figmaData as SimplifiedFigmaResponse,
            {
              includeHiddenLayers: true,
            }
          );

          if (irfTransformationResult.success) {
            logger.info("Figma to IRF transformation successful!");

            // Send progress update: IRF transformation completed
            await agentFlowService.sendUpdate({
              type: "thinking",
              content: `✅ Figma to IRF transformation completed! Generated ${irfTransformationResult.metadata.componentCount} IRF components from ${irfTransformationResult.metadata.nodeCount} Figma nodes. Now converting to Storyblok format...`,
              metadata: {
                source: "figma-to-storyblok-agent",
                step: "irf-transformation-complete",
                success: true,
                componentCount: irfTransformationResult.metadata.componentCount,
                nodeCount: irfTransformationResult.metadata.nodeCount,
              },
            });

            logger.info("[FigmaToStoryblokAgent] irfTransformationResult", irfTransformationResult.metadata);

            // Enrich the IRF
            const enrichedIRF = await irfTraversingService.traverseAndEnrich(irfTransformationResult.layout, {
              enrichWithParent: true,
              validateNodes: false,
            });

            irfTransformationResult.layout = enrichedIRF.enrichedLayout;

            // Transform IRF to Storyblok
            try {
              const storyblokTransformationResult = await serviceRegistry
                .get("irfToStoryblok")
                .transformIRFToStoryblok(irfTransformationResult.layout, {
                  includeMetadata: true,
                  storyName: `Figma Import - ${new Date().getTime()}`,
                  fileKey: irfTransformationResult.metadata.fileKey,
                });

              if (storyblokTransformationResult.success) {
                logger.info("IRF to Storyblok transformation successful!");

                // Send progress update: Complete pipeline success
                await agentFlowService.sendUpdate({
                  type: "llm_response",
                  content: `🎉 Complete transformation pipeline successful!\n\n**Pipeline Summary:**\n- Figma → IRF: ${irfTransformationResult.metadata.componentCount} components from ${irfTransformationResult.metadata.nodeCount} nodes\n- IRF → Storyblok: ${storyblokTransformationResult.metadata.totalComponents} total Storyblok components\n- Story Name: "${storyblokTransformationResult.story.name}"\n- Story Slug: "${storyblokTransformationResult.story.slug}"\n\n✅ Transformation complete! Creating approval for Storyblok CMS publication...`,
                  metadata: {
                    source: "figma-to-storyblok-agent",
                    step: "complete-pipeline-success",
                    success: true,
                    irfComponentCount: irfTransformationResult.metadata.componentCount,
                    storyblokComponentCount: storyblokTransformationResult.metadata.totalComponents,
                    storyName: storyblokTransformationResult.story.name,
                    storySlug: storyblokTransformationResult.story.slug,
                  },
                });

                const finalStoryblokStory = constructFinalStoryblokStory(storyblokTransformationResult);

                // Emit event for downstream processing
                eventBus.emit("figma-to-storyblok.ready", {
                  figmaData: figmaData,
                  irfResult: irfTransformationResult,
                  storyblokResult: storyblokTransformationResult,
                  finalStoryblokStory: finalStoryblokStory,
                  metadata: {
                    figmaFileName: figmaData.metadata?.name || "Untitled",
                    componentCount: irfTransformationResult.metadata.componentCount,
                    nodeCount: irfTransformationResult.metadata.nodeCount,
                    storyName: storyblokTransformationResult.story.name,
                    storySlug: storyblokTransformationResult.story.slug,
                  },
                });

                // Return the complete transformation result
                return {
                  role: "assistant" as const,
                  content: JSON.stringify(
                    {
                      success: true,
                      pipeline: "figma-to-storyblok",
                      mcpFigma: figmaData,
                      figmaToIrf: irfTransformationResult,
                      irfToStoryblok: storyblokTransformationResult,
                      finalStoryblokStory: finalStoryblokStory,
                      status: "approval_created",
                      message: "Transformation complete! Approval created for Storyblok CMS publication.",
                    },
                    null,
                    2
                  ),
                  tool_calls: response.tool_calls,
                };
              } else {
                logger.info("IRF to Storyblok transformation failed:", storyblokTransformationResult.errors);

                return {
                  role: "assistant" as const,
                  content: `❌ IRF to Storyblok transformation failed:\n${
                    storyblokTransformationResult.errors?.join("\n") || "Unknown error"
                  }\n\n✅ Figma to IRF was successful though. IRF data:\n${JSON.stringify(
                    irfTransformationResult,
                    null,
                    2
                  )}`,
                  tool_calls: response.tool_calls,
                };
              }
            } catch (storyblokError) {
              logger.error("IRF to Storyblok transformation error:", storyblokError);

              return {
                role: "assistant" as const,
                content: `⚠️ Error during IRF to Storyblok transformation: ${storyblokError}\n\n✅ Figma to IRF was successful though. IRF data:\n${JSON.stringify(
                  irfTransformationResult,
                  null,
                  2
                )}`,
                tool_calls: response.tool_calls,
              };
            }
          } else {
            logger.info("Figma to IRF transformation failed:", irfTransformationResult.errors);

            return {
              role: "assistant" as const,
              content: `❌ Figma to IRF transformation failed:\n${
                irfTransformationResult.errors?.join("\n") || "Unknown error"
              }`,
              tool_calls: response.tool_calls,
            };
          }
        }
      } catch (transformError) {
        logger.error("Transformation error:", transformError);

        return {
          role: "assistant" as const,
          content: `⚠️ Error during transformation: ${transformError}`,
          tool_calls: response.tool_calls,
        };
      }

      // Fallback
      return response;
    },

    // Handle errors
    onError: async (error, attempt) => {
      logger.error(`Figma to Storyblok error on attempt ${attempt}:`, error);

      return {
        error: error.message || String(error),
        attempt,
      };
    },
  };
};
