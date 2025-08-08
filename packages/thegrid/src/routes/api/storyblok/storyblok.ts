import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "../../../utils/logger";
import { storyblokService } from "../../../domains/integration/services/StoryblokService/storyblok.service";
import { getSpacesRoute, getStoriesRoute, getStoryContentRoute } from "./storyblok.routes";

const storyblokRouter = new OpenAPIHono();

/**
 * GET /api/storyblok/spaces?search=term
 * Get available Storyblok spaces with optional search filtering
 */
storyblokRouter.openapi(getSpacesRoute, async (c) => {
  try {
    const searchTerm = c.req.query("search") || "";

    logger.info(
      `API: Fetching Storyblok spaces${searchTerm ? ` with search: "${searchTerm}"` : ""}`
    );

    const spaces = await storyblokService.getAllSpaces();

    // Filter spaces by search term (name contains search term)
    let filteredSpaces = spaces;
    if (searchTerm && searchTerm.length >= 3) {
      filteredSpaces = spaces.filter(
        (space) =>
          space.name &&
          space.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      logger.info(
        `API: Filtered ${spaces.length} spaces down to ${filteredSpaces.length} matching "${searchTerm}"`
      );
    }

    // Limit results to 10 spaces max
    const limitedSpaces = filteredSpaces.slice(0, 10);

    return c.json({
      success: true,
      data: limitedSpaces,
      count: limitedSpaces.length,
      totalCount: filteredSpaces.length,
      searchTerm: searchTerm || null,
    } as const, 200);
  } catch (error) {
    logger.error("API: Error fetching Storyblok spaces:", error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch Storyblok spaces",
        details: error instanceof Error ? error.message : "Unknown error",
      } as const,
      500
    );
  }
});

/**
 * GET /api/storyblok/spaces/:spaceId/stories?search=term
 * Get stories from a specific space with optional search filtering
 */
storyblokRouter.openapi(getStoriesRoute, async (c) => {
  try {
    const spaceId = c.req.param("spaceId");
    const searchTerm = c.req.query("search") || "";

    if (!spaceId) {
      return c.json(
        {
          success: false,
          error: "Space ID is required",
        } as const,
        400
      );
    }

    logger.info(
      `API: Fetching stories from space: ${spaceId}${searchTerm ? ` with search: "${searchTerm}"` : ""}`
    );

    const stories = await storyblokService.getAllStoriesFromSpace(spaceId);

    // Filter stories by search term (slug contains search term)
    let filteredStories = stories;
    if (searchTerm && searchTerm.length >= 3) {
      filteredStories = stories.filter(
        (story) =>
          story.slug &&
          story.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      logger.info(
        `API: Filtered ${stories.length} stories down to ${filteredStories.length} matching "${searchTerm}"`
      );
    }

    // Limit results to 10 stories max
    const limitedStories = filteredStories.slice(0, 10);

    return c.json({
      success: true,
      data: limitedStories,
      count: limitedStories.length,
      totalCount: filteredStories.length,
      spaceId,
      searchTerm: searchTerm || null,
    } as const, 200);
  } catch (error) {
    logger.error(`API: Error fetching stories from space:`, error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch stories from space",
        details: error instanceof Error ? error.message : "Unknown error",
      } as const,
      500
    );
  }
});

/**
 * GET /api/storyblok/spaces/:spaceId/stories/:storyId
 * Get content of a specific story
 */
storyblokRouter.openapi(getStoryContentRoute, async (c) => {
  try {
    const spaceId = c.req.param("spaceId");
    const storyId = c.req.param("storyId");

    if (!spaceId || !storyId) {
      return c.json(
        {
          success: false,
          error: "Space ID and Story ID are required",
        } as const,
        400
      );
    }

    logger.info(`API: Fetching story ${storyId} from space ${spaceId}`);

    const story = await storyblokService.getStoryContent(spaceId, storyId);

    return c.json({
      success: true,
      data: story,
      spaceId,
      storyId,
    } as const, 200);
  } catch (error) {
    logger.error(`API: Error fetching story content:`, error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch story content",
        details: error instanceof Error ? error.message : "Unknown error",
      } as const,
      500
    );
  }
});

export { storyblokRouter };
