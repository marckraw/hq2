const createWebhookTesterService = () => {
  type WebhookEntry = {
    id: string;
    timestamp: string;
    headers: Record<string, string>;
    payload: any;
  };

  const webhooks: WebhookEntry[] = [];

  const recordWebhook = ({
    headers,
    payload,
  }: {
    headers: Record<string, string>;
    payload: any;
  }) => {
    const entry: WebhookEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      headers,
      payload,
    };
    webhooks.unshift(entry);
    if (webhooks.length > 50) {
      webhooks.pop();
    }
    return entry;
  };

  const getWebhooks = () => webhooks;

  const clear = () => {
    webhooks.length = 0;
  };

  return {
    recordWebhook,
    getWebhooks,
    clear,
  };
};

export const webhookTesterService = createWebhookTesterService();
export type WebhookTesterService = ReturnType<typeof createWebhookTesterService>;

