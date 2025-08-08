import { serviceRegistry } from "@/registry/service-registry";
import { generateStoryblokSlugFromName } from "@/storyblok-utils";
import { logger } from "@/utils/logger";
import { IntermediateLayout, IntermediateNode } from "../../schema.types";
import { componentRegistry } from "./component-registry";
import {
  ComponentRegistryEntry,
  ComponentTransformer,
  IRFToStoryblokOptions,
  IRFToStoryblokResult,
  StoryblokComponent,
  StoryblokStory,
} from "./irf-to-storyblok.service.types";

/**
 * IRF to Storyblok Transformer Service
 *
 * This service handles the transformation of IRF (Intermediate Response Format)
 * structures into Storyblok CMS JSON format.
 */

const createIRFToStoryblokService = () => {
  // Private state
  const _transformationCache = new Map<string, IRFToStoryblokResult>();

  const assetService = serviceRegistry.get("asset");
  const irfTraversingService = serviceRegistry.get("irfTraversing");

  // Generate a Storyblok-compatible UID
  const generateStoryblokUid = (): string => {
    // Storyblok UIDs are typically UUID v4 format
    return crypto.randomUUID();
  };

  // Helper function to process slots
  const processNodeSlots = async (
    node: IntermediateNode,
    options: IRFToStoryblokOptions
  ): Promise<Record<string, StoryblokComponent[]>> => {
    const processedSlots: Record<string, StoryblokComponent[]> = {};

    if (!node.slots) {
      return processedSlots;
    }

    for (const [slotName, slotNodes] of Object.entries(node.slots)) {
      processedSlots[slotName] = await Promise.all(
        slotNodes.map((child: IntermediateNode) => {
          // Ensure slot children have proper parent context
          const childWithContext = {
            ...child,
            parentNodeName: node.name,
            parentNodeTypeName: node.type,
          };
          return transformNodeToStoryblok(childWithContext, options);
        })
      );
    }

    return processedSlots;
  };

  // Component Registry - handles specific Storyblok component structures
  const _componentRegistry: Record<string, ComponentRegistryEntry> =
    componentRegistry;

  // Transform IRF node to Storyblok component using registry
  const transformNodeToStoryblok = async (
    node: IntermediateNode,
    options: IRFToStoryblokOptions = {}
  ): Promise<StoryblokComponent> => {
    // Check if AI insights suggest a different type
    const suggestedType = node.aiInsights?.suggestedType;
    const effectiveType =
      suggestedType &&
      suggestedType !== node.type &&
      typeof suggestedType === "string" &&
      suggestedType.trim().length > 0
        ? suggestedType
        : node.type;

    // Log the AI suggestion if it's different
    if (effectiveType !== node.type) {
      _log(
        `AI suggested using '${effectiveType}' instead of '${node.type}' for node: ${node.name} (confidence: ${node.aiInsights?.confidence || "unknown"})`
      );
    }

    // Get component registry entry using the effective type
    const registryEntry = _componentRegistry[effectiveType];

    if (!registryEntry) {
      // Fallback for unknown components
      const component: StoryblokComponent = {
        component: `sb-${effectiveType.replace(/-/g, "_")}`,
        _uid: generateStoryblokUid(),
        ...node.props,
      };

      // Add metadata if requested
      if (options.includeMetadata) {
        if (node.name) component._figma_name = node.name;
        if (node.meta) {
          component._meta = {
            source: node.meta.source,
            figmaId: node.meta.figmaId,
            componentKey: node.componentKey,
          };
        }
      }

      return component;
    }

    // Use registry transformer
    const component = await registryEntry.transform(node, options);

    // Add UID if not present
    if (!component._uid) {
      component._uid = generateStoryblokUid();
    }

    // Add metadata if requested
    if (options.includeMetadata) {
      if (node.name) component._figma_name = node.name;
      if (node.meta) {
        component._meta = {
          source: node.meta.source,
          figmaId: node.meta.figmaId,
          componentKey: node.componentKey,
        };
      }
    }

    return component;
  };

  // Register a new component transformer
  const registerComponent = (
    irfType: string,
    defaultStoryblokComponent: string,
    transformer: ComponentTransformer
  ): void => {
    _componentRegistry[irfType] = {
      defaultStoryblokComponent,
      transform: transformer,
    };
    _log(`Registered component: ${irfType} -> ${defaultStoryblokComponent}`);
  };

  // Main transformation function
  const transformIRFToStoryblok = async (
    irfLayout: IntermediateLayout,
    options: IRFToStoryblokOptions = {}
  ): Promise<IRFToStoryblokResult> => {
    try {
      const startTime = Date.now();
      const errors: string[] = [];
      const warnings: string[] = [];

      logger.info("[IRFToStoryblokService] options", options);

      if (options.fileKey) {
        await assetService.prefetchImageFills(options.fileKey);
      }

      // Enrich the layout with parent information before transformation
      const traversingResult = await irfTraversingService.traverseAndEnrich(
        irfLayout,
        { enrichWithParent: true }
      );

      if (!traversingResult.success) {
        errors.push(...(traversingResult.errors || []));
        warnings.push(...(traversingResult.warnings || []));
      }

      const enrichedLayout = traversingResult.enrichedLayout;

      // Merge globalVars from IRF layout into options for component transformers
      const enhancedOptions: IRFToStoryblokOptions = {
        ...options,
        globalVars: options.globalVars || enrichedLayout.globalVars,
      };

      // Transform all content nodes
      const transformedComponents: StoryblokComponent[] = [];
      let totalComponents = 0;
      let rootPageComponent: StoryblokComponent | null = null;

      for (const node of enrichedLayout.content) {
        try {
          const transformedComponent = await transformNodeToStoryblok(
            node,
            enhancedOptions
          );

          // If this is a page component, it should be the root content
          if (transformedComponent.component === "page") {
            rootPageComponent = transformedComponent;
          } else {
            transformedComponents.push(transformedComponent);
          }

          totalComponents += countComponentsRecursively(transformedComponent);
        } catch (error) {
          errors.push(
            `Failed to transform node ${node.name || node.type}: ${error}`
          );
        }
      }

      // Create Storyblok story structure
      const storyName = options.storyName || irfLayout.name || "Figma Import";
      const storySlug =
        options.storySlug || generateStoryblokSlugFromName(storyName);

      // If we have a root page component, use it as the content
      // Otherwise, create a default page wrapper
      let storyContent: {
        component: string;
        _uid?: string;
        body: StoryblokComponent[];
      };

      if (rootPageComponent) {
        // Ensure the root page component has a body property
        storyContent = {
          ...rootPageComponent, // Include all page-specific properties first
          component: rootPageComponent.component, // Ensure component is set correctly
          _uid: rootPageComponent._uid || generateStoryblokUid(), // Ensure UID is present
          body: rootPageComponent.body || transformedComponents, // Ensure body is present
        };
      } else {
        storyContent = {
          component: "page",
          _uid: generateStoryblokUid(),
          body: transformedComponents,
        };
      }

      const story: StoryblokStory = {
        name: storyName,
        slug: storySlug,
        content: storyContent,
        is_folder: false,
        parent_id: options.parentId,
        group_id: options.groupId,
        disable_fe_editor: false,
      };

      const result: IRFToStoryblokResult = {
        success: errors.length === 0,
        story,
        metadata: {
          sourceLayout: enrichedLayout.name,
          transformedAt: new Date().toISOString(),
          componentCount: transformedComponents.length,
          totalComponents,
        },
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      // Cache the result (use original layout for cache key to ensure consistency)
      const cacheKey = generateCacheKey(irfLayout, options);
      _transformationCache.set(cacheKey, result);

      _log(
        `IRF to Storyblok transformation completed in ${
          Date.now() - startTime
        }ms`
      );
      return result;
    } catch (error) {
      _log(`IRF to Storyblok transformation failed: ${error}`);
      throw new Error(`IRF to Storyblok transformation failed: ${error}`);
    }
  };

  const countComponentsRecursively = (
    component: StoryblokComponent
  ): number => {
    let count = 1;

    // Check different possible children properties
    const childrenArrays = [
      component.body,
      component.items,
      component.content,
    ].filter(Boolean);

    for (const children of childrenArrays) {
      if (Array.isArray(children)) {
        count += children.reduce(
          (sum, child) => sum + countComponentsRecursively(child),
          0
        );
      }
    }

    return count;
  };

  const generateCacheKey = (
    layout: IntermediateLayout,
    options: IRFToStoryblokOptions
  ): string => {
    const layoutHash = JSON.stringify(layout).slice(0, 100);
    const optionsHash = JSON.stringify(options);
    return `${layoutHash}-${optionsHash}`;
  };

  const _log = (message: string, data?: any) => {
    logger.user(`[IRF_TO_STORYBLOK_TRANSFORMER] ${message}`, data);
  };

  // TODO: this should be rewritten to use zod schema validation, stay tuned
  const validateStoryblokStory = (story: StoryblokStory): boolean => {
    try {
      // Basic validation
      if (!story.name || !story.slug || !story.content) {
        return false;
      }

      if (!story.content.component || !story.content._uid) {
        return false;
      }

      return true;
    } catch (error) {
      _log(`Storyblok story validation failed: ${error}`);
      return false;
    }
  };

  // Cache management
  const clearCache = (): void => {
    _transformationCache.clear();
    _log("IRF to Storyblok transformation cache cleared");
  };

  const getCacheStats = () => {
    return {
      size: _transformationCache.size,
      keys: Array.from(_transformationCache.keys()),
    };
  };

  /**
   *
   * Additional components mapping purposes, to add new components to the component registry
   * If we do not provide all the components, user of the sitebuilder, and ai agent
   * will be able to provide their own mapping to it.
   *
   */
  const addComponentMapping = (
    irfType: string,
    storyblokComponent: string,
    transformer?: ComponentTransformer
  ): void => {
    if (transformer) {
      registerComponent(irfType, storyblokComponent, transformer);
    } else {
      // Create a simple transformer if none provided
      registerComponent(irfType, storyblokComponent, (node, _options) => ({
        component: storyblokComponent,
        ...node.props,
      }));
    }
  };

  const getComponentMappings = (): Record<string, string> => {
    const mappings: Record<string, string> = {};
    Object.entries(_componentRegistry).forEach(([irfType, entry]) => {
      mappings[irfType] = entry.defaultStoryblokComponent;
    });
    return mappings;
  };

  // Initialize the service
  _log(
    "IRF to Storyblok Transformer service initialized with component registry"
  );

  // Public API
  return {
    // Core transformation functions
    transformIRFToStoryblok,
    transformNodeToStoryblok,
    validateStoryblokStory,

    // Component registry management
    registerComponent,
    addComponentMapping,
    getComponentMappings,
    getComponentRegistry: () => ({ ..._componentRegistry }),

    // Design token utilities
    // resolveDesignToken,
    // resolveDesignTokens,

    // Cache management
    clearCache,
    getCacheStats,
    processNodeSlots,

    // Health check
    isHealthy: async (): Promise<boolean> => {
      try {
        // Test basic functionality with a simple IRF layout
        const testLayout: IntermediateLayout = {
          version: "1.0",
          name: "Test Layout",
          content: [
            {
              type: "section",
              name: "Test Section",
              children: [
                {
                  type: "headline",
                  name: "Test Headline",
                  props: { text: "Test Title" },
                },
              ],
            },
          ],
        };

        const result = await transformIRFToStoryblok(testLayout);
        return result.success && result.story.content.body.length > 0;
      } catch (error) {
        _log(`Health check failed: ${error}`);
        return false;
      }
    },
  };
};

// Export the service factory - instance will be created lazily by the service registry
export { createIRFToStoryblokService };
