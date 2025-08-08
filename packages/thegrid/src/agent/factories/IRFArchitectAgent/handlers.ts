import { LLMTraceContext } from "@/domains/ai/services/LLMService/llm.service";
import { irfTraversingService } from "@/domains/irf/services/IRFTraversingService/irf-traversing.service";
import {
  NodeSchemaInfo,
  zodIntrospectionService,
} from "@/domains/irf/services/ZodIntrospectionService/zod-introspection.service";
import { eventBus } from "@/eda/events/event-bus";
import { serviceRegistry } from "@/registry/service-registry";
import { logger } from "@/utils/logger";
import { zodToJsonSchema } from "zod-to-json-schema";
import { nodesRegistrySchema } from "../../../domains/irf/nodes-registry.schema";
import { intermediateLayoutSchema, intermediateNodeSchema } from "../../../domains/irf/schema";
import { IntermediateNodeType } from "../../../domains/irf/schema.types";
import { constructFinalStoryblokStory } from "../FigmaToStoryblokAgent/helpers";
import { mainPrompt } from "./prompts";
import { createComponentIdentificationPrompt } from "./prompts/component-identification.prompt";
import { generateAgentFeedback, validateIRF } from "./validation";

/**
 * Identifies relevant components for a given user message using LLM
 * This is the core component identification logic used in production
 */
export const identifyRelevantComponents = async (
  userMessage: string,
  traceContext?: LLMTraceContext
): Promise<string[]> => {
  const llmService = serviceRegistry.get("llm");
  const availableComponents = zodIntrospectionService.getAvailableNodeTypes() as IntermediateNodeType[];

  let relevantComponentTypes: string[] = [];

  try {
    const componentIdentificationPrompt = createComponentIdentificationPrompt(userMessage);

    const response = await llmService.runCleanLLMWithJSONResponse({
      model: "gpt-5-nano",
      messages: [
        {
          role: "user",
          content: componentIdentificationPrompt,
        },
      ],
      traceContext: {
        ...traceContext,
        tags: [...(traceContext?.tags || []), "component-identification"],
      },
      tools: [],
    });

    try {
      const parsedResponse = JSON.parse(response?.content || "{}");

      // Extract components array from the expected object format
      if (parsedResponse && typeof parsedResponse === "object" && Array.isArray(parsedResponse.components)) {
        relevantComponentTypes = parsedResponse.components;
      } else {
        console.log("⚠️ LLM response object doesn't have components array, using empty array");
        relevantComponentTypes = [];
      }
    } catch (parseError) {
      console.log("❌ Failed to parse LLM response as JSON:", parseError);
      relevantComponentTypes = [];
    }

    // Filter to only valid component types
    const validComponents = relevantComponentTypes.filter((type: string) => {
      const isValid = typeof type === "string" && availableComponents.includes(type as IntermediateNodeType);
      if (!isValid) {
        console.log(`⚠️ Filtering out invalid component type: ${type}`);
      }
      return isValid;
    });

    return validComponents;
  } catch (error) {
    console.log("❌ LLM component identification failed:", error);
    return [];
  }
};

/**
 * Create filtered core layout schemas that only include identified component types in enums
 */
