import { OpenAPIHono } from "@hono/zod-openapi";
import { serviceRegistry } from "../../../registry/service-registry";
import {
  getChangelogsRoute,
  getChangelogByIdRoute,
  createChangelogRoute,
  updateChangelogRoute,
  publishChangelogRoute,
} from "./changelogs.routes";

const changelogsRouter = new OpenAPIHono();

// Helper to convert Date objects to ISO strings for JSON serialization
function serializeChangelog(changelog: any) {
  return {
    ...changelog,
    createdAt: changelog.createdAt instanceof Date ? changelog.createdAt.toISOString() : changelog.createdAt,
    updatedAt: changelog.updatedAt instanceof Date ? changelog.updatedAt.toISOString() : changelog.updatedAt,
    releaseDate: changelog.releaseDate instanceof Date ? changelog.releaseDate.toISOString() : changelog.releaseDate,
  };
}

// Get all changelogs with optional pagination and filtering
changelogsRouter.openapi(getChangelogsRoute, async (c) => {
  try {
    const limit = Number(c.req.query("limit")) || 50;
    const offset = Number(c.req.query("offset")) || 0;

    // Get all changelogs from the database
    const changelogService = serviceRegistry.get("changelog");
    const result = await changelogService.listChangelogs({
      limit,
      offset,
    });

    return c.json({
      success: true,
      data: result.map(serializeChangelog),
      pagination: {
        limit,
        offset,
      },
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "CHANGELOG_ERROR",
        },
      } as const,
      500
    );
  }
});

// Get a single changelog by ID
changelogsRouter.openapi(getChangelogByIdRoute, async (c) => {
  try {
    const changelogId = c.req.param("id");

    const changelogService = serviceRegistry.get("changelog");
    const changelog = await changelogService.getChangelogById(changelogId);

    if (!changelog) {
      return c.json(
        {
          success: false,
          error: {
            message: "Changelog not found",
            code: "CHANGELOG_NOT_FOUND",
          },
        } as const,
        404
      );
    }

    return c.json({
      success: true,
      data: serializeChangelog(changelog),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "CHANGELOG_ERROR",
        },
      } as const,
      500
    );
  }
});

// Create a changelog
changelogsRouter.openapi(createChangelogRoute, async (c) => {
    try {
      const requestData = c.req.valid("json");
      const changelogService = serviceRegistry.get("changelog");
      const changelog = await changelogService.createChangelog({
        repoOwner: requestData.repoOwner,
        repoName: requestData.repoName,
        prNumber: requestData.prNumber,
        title: requestData.title,
        summary: requestData.summary,
        commits: requestData.commits,
        releaseDate: requestData.releaseDate,
        createdBy: requestData.createdBy,
        published: requestData.published,
      } as any);

      return c.json({
        success: true,
        data: changelog ? serializeChangelog(changelog) : changelog,
      } as const, 200);
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            message: (error as any).message,
            code: "CHANGELOG_ERROR",
          },
        } as const,
        500
      );
    }
  }
);

// Update a changelog
// @ts-expect-error - OpenAPI type inference issue with response union types
changelogsRouter.openapi(updateChangelogRoute, async (c) => {
    try {
      const changelogId = c.req.param("id");
      const requestData = c.req.valid("json");

      const changelogService = serviceRegistry.get("changelog");
      const changelog = await changelogService.updateChangelog(
        changelogId,
        requestData as any
      );

      if (!changelog) {
        return c.json(
          {
            success: false,
            error: {
              message: "Changelog not found",
              code: "CHANGELOG_NOT_FOUND",
            },
          } as const,
          404
        );
      }

      return c.json({
        success: true,
        data: serializeChangelog(changelog),
      } as const);
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            message: (error as any).message,
            code: "CHANGELOG_ERROR",
          },
        } as const,
        500
      );
    }
  }
);

// Publish a changelog
changelogsRouter.openapi(publishChangelogRoute, async (c) => {
  try {
    const changelogId = c.req.param("id");

    const changelogService = serviceRegistry.get("changelog");
    const changelog = await changelogService.publishChangelog(changelogId);

    if (!changelog) {
      return c.json(
        {
          success: false,
          error: {
            message: "Changelog not found",
            code: "CHANGELOG_NOT_FOUND",
          },
        } as const,
        404
      );
    }

    return c.json({
      success: true,
      data: serializeChangelog(changelog),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "CHANGELOG_ERROR",
        },
      } as const,
      500
    );
  }
});

export { changelogsRouter };