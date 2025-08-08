import { serviceRegistry } from "@/registry/service-registry";
import { logger } from "@/utils/logger";
import {
  INTERMEDIATE_NODE_TYPES,
  intermediateLayoutSchema,
} from "../../../../domains/irf/schema";
import {
  AIInsights,
  IntermediateLayout,
  IntermediateNode,
  IntermediateNodeType,
} from "../../../../domains/irf/schema.types";
import { DesignIntent } from "../../../../domains/irf/services/DesignIntentMapperService/design-intent";
import { generateAIInsightsPrompt } from "./prompts";
import {
  RecognizerContext,
  SimplifiedFigmaNode,
  SimplifiedFigmaResponse,
  TransformationOptions,
  TransformationResult,
} from "./transformer.service.types";

// Format style information for AI
export const formatStyleInfo = (styles: Record<string, any>): string => {
  if (!styles || Object.keys(styles).length === 0)
    return "No specific styles applied";

  const styleEntries = Object.entries(styles).map(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      return `  - ${key}: ${JSON.stringify(value, null, 4)}`;
    }
    return `  - ${key}: ${value}`;
  });

  return styleEntries.join("\n");
};

/**
 * Figma to IRF Transformer Service
 *
 * This service handles the transformation of simplified Figma design data
 * into IRF (Intermediate Response Format) structures.
 */

