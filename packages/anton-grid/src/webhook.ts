import { Hono } from "hono";
import { Webhooks } from "@octokit/webhooks";
import { githubApp } from "./github";
import { requestService } from "./request.service";

// Define the context type for our webhook
type WebhookContext = {
  Variables: {
    webhookBody: string;
  };
};

const webhook = new Hono<WebhookContext>();
const webhooks = new Webhooks({
  secret: githubApp.webhookSecret,
});

// Handle installation events
webhooks.on("installation.created", async ({ payload }) => {
  console.log(`App installed on ${payload.installation.account.login}`);
});

webhooks.on("installation.deleted", async ({ payload }) => {
  console.log(`App uninstalled from ${payload.installation.account.login}`);
});

// Handle issue comments (for anton-grid commands)
webhooks.on("issue_comment.created", async ({ payload }) => {
  if (!payload.installation) return;
  // Ignore bot comments to avoid infinite loops
  if (payload.comment.user.type === "Bot" || payload.sender.type === "Bot") {
    return;
  }
  if (!payload.comment.body.includes("@anton-grid")) return;

  const octokit = githubApp.getInstallationOctokit(payload.installation.id);
  const command = payload.comment.body.toLowerCase();

  if (command.includes("@anton-grid help")) {
    await octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
      body: `Here will be the list of available commands, for now just stub:
- \`@anton-grid review\` - Request a code review
- \`@anton-grid check\` - Run automated checks
- \`@anton-grid help\` - Show this help message`,
    });
  }

  if (command.includes("@anton-grid test-signal")) {
    await requestService.request("/api/agent/signals", {
      method: "POST",
      body: JSON.stringify({
        source: "habit",
        type: "missed",
        payload: {
          habitId: "abc123",
          habitName: "Running",
          missedAt: 1235,
        },
        metadata: {
          userId: "xyz789",
        },
      }),
    });
  }

  if (
    command.includes("@anton-grid generate descirpiton") ||
    command.includes("@anton-grid generate description")
  ) {
    if (!payload.issue.pull_request) return;

    const pullNumber = payload.issue.number;
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;

    const commits = await octokit.paginate(octokit.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number: pullNumber,
    });

    const commitLines = commits.map((c) => `- ${c.commit.message.split("\n")[0]}`);

    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: pullNumber,
    });

    const fileLines = files.slice(0, 10).map((f) => `- ${f.filename}`);

    const body = [
      "### Summary of Commits",
      ...commitLines,
      "",
      "### Changed Files",
      ...fileLines,
    ].join("\n");

    await octokit.rest.pulls.update({
      owner,
      repo,
      pull_number: pullNumber,
      body,
    });

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: "PR description generated.",
    });
  }

  return;
});

// Hono.js middleware for webhook verification
const verifyWebhook = async (c: any, next: () => Promise<void>) => {
  const signature = c.req.header("x-hub-signature-256");
  if (!signature) {
    return c.text("No signature", 401);
  }

  const body = await c.req.text();
  try {
    await webhooks.verify(body, signature);
    // Store the body for later use
    c.set("webhookBody", body);
    await next();
  } catch (error) {
    console.error("Webhook verification error:", error);
    return c.text("Invalid signature", 401);
  }
};

// Hono.js route handler
webhook.post("/", verifyWebhook, async (c) => {
  const event = c.req.header("x-github-event");
  const id = c.req.header("x-github-delivery");
  const body = c.get("webhookBody") as string;

  if (event && id) {
    try {
      await webhooks.receive({
        id,
        name: event as any,
        payload: JSON.parse(body),
      });
      return c.text("OK");
    } catch (error) {
      console.error("Webhook processing error:", error);
      return c.text("Error processing webhook", 500);
    }
  }

  return c.text("Invalid event", 400);
});

export default webhook;
