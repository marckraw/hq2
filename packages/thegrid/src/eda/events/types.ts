export type Domain =
  | "task"
  | "mood"
  | "system"
  | "pulse"
  | "agent"
  | "notification"
  | "activity"
  | "release"
  | "figma-to-storyblok"
  | "storyblok-editor";

// Following the <domain>.<action> pattern
export type EventType =
  // Release events
  | "release.ready"

  // Figma to Storyblok events
  | "figma-to-storyblok.ready"
  | "figma-to-storyblok.approved"

  // Storyblok Editor events
  | "storyblok-editor.completed"

  // Pipeline approval events
  | "approval.granted";

// Type-safe payload definitions for each event
export interface EventPayloads {
  "release.ready": {
    repoOwner: string;
    repoName: string;
    prNumber: string;
  };

  // Figma to Storyblok events
  "figma-to-storyblok.ready": {
    figmaData: any;
    irfResult: any;
    storyblokResult: any;
    finalStoryblokStory: any;
    metadata: {
      figmaFileName: string;
      componentCount: number;
      nodeCount: number;
      storyName: string;
      storySlug: string;
    };
  };

  "figma-to-storyblok.approved": {
    pipelineId: string;
    approvalStepId: string;
    finalStoryblokStory: any;
    metadata: {
      figmaFileName: string;
      storyName: string;
      storySlug: string;
    };
  };

  // Storyblok Editor events
  "storyblok-editor.completed": {
    originalStoryblok: any;
    irf: any;
    editedStoryblok: any;
    metadata: {
      transformationTime: string;
      originalComponentCount: number;
      finalComponentCount: number;
      storyName: string;
      storySlug: string;
      spaceId: string;
    };
  };

  // Pipeline approval events
  "approval.granted": {
    pipelineId: string;
    approvalStepId: string;
    repoOwner?: string;
    repoName?: string;
    prNumber?: string;
    summary?: string;
    commits?: unknown[];
    prDetails?: any;
  };
}

// Base signal type
export interface BaseSignal {
  id: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, unknown>;
}

// Type-safe event mapping
export type EventMap = {
  [K in EventType]: {
    type: K;
    payload: EventPayloads[K];
  };
};
