"use client";

import { useWebhooks, useClearWebhooks } from "../_hooks/useWebhooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonViewer } from "@/components/ui/json-viewer";

export default function WebhookTester() {
  const { data: webhooks, isLoading, error } = useWebhooks();
  const clear = useClearWebhooks();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-destructive">Error loading webhooks</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Incoming Webhooks</h2>
        <Button variant="destructive" onClick={() => clear.mutate()}>
          Clear
        </Button>
      </div>
      {webhooks && webhooks.length > 0 ? (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <Card key={wh.id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {new Date(wh.timestamp).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={wh} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No webhooks received yet.</p>
      )}
    </div>
  );
}

