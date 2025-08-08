import { logger } from "@/utils/logger";
import StoryblokClient from "storyblok-js-client";
import { config } from "@/config.env";
import sharp from "sharp";

/**
 * Storyblok CMS Service
 *
 * This service handles API calls to Storyblok CMS for creating and managing stories.
 *
 * IMPORTANT: Uses storyblok-js-client v6.11.0 - DO NOT UPGRADE TO v7+
 * Version 7+ has breaking changes that cause 404 errors in Management API calls.
 * See TECHNICAL_DEBT.md for details.
 */

export interface StoryblokStory {
  name: string;
  slug: string;
  content: any;
  is_folder?: boolean;
  parent_id?: number;
  is_startpage?: boolean;
  position?: number;
  tag_list?: string[];
  published?: boolean;
}

export interface StoryblokCreateResponse {
  story: {
    id: number;
    name: string;
    slug: string;
    full_slug: string;
    content: any;
    created_at: string;
    updated_at: string;
    published_at?: string;
    is_folder: boolean;
    parent_id?: number;
    position: number;
    tag_list: string[];
    published: boolean;
  };
}

// New interfaces for spaces and stories
export interface StoryblokSpace {
  id: number;
  name: string;
  domain: string;
  uniq_domain: string;
  plan: string;
  plan_level: number;
  limits: any;
  created_at: string;
  role: string;
  owner_id: number;
  story_published_hook: string;
  environments: Array<{ name: string; location: string }>;
  stories_count: number;
  parent_id?: number;
  assets_count: number;
  searchblok_id?: number;
  duplicatable: boolean;
  request_count_today: number;
  exceeded_requests: number;
  billing_address: any;
  routes: string[];
  trial: boolean;
  default_root: string;
  has_slack_webhook: boolean;
  has_pending_tasks: boolean;
  ai_translation_disabled: boolean;
  first_token: string;
  options: any;
  collaborator: any;
  owner: any;
}

export interface StoryblokStoryResponse {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: any;
  created_at: string;
  updated_at: string;
  published_at?: string;
  is_folder: boolean;
  parent_id?: number;
  position: number;
  tag_list: string[];
  published: boolean;
  uuid: string;
  is_startpage: boolean;
  meta_data: any;
  group_id: string;
  first_published_at?: string;
  release_id?: number;
  lang: string;
  path?: string;
  alternates: any[];
  default_full_slug?: string;
  translated_slugs?: any[];
}

export interface StoryblokServiceConfig {
  spaceId: string;
  accessToken?: string;
  oauthToken?: string;
  region?: "eu" | "us" | "ap" | "ca";
  rateLimit?: number;
}

