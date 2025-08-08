import { z } from "@hono/zod-openapi";

// Diff types
export type DiffChangeType = "added" | "removed" | "modified";
export type DiffViewMode = "unified" | "split";

export interface PropertyChange {
  property: string;
  path: string;
  oldValue: any;
  newValue: any;
  changeType: DiffChangeType;
}

export interface ComponentChange {
  type: DiffChangeType;
  path: string;
  componentType: string;
  componentId?: string;
  componentName?: string;
  oldComponent?: any;
  newComponent?: any;
  propertyChanges?: PropertyChange[];
}

export interface StoryblokDiffSummary {
  componentsAdded: number;
  componentsRemoved: number;
  componentsModified: number;
  propertiesChanged: number;
  totalChanges: number;
}

export interface StoryblokDiff {
  summary: StoryblokDiffSummary;
  changes: ComponentChange[];
  visualDiff?: string; // HTML representation
  markdownDiff?: string; // Markdown representation
  generatedAt: string;
  // Enhanced diff data for better frontend experience
  enhancedDiff?: {
    originalJson: string; // Formatted JSON for side-by-side view
    editedJson: string; // Formatted JSON for side-by-side view
    jsonDiff: any; // Raw jsondiffpatch output
  };
}

// Options for diff generation
export interface DiffOptions {
  includeVisualDiff?: boolean;
  includeMarkdownDiff?: boolean;
  ignoreProperties?: string[]; // Properties to ignore in comparison
  maxDepth?: number; // Maximum depth for nested comparisons
  viewMode?: DiffViewMode;
}

// Zod schemas for validation
export const propertyChangeSchema = z.object({
  property: z.string(),
  path: z.string(),
  oldValue: z.any(),
  newValue: z.any(),
  changeType: z.enum(["added", "removed", "modified"]),
});

export const componentChangeSchema = z.object({
  type: z.enum(["added", "removed", "modified"]),
  path: z.string(),
  componentType: z.string(),
  componentId: z.string().optional(),
  componentName: z.string().optional(),
  oldComponent: z.any().optional(),
  newComponent: z.any().optional(),
  propertyChanges: z.array(propertyChangeSchema).optional(),
});

export const storyblokDiffSummarySchema = z.object({
  componentsAdded: z.number(),
  componentsRemoved: z.number(),
  componentsModified: z.number(),
  propertiesChanged: z.number(),
  totalChanges: z.number(),
});

export const storyblokDiffSchema = z.object({
  summary: storyblokDiffSummarySchema,
  changes: z.array(componentChangeSchema),
  visualDiff: z.string().optional(),
  markdownDiff: z.string().optional(),
  generatedAt: z.string(),
});

export const diffOptionsSchema = z.object({
  includeVisualDiff: z.boolean().optional().default(true),
  includeMarkdownDiff: z.boolean().optional().default(false),
  ignoreProperties: z.array(z.string()).optional().default(["_uid", "_editable"]),
  maxDepth: z.number().optional().default(10),
  viewMode: z.enum(["unified", "split"]).optional().default("unified"),
});

// Type guards
export const isDiffChangeType = (value: any): value is DiffChangeType => {
  return ["added", "removed", "modified"].includes(value);
};

export const isPropertyChange = (value: any): value is PropertyChange => {
  return (
    typeof value === "object" &&
    value !== null &&
    "property" in value &&
    "path" in value &&
    "changeType" in value &&
    isDiffChangeType(value.changeType)
  );
};

export const isComponentChange = (value: any): value is ComponentChange => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "path" in value &&
    "componentType" in value &&
    isDiffChangeType(value.type)
  );
};