import { logger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { webhookTesterService } from "../../../services/atoms/WebhookTesterService/webhook-tester.service";
import { recordWebhookRoute, getWebhooksRoute, clearWebhooksRoute } from "./webhook-tester.routes";

export const webhookTesterRouter = new OpenAPIHono();

webhookTesterRouter.openapi(recordWebhookRoute, async (c) => {
  let payload: any = {};
  try {
    payload = await c.req.json();
  } catch (error) {
    logger.error("Error parsing JSON payload:", error);
  }

  const headers = Object.fromEntries(c.req.raw.headers.entries());

  const entry = webhookTesterService.recordWebhook({ headers, payload });

  return c.json({ success: true, data: entry });
});

webhookTesterRouter.openapi(getWebhooksRoute, (c) => {
  return c.json({ success: true, data: webhookTesterService.getWebhooks() });
});

webhookTesterRouter.openapi(clearWebhooksRoute, (c) => {
  webhookTesterService.clear();
  return c.json({ success: true });
});
