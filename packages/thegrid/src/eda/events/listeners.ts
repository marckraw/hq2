import { eventBus } from "./event-bus";
import { releaseReadyEventHandler } from "./event-handlers/releas.ready.event";
import { approvalGrantedEventHandler } from "./event-handlers/approval.granted.event";
import { figmaToStoryblokReadyEventHandler } from "./event-handlers/figma-to-storyblok.ready.event";
import { storyblokEditorCompletedEventHandler } from "./event-handlers/storyblok-editor.completed.event";

export const setupEventListeners = () => {
  eventBus.on("release.ready", releaseReadyEventHandler);

  // Handler for approval.granted event to resume pipeline
  eventBus.on("approval.granted", approvalGrantedEventHandler);

  // 🎯 NEW: Handler for figma-to-storyblok.ready event to create approval pipeline
  eventBus.on("figma-to-storyblok.ready", figmaToStoryblokReadyEventHandler);

  // ✏️ NEW: Handler for storyblok-editor.completed event to create approval pipeline
  eventBus.on(
    "storyblok-editor.completed",
    storyblokEditorCompletedEventHandler
  );
};
