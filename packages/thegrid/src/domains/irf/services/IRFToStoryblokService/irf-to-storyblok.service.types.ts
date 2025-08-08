import { IntermediateNode } from "../../schema.types";

//
// STORYBLOK TYPES
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
// TRANSFORMATION RESULT
//

export interface IRFToStoryblokResult {
  success: boolean;
  story: StoryblokStory;
  metadata: {
    sourceLayout: string;
    transformedAt: string;
    componentCount: number;
    totalComponents: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface IRFToStoryblokOptions {
  storyName?: string;
  storySlug?: string;
  parentId?: number;
  groupId?: string;
  includeMetadata?: boolean;
  customMappings?: Record<string, string>;
  globalVars?: {
    styles?: Record<string, any>;
    [key: string]: any;
  };
  fileKey?: string;
}

// Component transformer function type
export type ComponentTransformer = (
  node: IntermediateNode,
  options?: IRFToStoryblokOptions
) => Promise<StoryblokComponent> | StoryblokComponent;

// Component registry entry
export interface ComponentRegistryEntry {
  defaultStoryblokComponent: string;
  transform: ComponentTransformer;
}
