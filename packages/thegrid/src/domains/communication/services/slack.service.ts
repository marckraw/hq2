import { logger } from "@/utils/logger";
import { config } from "../../../config.env";
import {
  type SlackNotifyInput as _SlackNotifyInput,
  type SlackNotificationPayload,
  SlackNotifyInputSchema,
  SlackNotificationPayloadSchema,
} from "../../../schemas/services.schemas";

export const createSlackService = () => {
  const SLACK_NOTIFY_URL = `${config.SLACK_BOT_URL}/hq/slack/notify`;

  logger.info("SLACK_NOTIFY_URL", SLACK_NOTIFY_URL);

  const notify = async (message: string) => {
    // Validate input
    const validatedInput = SlackNotifyInputSchema.parse({ message });

    // Create payload with validation
    const payload: SlackNotificationPayload = {
      message: validatedInput.message,
      channel: "#_grid-pipelines",
    };

    // Validate payload
    const validatedPayload = SlackNotificationPayloadSchema.parse(payload);

    try {
      const response = await fetch(SLACK_NOTIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.HQ_SLACK_SECRET}`,
        },
        body: JSON.stringify(validatedPayload),
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error sending slack notification:", error);
      throw error;
    }
  };

  return {
    notify,
  };
};

export const slackService = createSlackService();

// Export the type for the service registry
export type SlackService = typeof slackService;
