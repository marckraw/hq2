import { OpenAPIHono } from "@hono/zod-openapi";
import { createPromptSnippetService } from "../../../services/atoms/PromptSnippetService/prompt-snippet.service";
import {
  createSnippetRoute,
  deleteSnippetRoute,
  getSnippetsRoute,
  updateSnippetRoute,
} from "./snippets.routes";

export const snippetsRouter = new OpenAPIHono();
const snippetService = createPromptSnippetService();

snippetsRouter.openapi(getSnippetsRoute, async (c) => {
  const snippets = await snippetService.getAll();
  return c.json({ success: true, data: snippets } as const, 200);
});

// @ts-expect-error - OpenAPI type inference issue with response union types
snippetsRouter.openapi(createSnippetRoute, async (c) => {
  const data = c.req.valid("json");
  const snippet = await snippetService.createSnippet(data);
  return c.json({ success: true, data: snippet } as const, 200);
});

snippetsRouter.openapi(updateSnippetRoute, async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const snippet = await snippetService.updateSnippet(id, data);
  
  if (!snippet) {
    return c.json({
      success: false,
      error: {
        message: "Snippet not found",
        code: "NOT_FOUND",
      },
    } as const, 404);
  }
  
  return c.json({ success: true, data: snippet } as const, 200);
});

snippetsRouter.openapi(deleteSnippetRoute, async (c) => {
  const id = c.req.param("id");
  const deleted = await snippetService.deleteSnippet(id);
  
  if (!deleted) {
    return c.json({
      success: false,
      error: {
        message: "Snippet not found",
        code: "NOT_FOUND",
      },
    } as const, 404);
  }
  
  return c.json({ success: true, data: deleted } as const, 200);
});
