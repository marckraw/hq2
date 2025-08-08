import { IRFToStoryblokResult } from "../../../domains/irf/services/IRFToStoryblokService/irf-to-storyblok.service.types";

export interface StoryblokOptionsToOverride {
  storySlug?: string;
  storyName?: string;
}

export const constructFinalStoryblokStory = (
  storyblokTransformationResult: IRFToStoryblokResult,
  options?: StoryblokOptionsToOverride
) => {
  return {
    name: options?.storyName || storyblokTransformationResult.story.name,
    slug: options?.storySlug || storyblokTransformationResult.story.slug,
    full_slug: `en/${options?.storySlug || storyblokTransformationResult.story.slug}`,
    tag_list: [],
    is_startpage: false,
    alternates: [],
    default_full_slug: null,
    translated_slugs: null,
    content: storyblokTransformationResult.story.content,
    is_folder: storyblokTransformationResult.story.is_folder || false,
    parent_id: storyblokTransformationResult.story.parent_id,
    group_id: storyblokTransformationResult.story.group_id,
    disable_fe_editor:
      storyblokTransformationResult.story.disable_fe_editor || false,
  };
};