export const createStoryblokService = (config?: StoryblokServiceConfig) => {
  const defaultConfig: StoryblokServiceConfig = {
    spaceId: config?.spaceId || "317084",
    accessToken: process.env.STORYBLOK_ACCESS_TOKEN || config?.accessToken || "",
    oauthToken: process.env.STORYBLOK_OAUTH_TOKEN || config?.oauthToken || "",
    region: config?.region || "eu",
    rateLimit: config?.rateLimit || 2,
  };

  const finalConfig = {
    ...defaultConfig,
    ...config,
  };

  const client = new StoryblokClient({
    oauthToken: finalConfig.oauthToken,
    accessToken: finalConfig.accessToken,
    rateLimit: finalConfig.rateLimit,
    cache: {
      clear: "auto",
      type: "none",
    },
  });

  const spaceId = finalConfig.spaceId;

  const setupManagementClient = (_localConfig?: StoryblokServiceConfig) => {
    return new StoryblokClient({
      oauthToken: config?.oauthToken || "",
      accessToken: config?.accessToken || "",
      rateLimit: config?.rateLimit || 2,
      cache: {
        clear: "auto",
        type: "none",
      },
      endpoint: "https://mapi.storyblok.com/v1",
    });
  };

  /**
   * Get all Storyblok spaces
   * Uses Management API: GET /v1/spaces/
   */
  const getAllSpaces = async (): Promise<StoryblokSpace[]> => {
    try {
      // Create a fresh Management API client
      const managementClient = setupManagementClient();

      logger.info("Fetching all Storyblok spaces...");
      const response = await managementClient.get("/spaces/");

      logger.info(`Successfully fetched ${response.data.spaces?.length || 0} spaces`);
      return response.data.spaces || [];
    } catch (error) {
      logger.error("Error fetching Storyblok spaces:", error);
      throw error;
    }
  };

  /**
   * Get all stories from a specific space
   * Uses Management API: GET /v1/spaces/{space_id}/stories/
   */
  const getAllStoriesFromSpace = async (targetSpaceId: string): Promise<StoryblokStoryResponse[]> => {
    try {
      // Create a fresh Management API client
      // Create a fresh Management API client
      const managementClient = setupManagementClient();

      logger.info(`Fetching all stories from space: ${targetSpaceId}...`);
      const response = await managementClient.get(`/spaces/${targetSpaceId}/stories/`, {
        per_page: 100, // Maximum per page
        // We can add more parameters here later, but for now we're just getting all 100 stories
        // sort_by: 'created_at:desc',
        // is_folder: false,
        // published: true,
      });

      const stories = response.data.stories || [];
      logger.info(`Successfully fetched ${stories.length} stories from space ${targetSpaceId}`);
      return stories;
    } catch (error) {
      logger.error(`Error fetching stories from space ${targetSpaceId}:`, error);
      throw error;
    }
  };

  /**
   * Get specific story content by space ID and story ID
   * Uses Management API: GET /v1/spaces/{space_id}/stories/{story_id}
   */
  const getStoryContent = async (targetSpaceId: string, storyId: string | number): Promise<StoryblokStoryResponse> => {
    try {
      // Create a fresh Management API client
      const managementClient = setupManagementClient();

      const response = await managementClient.get(`/spaces/${targetSpaceId}/stories/${storyId}`, {});

      const story = response.data.story;
      if (!story) {
        throw new Error(`Story with ID ${storyId} not found in space ${targetSpaceId}`);
      }

      return story;
    } catch (error) {
      logger.error(`Error fetching story ${storyId} from space ${targetSpaceId}:`, error);
      console.log(error);
      throw error;
    }
  };

  const getAllStories = async () => {
    if (!client) {
      throw new Error("Storyblok client not initialized");
    }

    const allStories = await client.get(`/spaces/${spaceId}/stories/`);
    return allStories.data;
  };

  const createStory = async (story: StoryblokStory) => {
    const newStory = await client.post(`/spaces/${spaceId}/stories/`, story);

    return newStory;
  };

  const updateStory = async (
    storyId: number,
    story: StoryblokStory,
    options?: {
      forceUpdate?: boolean;
      publish?: boolean;
      lang?: string;
      releaseId?: number;
    }
  ) => {
    const payload: any = {
      story: {
        ...story,
      },
    };

    // Add optional parameters
    if (options?.forceUpdate) {
      payload.force_update = 1;
    }
    if (options?.publish) {
      payload.publish = 1;
    }
    if (options?.lang) {
      payload.lang = options.lang;
    }
    if (options?.releaseId) {
      payload.release_id = options.releaseId;
    }

    console.log("This is payload in updateStory");
    console.log(payload);
    console.log({ storyId, spaceId });

    const updatedStory = await client.put(`/spaces/${spaceId}/stories/${storyId}`, payload);
    return updatedStory;
  };

  const getStoryBySlug = async (slug: string) => {
    const story = await client.get(`/spaces/${spaceId}/stories/`, {
      per_page: 100,
      with_slug: slug,
    });

    return story.data.stories[0];
  };

  const getStoryById = async (storyId: number) => {
    const story = await client.get(`/spaces/${spaceId}/stories/${storyId}`);
    return story.data.story;
  };

  const createAndAttachStory = async (story: StoryblokStory) => {
    const parentStory = await getStoryBySlug("en");

    const newStory = await createStory({
      ...story,
      parent_id: parentStory.id,
    });

    return newStory;
  };

  const updateStoryBySlug = async (
    slug: string,
    story: StoryblokStory,
    options?: {
      forceUpdate?: boolean;
      publish?: boolean;
      lang?: string;
      releaseId?: number;
    }
  ) => {
    // First, find the story by slug
    const existingStory = await getStoryBySlug(slug);
    if (!existingStory) {
      throw new Error(`Story with slug "${slug}" not found`);
    }

    // Update the story using its ID
    return await updateStory(existingStory.id, story, options);
  };

  const uploadAsset = async (imageUrl: string, filename: string): Promise<string> => {
    // 1. Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from ${imageUrl}: ${imageResponse.statusText}`);
    }
    let imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type");

    // Resize the image if its height is greater than 1000px
    const image = sharp(Buffer.from(imageBuffer));
    let metadata = await image.metadata();
    if (metadata.height && metadata.height > 1000) {
      imageBuffer = await image.resize({ height: 1000 }).toBuffer();
      metadata = await sharp(imageBuffer).metadata();
    }

    // 2. Get signed request from Storyblok
    const assetData = {
      filename: filename,
      content_type: contentType || "image/jpeg", // Default content type
      size: `${metadata.width}x${metadata.height}`,
    };

    const signedUploadResponse = await client.post(`/spaces/${spaceId}/assets`, assetData);

    const signedRequestData = (signedUploadResponse as any).data;

    // 3. Upload to S3 using the signed request
    const formData = new FormData();
    for (const key in signedRequestData.fields) {
      formData.append(key, signedRequestData.fields[key]);
    }
    formData.append("file", new Blob([imageBuffer]), filename);

    const uploadResponse = await fetch(signedRequestData.post_url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image to S3. Status: ${uploadResponse.status}`);
    }

    return signedRequestData.pretty_url;
  };

  return {
    getAllSpaces,
    getAllStoriesFromSpace,
    getStoryContent,
    getAllStories,
    createStory,
    updateStory,
    getStoryBySlug,
    getStoryById,
    createAndAttachStory,
    updateStoryBySlug,
    uploadAsset,
  };
};

// Create and export the service instance
export const storyblokService = createStoryblokService({
  oauthToken: config.STORYBLOK_OAUTH_TOKEN,
  accessToken: config.STORYBLOK_ACCESS_TOKEN,
  spaceId: "317084",
});

export type StoryblokService = typeof storyblokService;
