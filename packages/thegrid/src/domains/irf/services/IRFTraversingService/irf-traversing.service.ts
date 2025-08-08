import { IntermediateNode, IntermediateLayout } from "../../schema.types";
import { intermediateNodeSchema, intermediateLayoutSchema } from "../../schema";
import {
  TraversingOptions,
  TraversingResult,
  NodeTraversalContext,
  NodeVisitor,
} from "./irf-traversing.service.types";

/**
 * IRF Traversing Service
 *
 * This service provides functionality to traverse IRF (Intermediate Representation Format)
 * structures and enrich nodes with additional information such as parent node details.
 *
 * Features:
 * - Traverse nested IRF structures
 * - Enrich nodes with parent information
 * - Support for custom enrichment functions
 * - Visitor pattern support
 * - Validation during traversal
 * - Metadata collection
 */
export const createIRFTraversingService = () => {
  // Private state
  let totalNodes = 0;
  let enrichedNodes = 0;
  let maxDepth = 0;
  let errors: string[] = [];
  let warnings: string[] = [];

  /**
   * Reset internal counters and error arrays
   */
  const resetCounters = (): void => {
    totalNodes = 0;
    enrichedNodes = 0;
    maxDepth = 0;
    errors = [];
    warnings = [];
  };

  /**
   * Enrich a single node with parent information
   */
  const enrichNodeWithParent = (
    node: IntermediateNode,
    parentNode?: IntermediateNode
  ): IntermediateNode => {
    const enrichedNode: IntermediateNode = {
      ...node,
      parentNodeName: parentNode?.name,
      parentNodeTypeName: parentNode?.type,
    };

    enrichedNodes++;
    return enrichedNode;
  };

  /**
   * Private method to traverse and enrich nodes recursively
   */
  const traverseNodes = async (
    nodes: IntermediateNode[],
    options: TraversingOptions,
    parentNode?: IntermediateNode,
    depth = 0,
    path: string[] = []
  ): Promise<IntermediateNode[]> => {
    maxDepth = Math.max(maxDepth, depth);

    const enrichedNodesList: IntermediateNode[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue; // Guard against undefined nodes

      totalNodes++;

      try {
        // Validate node if requested
        if (options.validateNodes) {
          const validationResult = intermediateNodeSchema.safeParse(node);
          if (!validationResult.success) {
            warnings.push(
              `Node validation warning at ${path.join("/")}/${node.name}: ${validationResult.error.message}`
            );
          }
        }

        // Create enriched node
        let enrichedNode = { ...node };

        // Apply parent enrichment if enabled
        if (options.enrichWithParent !== false) {
          enrichedNode = enrichNodeWithParent(enrichedNode, parentNode);
        }

        // Apply custom enrichment if provided
        if (options.customEnrichment) {
          enrichedNode = options.customEnrichment(enrichedNode, parentNode);
        }

        // Recursively process children
        if (enrichedNode.children && enrichedNode.children.length > 0) {
          enrichedNode.children = await traverseNodes(
            enrichedNode.children,
            options,
            enrichedNode,
            depth + 1,
            [...path, enrichedNode.name]
          );
        }

        // Recursively process slots
        if (enrichedNode.slots && Object.keys(enrichedNode.slots).length > 0) {
          const enrichedSlots: { [slotName: string]: IntermediateNode[] } = {};
          
          for (const [slotName, slotNodes] of Object.entries(enrichedNode.slots)) {
            enrichedSlots[slotName] = await traverseNodes(
              slotNodes,
              options,
              enrichedNode,
              depth + 1,
              [...path, enrichedNode.name, `slot:${slotName}`]
            );
          }
          
          enrichedNode.slots = enrichedSlots;
        }

        enrichedNodesList.push(enrichedNode);
      } catch (error) {
        errors.push(
          `Error processing node ${node.name} at depth ${depth}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        // Continue with original node on error
        enrichedNodesList.push(node);
      }
    }

    return enrichedNodesList;
  };

  /**
   * Private method to traverse nodes with visitor pattern
   */
  const traverseNodesWithVisitor = async (
    nodes: IntermediateNode[],
    visitor: NodeVisitor,
    options: TraversingOptions,
    parentNode?: IntermediateNode,
    depth = 0,
    path: string[] = []
  ): Promise<IntermediateNode[]> => {
    maxDepth = Math.max(maxDepth, depth);

    const processedNodes: IntermediateNode[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue; // Guard against undefined nodes

      totalNodes++;

      try {
        const context: NodeTraversalContext = {
          currentNode: node,
          parentNode,
          depth,
          path: [...path, node.name],
          index: i,
        };

        // Call beforeVisit if provided
        if (visitor.beforeVisit) {
          await visitor.beforeVisit(context);
        }

        // Process the node
        let processedNode = node;

        // Apply visitor processing
        if (visitor.visit) {
          processedNode = await visitor.visit(context);
        }

        // Apply default parent enrichment if enabled
        if (options.enrichWithParent !== false) {
          processedNode = enrichNodeWithParent(processedNode, parentNode);
        }

        // Apply custom enrichment if provided
        if (options.customEnrichment) {
          processedNode = options.customEnrichment(processedNode, parentNode);
        }

        // Update context with processed node
        context.currentNode = processedNode;

        // Recursively process children
        if (processedNode.children && processedNode.children.length > 0) {
          processedNode.children = await traverseNodesWithVisitor(
            processedNode.children,
            visitor,
            options,
            processedNode,
            depth + 1,
            [...path, processedNode.name]
          );
        }

        // Recursively process slots
        if (processedNode.slots && Object.keys(processedNode.slots).length > 0) {
          const processedSlots: { [slotName: string]: IntermediateNode[] } = {};
          
          for (const [slotName, slotNodes] of Object.entries(processedNode.slots)) {
            processedSlots[slotName] = await traverseNodesWithVisitor(
              slotNodes,
              visitor,
              options,
              processedNode,
              depth + 1,
              [...path, processedNode.name, `slot:${slotName}`]
            );
          }
          
          processedNode.slots = processedSlots;
        }

        // Call afterVisit if provided
        if (visitor.afterVisit) {
          await visitor.afterVisit(context);
        }

        processedNodes.push(processedNode);
      } catch (error) {
        errors.push(
          `Error processing node ${node.name} at depth ${depth}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        // Continue with original node on error
        processedNodes.push(node);
      }
    }

    return processedNodes;
  };

  /**
   * Traverse and enrich an IRF layout with parent information
   */
  const traverseAndEnrich = async (
    layout: IntermediateLayout,
    options: TraversingOptions = {}
  ): Promise<TraversingResult> => {
    try {
      // Reset counters
      resetCounters();

      // Validate input layout if requested
      if (options.validateNodes) {
        const validationResult = intermediateLayoutSchema.safeParse(layout);
        if (!validationResult.success) {
          throw new Error(
            `Invalid layout structure: ${validationResult.error.message}`
          );
        }
      }

      // Create a deep copy to avoid mutating the original
      const enrichedLayout: IntermediateLayout = {
        ...layout,
        content: await traverseNodes(layout.content, options),
      };

      return {
        success: true,
        enrichedLayout,
        metadata: {
          totalNodes,
          enrichedNodes,
          traversedAt: new Date().toISOString(),
          maxDepth,
        },
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));

      return {
        success: false,
        enrichedLayout: layout, // Return original layout on error
        metadata: {
          totalNodes,
          enrichedNodes,
          traversedAt: new Date().toISOString(),
          maxDepth,
        },
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }
  };

  /**
   * Traverse nodes with a visitor pattern
   */
  const traverseWithVisitor = async (
    layout: IntermediateLayout,
    visitor: NodeVisitor,
    options: TraversingOptions = {}
  ): Promise<TraversingResult> => {
    try {
      resetCounters();

      const enrichedContent = await traverseNodesWithVisitor(
        layout.content,
        visitor,
        options
      );

      const enrichedLayout: IntermediateLayout = {
        ...layout,
        content: enrichedContent,
      };

      return {
        success: true,
        enrichedLayout,
        metadata: {
          totalNodes,
          enrichedNodes,
          traversedAt: new Date().toISOString(),
          maxDepth,
        },
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));

      return {
        success: false,
        enrichedLayout: layout,
        metadata: {
          totalNodes,
          enrichedNodes,
          traversedAt: new Date().toISOString(),
          maxDepth,
        },
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }
  };

  /**
   * Utility method to find all nodes of a specific type
   */
  const findNodesByType = async (
    layout: IntermediateLayout,
    nodeType: string
  ): Promise<IntermediateNode[]> => {
    const foundNodes: IntermediateNode[] = [];

    const visitor: NodeVisitor = {
      visit: (context) => {
        if (context.currentNode.type === nodeType) {
          foundNodes.push(context.currentNode);
        }
        return context.currentNode;
      },
    };

    await traverseWithVisitor(layout, visitor, { enrichWithParent: false });
    return foundNodes;
  };

  /**
   * Utility method to find nodes within a specific slot
   */
  const findNodesInSlot = async (
    layout: IntermediateLayout,
    slotName: string
  ): Promise<IntermediateNode[]> => {
    const foundNodes: IntermediateNode[] = [];

    const visitor: NodeVisitor = {
      visit: (context) => {
        // Check if current node has the specified slot
        if (context.currentNode.slots && context.currentNode.slots[slotName]) {
          foundNodes.push(...context.currentNode.slots[slotName]);
        }
        return context.currentNode;
      },
    };

    await traverseWithVisitor(layout, visitor, { enrichWithParent: false });
    return foundNodes;
  }

  /**
   * Utility method to get the depth of the tree structure
   */
  const getMaxDepth = async (layout: IntermediateLayout): Promise<number> => {
    await traverseAndEnrich(layout, { enrichWithParent: false });
    return maxDepth;
  };

  /**
   * Utility method to count total nodes in the layout
   */
  const countNodes = async (layout: IntermediateLayout): Promise<number> => {
    let count = 0;
    
    const visitor: NodeVisitor = {
      visit: (context) => {
        count++;
        return context.currentNode;
      },
    };
    
    await traverseWithVisitor(layout, visitor, { enrichWithParent: false });
    return count;
  };

  /**
   * Utility method to get all slot names used in the layout
   */
  const getAllSlotNames = async (layout: IntermediateLayout): Promise<string[]> => {
    const slotNames = new Set<string>();
    
    const visitor: NodeVisitor = {
      visit: (context) => {
        if (context.currentNode.slots) {
          Object.keys(context.currentNode.slots).forEach(slotName => {
            slotNames.add(slotName);
          });
        }
        return context.currentNode;
      },
    };
    
    await traverseWithVisitor(layout, visitor, { enrichWithParent: false });
    return Array.from(slotNames);
  };

  // Return the public API
  return {
    traverseAndEnrich,
    traverseWithVisitor,
    enrichNodeWithParent,
    findNodesByType,
    findNodesInSlot,
    getMaxDepth,
    countNodes,
    getAllSlotNames,
  };
};

// Create and export a singleton instance
export const irfTraversingService = createIRFTraversingService();
