import { IntermediateNode, IntermediateLayout } from "../../schema.types";

//
// TRAVERSING TYPES
//

export interface TraversingOptions {
  /** Whether to enrich nodes with parent information */
  enrichWithParent?: boolean;
  /** Custom enrichment function to apply to each node */
  customEnrichment?: (
    node: IntermediateNode,
    parent?: IntermediateNode
  ) => IntermediateNode;
  /** Whether to validate nodes during traversal */
  validateNodes?: boolean;
  /** Whether to include metadata about the traversal */
  includeMetadata?: boolean;
}

export interface TraversingResult {
  success: boolean;
  enrichedLayout: IntermediateLayout;
  metadata: {
    totalNodes: number;
    enrichedNodes: number;
    traversedAt: string;
    maxDepth: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface NodeTraversalContext {
  /** Current node being processed */
  currentNode: IntermediateNode;
  /** Parent node (if any) */
  parentNode?: IntermediateNode;
  /** Current depth in the tree */
  depth: number;
  /** Path from root to current node */
  path: string[];
  /** Index of current node in parent's children array */
  index?: number;
}

// Custom enrichment function type
export type NodeEnrichmentFunction = (
  node: IntermediateNode,
  context: NodeTraversalContext
) => IntermediateNode | Promise<IntermediateNode>;

// Visitor pattern for node processing
export interface NodeVisitor {
  /** Called before processing a node */
  beforeVisit?: (context: NodeTraversalContext) => void | Promise<void>;
  /** Called after processing a node */
  afterVisit?: (context: NodeTraversalContext) => void | Promise<void>;
  /** Called when visiting a node */
  visit?: (
    context: NodeTraversalContext
  ) => IntermediateNode | Promise<IntermediateNode>;
}
