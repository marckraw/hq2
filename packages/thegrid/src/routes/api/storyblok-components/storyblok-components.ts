import { logger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../../../db";
import { storyblokComponents } from "../../../db/schema/storyblok-components";
import { StoryblokComponentData } from "../../../schemas";
import { eq } from "drizzle-orm";
import { serializeRecord, serializeRecords } from "../shared/serializers";
import {
  createOrUpdateComponentRoute,
  getAllComponentsRoute,
  getComponentNamesRoute,
  getComponentByNameRoute,
} from "./storyblok-components.routes";

const storyblokComponentsRouter = new OpenAPIHono();

// @ts-expect-error - OpenAPI type inference issue with response union types
storyblokComponentsRouter.openapi(createOrUpdateComponentRoute, async (c) => {
  try {
    const component = (await c.req.json()) as StoryblokComponentData;

    // Check if component already exists
    const existing = await db
      .select()
      .from(storyblokComponents)
      .where(eq(storyblokComponents.name, component.name))
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing component
      const [updated] = await db
        .update(storyblokComponents)
        .set({
          jsonContent: component.jsonContent,
          markdownContent: component.markdownContent,
          updatedAt: new Date(),
        })
        .where(eq(storyblokComponents.name, component.name))
        .returning();
      result = updated;
    } else {
      // Insert new component
      const [inserted] = await db
        .insert(storyblokComponents)
        .values({
          name: component.name,
          jsonContent: component.jsonContent,
          markdownContent: component.markdownContent,
        })
        .returning();
      result = inserted;
    }

    return c.json({ success: true, component: serializeRecord(result) } as const, 200);
  } catch (error) {
    logger.error("Error processing Storyblok component:", error);
    return c.json({ error: "Internal server error" } as const, 500);
  }
});

// Get all components
storyblokComponentsRouter.openapi(getAllComponentsRoute, async (c) => {
  try {
    const components = await db.select().from(storyblokComponents);
    return c.json(serializeRecords(components), 200);
  } catch (error) {
    logger.error("Error fetching Storyblok components:", error);
    return c.json({ error: "Internal server error" } as const, 500);
  }
});

// Get only component names
storyblokComponentsRouter.openapi(getComponentNamesRoute, async (c) => {
  try {
    const names = await db
      .select({ name: storyblokComponents.name })
      .from(storyblokComponents);
    return c.json(names, 200);
  } catch (error) {
    logger.error("Error fetching Storyblok component names:", error);
    return c.json({ error: "Internal server error" } as const, 500);
  }
});

// Get component by name
storyblokComponentsRouter.openapi(getComponentByNameRoute, async (c) => {
  try {
    const name = c.req.param("name");
    const [component] = await db
      .select()
      .from(storyblokComponents)
      .where(eq(storyblokComponents.name, name))
      .limit(1);

    if (!component) {
      return c.json({ error: "Component not found" } as const, 404);
    }

    return c.json(serializeRecord(component), 200);
  } catch (error) {
    logger.error("Error fetching Storyblok component:", error);
    return c.json({ error: "Internal server error" } as const, 500);
  }
});

export { storyblokComponentsRouter };
