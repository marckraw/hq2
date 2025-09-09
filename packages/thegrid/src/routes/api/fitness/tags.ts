import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { fitnessService } from "../../../services/atoms/FitnessService/fitness.service";
import { db } from "../../../db";
import { tags as tagsTable } from "../../../db/schema";
import { ilike } from "drizzle-orm";

export const tagsRouter = new OpenAPIHono();

const TagInput = z.object({ name: z.string().min(1) });

tagsRouter.get("/", async (c) => {
  const list = await fitnessService.listTags();
  return c.json({ success: true, data: list });
});

tagsRouter.get("/search", async (c) => {
  const q = (c.req.query("query") || "").trim();
  if (!q) {
    const list = await fitnessService.listTags();
    return c.json({ success: true, data: list });
  }
  const rows = await db
    .select()
    .from(tagsTable)
    .where(ilike(tagsTable.name, `%${q}%`));
  return c.json({ success: true, data: rows });
});

tagsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { name } = TagInput.parse(body);
  const tag = await fitnessService.createTag(name);
  return c.json({ success: true, data: tag });
});

export default tagsRouter;