const createFilteredCoreLayoutSchemas = (identifiedComponents: string[], fallbackToAll: boolean = false): string => {
  // Essential components that should always be included
  const essentialComponents = ["page", "section"];

  // If fallback is requested or no components identified, use all available components
  if (fallbackToAll || identifiedComponents.length === 0) {
    const fullNodeJsonSchema = zodToJsonSchema(intermediateNodeSchema);
    const fullLayoutJsonSchema = zodToJsonSchema(intermediateLayoutSchema);

    return `
// --- CORE LAYOUT SCHEMAS ---
// Intermediate Node Schema (recursive):
${JSON.stringify(fullNodeJsonSchema, null, 2)} 

// Intermediate Layout Schema:
${JSON.stringify(fullLayoutJsonSchema, null, 2)}
`;
  }

  // Combine identified components with essential ones
  const allRequiredComponents = [...new Set([...essentialComponents, ...identifiedComponents])];

  // Generate filtered JSON schemas
  const fullNodeJsonSchema = zodToJsonSchema(intermediateNodeSchema) as any;
  const fullLayoutJsonSchema = zodToJsonSchema(intermediateLayoutSchema) as any;

  // Filter the type enum in the node schema
  if (fullNodeJsonSchema.properties?.type?.enum) {
    fullNodeJsonSchema.properties.type.enum = allRequiredComponents;
  }

  // Filter the type enum in the layout schema's content items
  if (fullLayoutJsonSchema.properties?.content?.items?.properties?.type?.enum) {
    fullLayoutJsonSchema.properties.content.items.properties.type.enum = allRequiredComponents;
  }

  // Also filter any other type references in the schemas
  const filterTypeEnums = (obj: any) => {
    if (typeof obj === "object" && obj !== null) {
      if (obj.enum && Array.isArray(obj.enum)) {
        // Get available components from the service to check if this enum contains component types
        const availableComponents = zodIntrospectionService.getAvailableNodeTypes() as IntermediateNodeType[];

        // Check if this enum contains component types by seeing if it has overlap with available components
        const hasComponentTypes = obj.enum.some(
          (item: any) => typeof item === "string" && availableComponents.includes(item as IntermediateNodeType)
        );

        if (hasComponentTypes) {
          // This is a component type enum, filter it to only include required components
          obj.enum = obj.enum.filter((type: string) => allRequiredComponents.includes(type));
        }
      }
      if (obj.$ref && obj.$ref.includes("properties/type")) {
        // This is a reference to a type field, we need to update it
        // But since we're modifying the original, it should be automatically filtered
      }
      // Recursively process nested objects
      Object.values(obj).forEach(filterTypeEnums);
    }
  };

  filterTypeEnums(fullNodeJsonSchema);
  filterTypeEnums(fullLayoutJsonSchema);

  logger.info(`Created filtered core layout schemas with ${allRequiredComponents.length} component types`);

  return `
// --- CORE LAYOUT SCHEMAS (FILTERED) ---
// Intermediate Node Schema (recursive):
${JSON.stringify(fullNodeJsonSchema, null, 2)} 

// Intermediate Layout Schema:
${JSON.stringify(fullLayoutJsonSchema, null, 2)}
`;
};

/**
 * Create a filtered nodes registry schema containing only identified components plus essential ones
 */
const createFilteredNodesRegistry = (identifiedComponents: string[], fallbackToAll: boolean = false): string => {
  // Essential components that should always be included
  const essentialComponents = ["page", "section"];

  // If fallback is requested or no components identified, use all available components
  if (fallbackToAll || identifiedComponents.length === 0) {
    logger.info("Using full nodes registry (fallback mode)");
    return `
This defines the available component types and their properties.
${JSON.stringify(zodToJsonSchema(nodesRegistrySchema), null, 2)}
`;
  }

  // Combine identified components with essential ones
  const allRequiredComponents = [...new Set([...essentialComponents, ...identifiedComponents])];

  // Build filtered registry schema
  const filteredRegistryShape: any = {};

  allRequiredComponents.forEach((componentType) => {
    const schema = nodesRegistrySchema.shape[componentType as keyof typeof nodesRegistrySchema.shape];
    if (schema) {
      filteredRegistryShape[componentType] = schema;
    } else {
      logger.warn(`Component type "${componentType}" not found in registry, skipping`);
    }
  });

  // Convert to JSON schema format by creating a temporary Zod object
  const tempSchema = nodesRegistrySchema.pick(
    Object.fromEntries(allRequiredComponents.map((comp) => [comp, true])) as any
  );
  const filteredJsonSchema = zodToJsonSchema(tempSchema);

  logger.info(`Created filtered nodes registry with ${allRequiredComponents.length} components:`, {
    components: allRequiredComponents,
    essential: essentialComponents,
    identified: identifiedComponents,
  });

  return `
This defines the available component types and their properties (filtered to relevant components).
${JSON.stringify(filteredJsonSchema, null, 2)}
`;
};

/**
 * Handle IRF response validation
 */
