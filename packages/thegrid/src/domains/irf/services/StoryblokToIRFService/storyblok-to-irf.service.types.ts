import { IntermediateNode, IntermediateLayout } from "../../schema.types";

//
// STORYBLOK INPUT TYPES (what we're transforming FROM)
//

export interface StoryblokComponent {
  component: string;
  _uid?: string;
  [key: string]: any; // Additional component-specific properties
}

export interface StoryblokStory {
  name: string;
  slug: string;
  content: {
    component: string;
    _uid?: string;
    body: StoryblokComponent[];
    [key: string]: any; // Additional page-level properties
  };
  is_folder: boolean;
  parent_id?: number;
  group_id?: string;
  default_root?: string;
  disable_fe_editor?: boolean;
  path?: string;
  real_path?: string;
  position?: number;
  tag_list?: string[];
  is_startpage?: boolean;
  meta_data?: Record<string, any>;
}

//
// TRANSFORMATION RESULT (what we're transforming TO)
//

export interface StoryblokToIRFResult {
  success: boolean;
  irfLayout: IntermediateLayout;
  metadata: {
    sourceStory: string;
    transformedAt: string;
    componentCount: number;
    totalComponents: number;
    storyblokSlug?: string;
    warnings?: string[];
  };
  errors?: string[];
  warnings?: string[];
}

export interface StoryblokToIRFOptions {
  includeMetadata?: boolean;
  preserveStoryblokIds?: boolean;
  customMappings?: Record<string, string>;
  globalVars?: {
    styles?: Record<string, any>;
    [key: string]: any;
  };
  // Rich text processing options
  extractPlainText?: boolean;
  preserveFormatting?: boolean;
  // Asset processing options
  downloadAssets?: boolean;
  assetBaseUrl?: string;
  // AI fallback options
  useAIFallback?: boolean;
  aiConfidenceThreshold?: number;
}

// Reverse component transformer function type
export type ReverseComponentTransformer = (
  component: StoryblokComponent,
  options?: StoryblokToIRFOptions
) => Promise<IntermediateNode> | IntermediateNode;

// Reverse component registry entry
export interface ReverseComponentRegistryEntry {
  targetIRFType: string;
  transform: ReverseComponentTransformer;
  confidence?: number; // How confident we are about this mapping
  description?: string; // Human-readable description
}

//
// RICH TEXT PROCESSING TYPES
//

export interface ProseMirrorDoc {
  type: "doc";
  content?: ProseMirrorNode[];
}

export interface ProseMirrorNode {
  type: string;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: ProseMirrorMark[];
  attrs?: Record<string, any>;
}

export interface ProseMirrorMark {
  type: string;
  attrs?: Record<string, any>;
}

//
// STORYBLOK ASSET TYPES
//

export interface StoryblokAsset {
  id?: number;
  alt?: string;
  name?: string;
  focus?: string;
  title?: string;
  source?: string;
  filename: string;
  copyright?: string;
  fieldtype: "asset";
  meta_data?: Record<string, any>;
  is_external_url?: boolean;
}

export interface StoryblokLink {
  id?: string;
  url?: string;
  linktype?: "story" | "url" | "email" | "asset";
  fieldtype?: "multilink";
  cached_url?: string;
  target?: "_blank" | "_self";
  story?: {
    name?: string;
    slug?: string;
    url?: string;
    [key: string]: any;
  };
}

//
// TRANSFORMATION CONTEXT
//

export interface TransformationContext {
  parentComponent?: StoryblokComponent;
  depth: number;
  path: string[]; // Array of component names showing the path from root
  storySlug?: string;
  globalOptions: StoryblokToIRFOptions;
}

//
// ERROR TYPES
//

export interface TransformationError {
  type:
    | "UNKNOWN_COMPONENT"
    | "INVALID_STRUCTURE"
    | "PARSING_ERROR"
    | "VALIDATION_ERROR";
  message: string;
  component?: string;
  path?: string;
  originalData?: any;
  suggestion?: string;
}

export interface TransformationWarning {
  type:
    | "MISSING_CONTENT"
    | "SIMPLIFIED_STRUCTURE"
    | "METADATA_LOSS"
    | "UNSUPPORTED_FEATURE"
    | "UNSUPPORTED_COMPONENT";
  message: string;
  component?: string;
  path?: string;
  impact?: "low" | "medium" | "high";
}
