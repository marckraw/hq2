import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { config } from "../../config.env";
import aiRouter from "./ai/ai";
import { agentRouter } from "./agent/agent";
import { approvalsRouter } from "./approvals/approvals";
import { changelogsRouter } from "./changelogs/changelogs";
import { chatRouter } from "./chat/chat";
import { figmaRouter } from "./figma/figma";
import { filesRouter } from "./files/files";
import { notificationsRouter } from "./notifications/notifications";
import { pipelinesRouter } from "./pipelines/pipelines";
import { settingsRouter } from "./settings/settings";
import { signalsRouter } from "./signals/signals";
import { snippetsRouter } from "./snippets/snippets";
// SSE endpoints moved to agent router
import { storyblokComponentsRouter } from "./storyblok-components/storyblok-components";
import { storyblokRouter } from "./storyblok/storyblok";
import { streamsRouter } from "./streams/streams";
import { webhookTesterRouter } from "./webhook-tester";
import { triggersRouter } from "./triggers/triggers";

import audioRouter from "./audio/audio";
import elevenlabsRouter from "./elevenlabs/elevenlabs";
import fitnessRouter from "./fitness/fitness";

// Main API Router
const apiRouter = new OpenAPIHono();

// Register security scheme
apiRouter.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Enter the X_API_KEY value as the bearer token",
});

const token = config.X_API_KEY; // Token for authorization get from .env

// AI endpoints protection
apiRouter.use("/ai/init", bearerAuth({ token }));
apiRouter.use("/ai/stop", bearerAuth({ token }));
apiRouter.use("/ai/conversations", bearerAuth({ token }));
apiRouter.use("/ai/conversation/*", bearerAuth({ token }));
// NOTE: /ai/stream is NOT protected by bearer auth since EventSource can't send headers - session token validates instead

apiRouter.use("/agent/init", bearerAuth({ token })); // protect agent init
apiRouter.use("/agent/available-agents", bearerAuth({ token })); // protect agent available agents
apiRouter.use("/agent/stop-stream", bearerAuth({ token })); // protect agent stop stream
// NOTE: /agent/stream is NOT protected by bearer auth since EventSource can't send headers - session token validates instead

apiRouter.use("/chat/init", bearerAuth({ token })); // protect chat init
apiRouter.use("/chat/conversations", bearerAuth({ token })); // protect chat conversations
apiRouter.use("/chat/messages", bearerAuth({ token })); // protect chat messages

// NOTE: /chat/stream is NOT protected by bearer auth since EventSource can't send headers - session token validates instead
apiRouter.use("/signals/*", bearerAuth({ token })); // making sure all routes /api/* are protected by the token
apiRouter.use("/notifications/*", bearerAuth({ token })); // protect notifications routes with the same token
apiRouter.use("/memories/*", bearerAuth({ token })); // protect memories routes with the same token
apiRouter.use("/semantic-search/*", bearerAuth({ token }));
apiRouter.use("/changelogs/*", bearerAuth({ token }));
apiRouter.use("/pipelines/*", bearerAuth({ token })); // protect pipelines routes with the same token
apiRouter.use("/approvals/*", bearerAuth({ token })); // protect approvals routes with the same token
apiRouter.use("/figma/*", bearerAuth({ token })); // protect figma routes with the same token
apiRouter.use("/files/*", bearerAuth({ token })); // protect files routes with the same token
apiRouter.use("/storyblok-components/*", bearerAuth({ token })); // protect storyblok routes with the same token
apiRouter.use("/storyblok/*", bearerAuth({ token })); // protect storyblok API routes with the same token
apiRouter.use("/settings/*", bearerAuth({ token })); // protect settings routes with the same token
apiRouter.use("/audio/*", bearerAuth({ token }));
apiRouter.use("/elevenlabs/*", bearerAuth({ token }));
apiRouter.use("/snippets/*", bearerAuth({ token }));
apiRouter.use("/fitness/*", bearerAuth({ token }));

apiRouter.route("/streams", streamsRouter);
apiRouter.route("/ai", aiRouter);
apiRouter.route("/agent", agentRouter);
apiRouter.route("/chat", chatRouter);

apiRouter.route("/signals", signalsRouter);
apiRouter.route("/notifications", notificationsRouter);
apiRouter.route("/changelogs", changelogsRouter);
apiRouter.route("/pipelines", pipelinesRouter);
apiRouter.route("/approvals", approvalsRouter);
apiRouter.route("/figma", figmaRouter);
apiRouter.route("/files", filesRouter);
apiRouter.route("/storyblok-components", storyblokComponentsRouter);
apiRouter.route("/storyblok", storyblokRouter);
apiRouter.route("/settings", settingsRouter);
apiRouter.route("/snippets", snippetsRouter);
// SSE router removed - endpoints moved to agent router
apiRouter.route("/audio", audioRouter);
apiRouter.route("/elevenlabs", elevenlabsRouter);
apiRouter.route("/webhook-tester", webhookTesterRouter);
apiRouter.route("/fitness", fitnessRouter);

// triggers
apiRouter.route("/triggers", triggersRouter);

// OpenAPI documentation endpoint
apiRouter.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "HQ API",
    description: "The Grid API for HQ system",
  },
  servers: [
    {
      url: "http://localhost:3333/api",
      description: "Development server",
    },
    {
      url: "https://api.ef.design/api",
      description: "Production server",
    },
  ],
});

// OpenAPI JSON spec endpoint
apiRouter.get("/openapi.json", (c) => {
  return c.json(
    apiRouter.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "HQ API",
        description: "The Grid API for HQ system",
      },
      servers: [
        {
          url: "http://localhost:3333/api",
          description: "Development server",
        },
        {
          url: "https://api.ef.design/api",
          description: "Production server",
        },
      ],
    })
  );
});

// Use the middleware to serve Swagger UI at /ui
apiRouter.get("/ui", swaggerUI({ url: "/api/doc" }));

export default apiRouter;