export const handleValidateResponse = async (response: any) => {
  try {
    const irfResult = response.content ? JSON.parse(response.content) : {};
    const validationResult = validateIRF(irfResult);

    if (!validationResult.isValid) {
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

    logger.info(`✅ IRF validation passed`);
    return { isValid: true };
  } catch (error) {
    logger.error("Failed to parse or validate IRF response:", error);
    return {
      isValid: false,
      errors: [`Failed to parse JSON response: ${error}`],
    };
  }
};

/**
 * Handle IRF transformation through enrichment and Storyblok conversion
 */
export const handleTransformOutput = async (response: any) => {
  try {
    const irfResult = JSON.parse(response.content);

    // Double-check validation before transformation
    const validationResult = validateIRF(irfResult);
    if (!validationResult.isValid) {
      logger.warn("IRF validation failed in transformOutput, skipping transformation");
      logger.error("Validation errors in transformOutput:", {
        errors: validationResult.errors,
        warnings: validationResult.warnings,
      });
      return response; // Return original response without transformation
    }

    // Enrich IRF with traversing service
    const enrichedIRF = await irfTraversingService.traverseAndEnrich(irfResult, {
      enrichWithParent: true,
      validateNodes: false,
    });

    // Transform IRF to Storyblok
    const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");
    const storyblokTransformationResult = await irfToStoryblokService.transformIRFToStoryblok(
      enrichedIRF.enrichedLayout,
      {
        includeMetadata: true,
        storyName: `IRF Architect - ${new Date().getTime()}`,
      }
    );

    // Construct final Storyblok story
    const finalStoryblokStory = constructFinalStoryblokStory(storyblokTransformationResult, {
      storySlug: `irf-architect-${new Date().getTime()}`,
      storyName: `IRF Architect - ${new Date().getTime()}`,
    });

    // Emit event for downstream processing
    // @ts-ignore
    eventBus.emit("figma-to-storyblok.ready", {
      irfResult: enrichedIRF.enrichedLayout,
      finalStoryblokStory: finalStoryblokStory,
      metadata: {
        figmaFileName: "Untitled",
        componentCount: 1,
        nodeCount: 1,
        storyName: storyblokTransformationResult.story.name,
        storySlug: storyblokTransformationResult.story.slug,
      },
    });

    // Return enriched response
    return {
      role: "assistant",
      content: JSON.stringify({
        irf: enrichedIRF.enrichedLayout,
        storyblok: finalStoryblokStory,
      }),
    };
  } catch (error) {
    logger.error("Failed to transform IRF output:", error);
    // Return original response if transformation fails
    return response;
  }
};

/**
 * Handle errors during IRF generation
 */
export const handleOnError = async (error: any, attempt: number) => {
  logger.error(`IRF generation error on attempt ${attempt}:`, error);

  // Let the framework handle retries based on maxRetries config
  // Return the error to be included in the next attempt's context
  return {
    error: error.message || String(error),
    attempt,
  };
};

/**
 * Handle component identification and system prompt setup before agent action
 */
export const handleBeforeAct = async (input: any, config: any, traceContext: LLMTraceContext | undefined) => {
  // Extract the actual user message from the input object
  const userMessage = input?.messages?.[0]?.content || "";

  // Get available components from registry
  const availableComponents = zodIntrospectionService.getAvailableNodeTypes() as IntermediateNodeType[];
  console.log("🔍 AVAILABLE COMPONENTS IN REGISTRY:");
  console.log(availableComponents);

  // Use the utility function for component identification
  let relevantComponentTypes: string[] = [];

  try {
    relevantComponentTypes = await identifyRelevantComponents(userMessage, traceContext);

    // Build full component info for the identified components
    const identifiedComponents = relevantComponentTypes.map((type: string) => {
      // Get the full registry entry for this component type
      const registryEntry = zodIntrospectionService.getNodeSchemaInfo(type as IntermediateNodeType) as NodeSchemaInfo;
      return {
        name: registryEntry.name,
        description: registryEntry.description,
      };
    });

    console.log("🎯 IDENTIFIED COMPONENTS FROM LLM:");
    console.log(JSON.stringify(identifiedComponents, null, 2));

    // Log the components for debugging
    if (identifiedComponents.length > 0) {
      logger.info(`LLM identified ${identifiedComponents.length} relevant components:`, {
        components: identifiedComponents.map((component: any) => ({
          name: component.name,
          description: component.description,
        })),
      });
    } else {
      logger.info("LLM found no specific components, will use general layout components");
    }
  } catch (error) {
    logger.error("Failed to identify components with LLM:", error);
    console.log("❌ LLM component identification failed:", error);
  }

  const designIntentSchema = `
// --- GENERIC DESIGN INTENT SCHEMA ---
// This is the schema for the 'design' property on a node.
// Use it to describe the visual styling of a component.
my crazy schema man
`;

  // Create filtered nodes registry based on identified components
  const filteredNodesRegistry = createFilteredNodesRegistry(
    relevantComponentTypes,
    true
    // relevantComponentTypes.length === 0 // fallback to all if no components identified
  );

  // Create filtered core layout schemas based on identified components
  const filteredCoreLayoutSchemas = createFilteredCoreLayoutSchemas(
    relevantComponentTypes,
    relevantComponentTypes.length === 0 // fallback to all if no components identified
  );

  config.prompts.system = mainPrompt({
    designIntentSchema: designIntentSchema,
    nodesRegistry: filteredNodesRegistry,
    coreLayoutSchemas: filteredCoreLayoutSchemas,
  });

  return input;
};