export const createTransformerService = () => {
  // Private state
  const transformationCache = new Map<string, TransformationResult>();
  const componentMappings = new Map<string, string>();

  // Initialize default component mappings
  const initializeDefaultMappings = () => {
    // Map Figma component IDs to IRF types based on your example
    componentMappings.set("1:641", "editorial-card"); // editorial-card component
    componentMappings.set("1:726", "list"); // List component
    componentMappings.set("1:714", "list-item"); // List item component
    componentMappings.set("1:612", "placeholder"); // placeholder component

    // Default type mappings
    componentMappings.set("FRAME", "section");
    componentMappings.set("TEXT", "text");
    componentMappings.set("RECTANGLE", "shape");
    componentMappings.set("GROUP", "group");
    componentMappings.set("INSTANCE", "other-component");
  };

  // Build recognizer context from Figma response
  const buildRecognizerContext = (
    figmaResponse: SimplifiedFigmaResponse
  ): RecognizerContext => {
    const componentIdMap: Record<string, string> = {};

    // Add custom mappings from service state
    componentMappings.forEach((type, id) => {
      componentIdMap[id] = type;
    });

    return {
      componentIdMap,
      knownTypes: [...INTERMEDIATE_NODE_TYPES],
      globalVars: figmaResponse.globalVars,
    };
  };

  //
  // COMPONENT RECOGNIZERS
  //

  const recognizeEditorialCard = async (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext
  ): Promise<IntermediateNode | null> => {
    const props: Record<string, any> = {};
    const componentProps = node.componentProperties || {};

    for (const [key, val] of Object.entries(componentProps)) {
      if (key.includes("Title")) props.title = val.value;
      if (key.includes("Paragraph")) props.paragraph = val.value;
      if (key.includes("Show link")) props.showLink = val.value;
      if (key === "Aspect ratio") props.aspectRatio = val.value;
      if (key.includes("Eyebrow")) props.eyebrow = val.value;
      if (key.includes("Show paragraph")) props.showParagraph = val.value;
      if (key.includes("Show eyebrow")) props.showEyebrow = val.value;
    }

    const children = node.children
      ? await Promise.all(
          node.children.map((child) =>
            recognizeNode(
              child,
              ctx,
              { includeHiddenLayers: true },
              "editorial-card"
            )
          )
        ).then((results) => results.filter(Boolean) as IntermediateNode[])
      : [];

    const onlyImageChildren =
      children.filter(
        (child) => child?.aiInsights?.suggestedType === "image"
      ) || [];

    // TODO: fix this
    // @ts-ignore
    return {
      type: "editorial-card",
      name: node.name,
      props,
      design: extractDesignFromNode(node, ctx),
      children: [
        ...onlyImageChildren,
        props.title
          ? {
              type: "headline",
              name: "title",
              props: {
                text: props.title,
              },
            }
          : (null as any),
        props.paragraph && props.showParagraph
          ? {
              type: "text",
              name: "paragraph",
              props: {
                text: props.paragraph,
              },
            }
          : (null as any),
      ], // Explicitly no children
      meta: { source: "component-recognizer", figmaId: node.id },
    };
  };

  const recognizeList = async (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext,
    options: TransformationOptions,
    parentType: string
  ): Promise<IntermediateNode | null> => {
    if (node.type !== "INSTANCE") return null;

    const children = node.children
      ? await Promise.all(
          node.children.map((child) =>
            recognizeNode(child, ctx, options, parentType)
          )
        ).then((results) => results.filter(Boolean) as IntermediateNode[])
      : [];

    return {
      type: "list",
      name: node.name,
      children,
      meta: { source: "component-recognizer", figmaId: node.id },
    };
  };

  const findTextInNode = (
    node: SimplifiedFigmaNode,
    name: string
  ): string | undefined => {
    if (node.name === name && node.type === "TEXT" && node.text) {
      return node.text;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findTextInNode(child, name);
        if (found) return found;
      }
    }
    return undefined;
  };

  const recognizeListItem = (
    node: SimplifiedFigmaNode
  ): IntermediateNode | null => {
    if (node.type !== "INSTANCE") return null;

    const title = findTextInNode(node, "Item");
    const paragraph = findTextInNode(node, "Paragraph");

    return {
      type: "list-item",
      name: node.name,
      props: {
        title,
        paragraph,
        // icon: ... we can extract icon info later
      },
      meta: { source: "component-recognizer", figmaId: node.id },
      // No children, we are flattening the structure
    };
  };

  const componentRecognizers: Record<
    string,
    (
      node: SimplifiedFigmaNode,
      ctx: RecognizerContext,
      options: TransformationOptions,
      parentType: string
    ) => Promise<IntermediateNode | null> | IntermediateNode | null
  > = {
    list: recognizeList,
    "list-item": recognizeListItem,
    "editorial-card": recognizeEditorialCard,
  };

  //
  // MAIN RECOGNIZER DISPATCHER
  //

  // 🎯 NEW: Stub AI Insights Function
  const generateAIInsights = async (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext,
    currentType?: string
  ): Promise<AIInsights> => {
    // 🎯 SPECIAL CASE: If this is a PAGE type, return immediately with 100% confidence
    // Pages are always pages - no need to waste time on AI analysis
    if (currentType === "page" || node.type === "PAGE") {
      logger.info(
        `[AI_INSIGHTS] PAGE early return triggered for node: ${node.name} (type: ${node.type}, currentType: ${currentType})`
      );
      return {
        confidence: 1.0,
        suggestedType: "page",
        reasoning:
          "Node is a Figma PAGE type - always recognized as page with 100% confidence",
        complexity: "simple",
      };
    }

    // Get available components from context
    const availableComponents = ctx.knownTypes;

    // Extract and resolve design/style information
    const extractedDesign = mapFigmaToDesignIntent(node, ctx) || {};

    // For the prompt, we need a simple key-value record.
    const designForPrompt: Record<string, any> = {
      fontSize: extractedDesign.typography?.fontSize,
      fontWeight: extractedDesign.typography?.fontWeight,
      fills: extractedDesign.appearance?.backgroundColor
        ? [extractedDesign.appearance.backgroundColor]
        : [],
    };

    const prompt = generateAIInsightsPrompt(
      node,
      availableComponents,
      designForPrompt,
      {}, // resolvedStyles is less important now
      ctx,
      currentType
    );

    // commented out for now - dont need this console.log now
    // if (currentType === "text") {
    //   logger.info("### Full prompt: ");
    //   logger.info(prompt);
    // }

    try {
      const llmService = serviceRegistry.get("llm");
      const response = await llmService.runCleanLLMWithJSONResponse({
        model: "gpt-4.1-nano", // Using the cheapest and fastest model - lets see if smart enough
        // model: "gpt-4o-mini", // was good enough
        messages: [
          {
            role: "system",
            content:
              "You are a professional UI/UX designer and developer expert at recognizing design components from Figma. You always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [],
      });

      // Parse the AI response and convert to our AIInsights format
      // TODO: fix this
      // @ts-ignore
      const aiResult = JSON.parse(response.content || "{}");

      const aiInsights: AIInsights = {
        confidence: parseFloat(aiResult.confidence) || 0.5,
        suggestedType: aiResult.componentName || currentType || "section",
        reasoning: aiResult.reasoning || "AI analysis completed",
        complexity:
          node.children && node.children.length > 3
            ? "complex"
            : node.children && node.children.length > 0
              ? "moderate"
              : "simple",
      };

      return aiInsights;
    } catch (error) {
      logger.warn(
        `[AI_INSIGHTS] Failed to get AI analysis for node ${node.id}:`,
        error
      );

      // Fallback to mock insights if AI fails
      const mockInsights: AIInsights = {
        confidence: Math.random() * 0.4 + 0.6,
        suggestedType: currentType || guessTypeFromName(node.name) || "section",
        reasoning: `AI analysis failed, using fallback logic for node "${node.name}" of type "${node.type}".`,
        complexity:
          node.children && node.children.length > 3
            ? "complex"
            : node.children && node.children.length > 0
              ? "moderate"
              : "simple",
      };

      return mockInsights;
    }
  };

  const recognizeNode = async (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext,
    options: TransformationOptions = {},
    parentType: string = "page" // Assume root nodes are children of a page
  ): Promise<IntermediateNode | null> => {
    logger.info("[recognizeNode] node", { node });
    logger.info("[recognizeNode] context", { ctx });
    logger.info("[recognizeNode] options", { options });
    logger.info(
      "---------------------------------------------------------------"
    );

    let recognizedNode: IntermediateNode | null = null;
    let recognizedType: string | undefined;

    // 1. Recognize by known componentId
    if (node.componentId && ctx.componentIdMap[node.componentId]) {
      recognizedType = ctx.componentIdMap[node.componentId];
      recognizedNode = await runComponentRecognizer(
        recognizedType,
        node,
        ctx,
        { ...options, enableAIInsights: false },
        parentType
      );
      if (recognizedNode) {
        // 🎯 NEW: Generate AI insights for component-recognized nodes
        if (options.enableAIInsights !== false) {
          recognizedNode.aiInsights = await generateAIInsights(
            node,
            ctx,
            recognizedType
          );
        }
        return recognizedNode;
      }
    }

    // 2. Guess type from name
    const guessedType = guessTypeFromName(node.name);
    if (guessedType) {
      recognizedNode = {
        type: guessedType,
        name: node.name,
        props: extractPropsFromNode(node),
        design: extractDesignFromNode(node, ctx),
        children: node.children
          ? await Promise.all(
              node.children.map((child) =>
                recognizeNode(child, ctx, options, guessedType)
              )
            ).then((results) => results.filter(Boolean) as IntermediateNode[])
          : undefined,
        meta: { source: "name-guess", figmaId: node.id },
      };

      // 🎯 NEW: Generate AI insights for name-guessed nodes
      if (options.enableAIInsights !== false) {
        recognizedNode.aiInsights = await generateAIInsights(
          node,
          ctx,
          guessedType
        );
      }
      return recognizedNode;
    }

    // // 3. Structure-based recognizer (editorial card as example)
    // if (isProbablyEditorialCard(node)) {
    //   recognizedType = "editorial-card";
    //   // TODO: fix this
    //   // @ts-ignore
    //   recognizedNode = {
    //     type: "editorial-card",
    //     name: node.name,
    //     props: extractPropsFromNode(node),
    //     design: extractDesignFromNode(node, ctx),
    //     children: node.children
    //       ? await Promise.all(
    //           node.children.map((child) =>
    //             recognizeNode(child, ctx, options, "editorial-card")
    //           )
    //         ).then((results) => results.filter(Boolean) as IntermediateNode[])
    //       : undefined,
    //     meta: { source: "structure-guess", figmaId: node.id },
    //   };

    //   // 🎯 NEW: Generate AI insights for structure-recognized nodes
    //   if (options.enableAIInsights !== false) {
    //     // TODO: fix this
    //     // @ts-ignore
    //     recognizedNode.aiInsights = await generateAIInsights(
    //       node,
    //       ctx,
    //       recognizedType
    //     );
    //   }
    //   return recognizedNode;
    // }

    // 4. Figma native type fallback
    const atomic = await recognizeNativeFigmaType(
      node,
      ctx,
      options,
      parentType
    );
    if (atomic) {
      // 🎯 NEW: Generate AI insights for native type nodes
      if (options.enableAIInsights !== false) {
        atomic.aiInsights = await generateAIInsights(node, ctx, atomic.type);
      }
      return atomic;
    }

    // 5. AI fallback - now this should never be reached since we always have insights
    // But if we get here, still generate insights for the unknown node
    if (options.enableAIInsights !== false) {
      const fallbackInsights = await generateAIInsights(node, ctx);
      logger.info(
        `[AI_INSIGHTS] Could not recognize node ${node.id} (${node.name}), but generated insights:`,
        fallbackInsights
      );
    }

    return null;
  };

  //
  // COMPONENT ID RECOGNIZER
  //

  const runComponentRecognizer = async (
    type: string | undefined,
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext,
    options: TransformationOptions,
    parentType: string
  ): Promise<IntermediateNode | null> => {
    if (!type) return null;
    const recognizer = componentRecognizers[type];
    if (recognizer) {
      // @ts-ignore
      return await recognizer(node, ctx, options, parentType);
    }
    return null;
  };

  //
  // NAME-BASED GUESSING
  //

  const guessTypeFromName = (
    name: string = ""
  ): IntermediateNodeType | undefined => {
    const lowerCaseName = name.toLowerCase();

    // Page has the highest priority for name guessing, as it's a strong convention
    // for top-level frames that don't have a native "page" type in Figma.
    if (lowerCaseName.includes("page")) return "page";

    // We avoid other naive name-based guessing because layer names can be inconsistent.
    // It's more reliable to use component recognizers for INSTANCEs or fall back
    // to the native Figma type (FRAME, TEXT, etc.) in recognizeNativeFigmaType.

    // Fallback if no keywords match
    return undefined;
  };

  //
  // STRUCTURE-BASED FALLBACK
  //

  // const isProbablyEditorialCard = (node: SimplifiedFigmaNode): boolean => {
  //   return (
  //     node.type === "FRAME" &&
  //     Boolean(
  //       node.children?.some(
  //         (c: any) =>
  //           c.type === "TEXT" && c.name?.toLowerCase().includes("title")
  //       )
  //     ) &&
  //     Boolean(
  //       node.children?.some(
  //         (c: any) =>
  //           c.type === "TEXT" && c.name?.toLowerCase().includes("paragraph")
  //       )
  //     ) &&
  //     Boolean(
  //       node.children?.some((c: any) => c.name?.toLowerCase().includes("image"))
  //     )
  //   );
  // };

  //
  // ATOMIC FIGMA TYPE FALLBACK
  //

  const recognizeNativeFigmaType = async (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext,
    options: TransformationOptions = {},
    parentType: string
  ): Promise<IntermediateNode | null> => {
    let type: IntermediateNodeType | undefined;
    let props: Record<string, any> = {};
    let design: DesignIntent | undefined;

    // const isEditorialCard = isProbablyEditorialCard(node);

    // if (isEditorialCard) {
    //   // This is a placeholder for a more robust component recognizer
    //   // For now, it just bypasses the native type recognition
    // } else {
    if (node.type === "TEXT") {
      design = mapFigmaToDesignIntent(node, ctx);
      const fontSize = design?.typography?.fontSize;
      if (typeof fontSize === "number" && fontSize > 24) {
        type = "headline";
      } else {
        type = "text";
      }
      props = { text: node.text };
    } else if (node.type === "FRAME" || node.type === "GROUP") {
      if (parentType === "page") {
        type = "section";
      } else {
        type = "group";
      }
      props = extractPropsFromNode(node);
      design = mapFigmaToDesignIntent(node, ctx);
    } else if (node.type === "IMAGE" || node.type === "IMAGE-SVG") {
      type = "image";
      props = {}; // No more props.src, it's in the design object now
      design = mapFigmaToDesignIntent(node, ctx);
    } else if (node.type === "RECTANGLE") {
      design = mapFigmaToDesignIntent(node, ctx);
      const height = (design?.layout?.height as number) || 0;
      const isDivider = height > 0 && height <= 2;
      type = isDivider ? "divider" : "shape";
    } else if (node.type === "INSTANCE") {
      props = extractPropsFromNode(node);
      design = mapFigmaToDesignIntent(node, ctx);
    }
    // }

    if (!type) {
      return null;
    }

    const children =
      node.children && node.children.length > 0
        ? await Promise.all(
            node.children.map((child) =>
              recognizeNode(child, ctx, options, type as string)
            )
          ).then((results) => results.filter(Boolean) as IntermediateNode[])
        : [];

    return {
      type: type,
      name: node.name,
      props,
      design,
      children,
      meta: { source: "native-recognizer", figmaId: node.id },
    };
  };

  const extractImageRef = (node: SimplifiedFigmaNode): string | undefined => {
    if (node.fills && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === "IMAGE") {
          return fill.imageRef;
        }
      }
    }
    return undefined;
  };

  const extractPropsFromNode = (
    node: SimplifiedFigmaNode
  ): Record<string, any> => {
    const props: Record<string, any> = {};

    if (node.text) props.text = node.text;
    if (node.name) props.name = node.name;
    if (node.componentProperties) {
      Object.entries(node.componentProperties).forEach(([key, val]) => {
        props[key] = val.value;
      });
    }

    return props;
  };

  const extractDesignFromNode = (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext
  ): DesignIntent | undefined => {
    return mapFigmaToDesignIntent(node, ctx);
  };

  /**
   * Maps raw Figma node properties to a structured DesignIntent object.
   * This is a deterministic mapping layer.
   * @param node The simplified Figma node.
   * @param ctx The recognizer context containing global styles.
   * @returns A DesignIntent object or undefined.
   */
  const mapFigmaToDesignIntent = (
    node: SimplifiedFigmaNode,
    ctx: RecognizerContext
  ): DesignIntent | undefined => {
    const intent: DesignIntent = {};
    const styles = ctx.globalVars?.styles || {};

    // --- Resolve Styles ---
    const textStyle =
      node.textStyle && styles[node.textStyle] ? styles[node.textStyle] : {};
    const layoutStyle =
      node.layout && styles[node.layout] ? styles[node.layout] : {};
    const fillStyle =
      node.fills && styles[node.fills as any]
        ? (styles[node.fills as any] as string[])
        : [];

    // --- Map Typography ---
    const hasTypo =
      textStyle.fontSize ||
      textStyle.fontWeight ||
      textStyle.textAlignHorizontal ||
      fillStyle?.[0];
    if (hasTypo) {
      intent.typography = {
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
        fontFamily: textStyle.fontFamily,
        textAlign: textStyle.textAlignHorizontal?.toLowerCase(),
        lineHeight: textStyle.lineHeight,
        color: fillStyle?.[0],
      };
    }

    // --- Map Layout ---
    const hasLayout =
      layoutStyle.gap ||
      layoutStyle.padding ||
      node.layout?.dimensions?.width ||
      node.layout?.dimensions?.height;
    if (hasLayout) {
      const padding =
        layoutStyle.padding?.split(" ").map((p: string) => p.trim()) || [];
      intent.layout = {
        gap: layoutStyle.gap,
        padding: layoutStyle.padding
          ? {
              top: padding[0],
              right: padding[1] || padding[0],
              bottom: padding[2] || padding[0],
              left: padding[3] || padding[1] || padding[0],
            }
          : undefined,
        width: node.layout?.dimensions?.width,
        height: node.layout?.dimensions?.height,
      };
    }

    // --- Map Appearance ---
    const imageRef = extractImageRef(node);
    if (imageRef) {
      intent.appearance = {
        backgroundColor: {
          imageRef: imageRef,
        },
      };
    } else if (node.fills) {
      intent.appearance = {
        backgroundColor: fillStyle?.[0],
      };
    }

    return Object.keys(intent).length > 0 ? intent : undefined;
  };

  // Transform entire Figma response to IRF
  const transformFigmaToIRF = async (
    figmaResponse: SimplifiedFigmaResponse,
    options: TransformationOptions = {}
  ): Promise<TransformationResult> => {
    try {
      // logger.info("[transformFigmaToIRF] figmaResponse and options: ");
      // logger.info(figmaResponse);
      // logger.info(options);
      // logger.info("--- end of figmaResponse and options ---");
      const startTime = Date.now();
      const errors: string[] = [];

      // Build recognizer context
      const context = buildRecognizerContext(figmaResponse);

      // logger.info("[transformFigmaToIRF] context: ");
      // logger.info(context);
      // logger.info("--- end of context ---");

      // Transform all root nodes
      const transformedNodes: IntermediateNode[] = [];

      for (const node of figmaResponse.nodes) {
        try {
          // Skip hidden layers if option is set
          if (!options.includeHiddenLayers && isHiddenLayer(node)) {
            continue;
          }

          const transformedNode = await recognizeNode(node, context, options);
          if (transformedNode) {
            transformedNodes.push(transformedNode);
          }
        } catch (error) {
          errors.push(`Failed to transform node ${node.id}: ${error}`);
        }
      }

      // Create IRF layout
      const layout: IntermediateLayout = {
        version: "1.0",
        name: figmaResponse.metadata.name || "Figma Import",
        content: transformedNodes,
        globalVars: figmaResponse.globalVars,
      };

      const result: TransformationResult = {
        success: errors.length === 0,
        layout,
        metadata: {
          fileKey: figmaResponse.metadata.fileKey,
          nodeId: figmaResponse.metadata.nodeId,
          sourceFile: figmaResponse.metadata.name || "figma-export",
          transformedAt: new Date().toISOString(),
          nodeCount: countNodes(figmaResponse.nodes),
          componentCount: transformedNodes.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      };

      // Cache the result
      const cacheKey = generateCacheKey(figmaResponse, options);
      transformationCache.set(cacheKey, result);

      log(`Transformation completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      log(`Transformation failed: ${error}`);
      throw new Error(`Transformation failed: ${error}`);
    }
  };

  // Validate IRF result
  const validateIRF = (layout: IntermediateLayout): boolean => {
    try {
      intermediateLayoutSchema.parse(layout);
      return true;
    } catch (error) {
      log(`IRF validation failed: ${error}`);
      return false;
    }
  };

  // Helper functions
  const isHiddenLayer = (node: SimplifiedFigmaNode): boolean => {
    return (
      node.name.startsWith(".") || node.name.toLowerCase().includes("hidden")
    );
  };

  const countNodes = (nodes: SimplifiedFigmaNode[]): number => {
    let count = 0;
    const traverse = (nodeList: SimplifiedFigmaNode[]) => {
      nodeList.forEach((node) => {
        count++;
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return count;
  };

  const generateCacheKey = (
    data: SimplifiedFigmaResponse,
    options: TransformationOptions
  ): string => {
    const dataHash = JSON.stringify(data).slice(0, 100);
    const optionsHash = JSON.stringify(options);
    return `${dataHash}-${optionsHash}`;
  };

  const log = (message: string) => {
    logger.info(`[FIGMA_TO_IRF_TRANSFORMER] ${message}`);
  };

  // Clear cache
  const clearCache = (): void => {
    transformationCache.clear();
    log("Transformation cache cleared");
  };

  // Get cache stats
  const getCacheStats = () => {
    return {
      size: transformationCache.size,
      keys: Array.from(transformationCache.keys()),
    };
  };

  // Add custom component mapping
  const addComponentMapping = (figmaId: string, irfType: string): void => {
    componentMappings.set(figmaId, irfType);
    log(`Added mapping: ${figmaId} -> ${irfType}`);
  };

  // Get all component mappings
  const getComponentMappings = (): Record<string, string> => {
    return Object.fromEntries(componentMappings);
  };

  // Initialize the service
  initializeDefaultMappings();
  log("Figma to IRF Transformer service initialized");

  // Public API
  return {
    transformFigmaToIRF,
    recognizeNode,
    validateIRF,
    clearCache,
    getCacheStats,
    addComponentMapping,
    getComponentMappings,

    // 🎯 NEW: AI Insights API
    generateAIInsights,
    setCustomAIInsightsFunction: (
      _customFunction: (
        node: SimplifiedFigmaNode,
        ctx: RecognizerContext,
        currentType?: string
      ) => Promise<AIInsights>
    ) => {
      // For future use when you want to replace the stub
      log(
        "Custom AI insights function set - this will be implemented in a future version"
      );
    },

    // Health check
    isHealthy: async (): Promise<boolean> => {
      try {
        // Test basic functionality with a simple node
        const testNode: SimplifiedFigmaNode = {
          id: "test",
          name: "Test Section",
          type: "FRAME",
        };

        const testContext: RecognizerContext = {
          componentIdMap: {},
          knownTypes: ["section", "text"],
        };

        const result = await recognizeNode(testNode, testContext);
        return result?.type === "section";
      } catch (error) {
        log(`Health check failed: ${error}`);
        return false;
      }
    },
  };
};

// Create and export the service instance
export const transformerService = createTransformerService();
