import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { fitnessService } from "../../../services/atoms/FitnessService/fitness.service";

export const tagsRouter = new OpenAPIHono();

const TagInput = z.object({ name: z.string().min(1) });

tagsRouter.get("/", async (c) => {
  const list = await fitnessService.listTags();
  return c.json({ success: true, data: list });
});

tagsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { name } = TagInput.parse(body);
  const tag = await fitnessService.createTag(name);
  return c.json({ success: true, data: tag });
});

export default tagsRouter;
