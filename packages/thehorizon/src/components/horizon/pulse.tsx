"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStream } from "@/providers/stream-provider";

type HQStreamEvent = {
  type: string;
  content: string;
  metadata?: Record<string, any>;
};

export function Pulse() {
  const [pulseData, setPulseData] = useState<HQStreamEvent[]>([]);
  const { connected, addMessageListener } = useStream();

  useEffect(() => {
    const removeListener = addMessageListener((event) => {
      console.log("This is pulse: ");
      console.log(event);
      setPulseData((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 items
    });

    return () => removeListener();
  }, [addMessageListener]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse"></div>
            <div
              className={`h-3 w-3 rounded-full ${
                connected ? "bg-primary" : "bg-muted"
              }`}
            ></div>
          </div>
          The Pulse
          {connected && (
            <span className="text-sm text-muted-foreground ml-2">
              (Connected)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {pulseData.map((event, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{event.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{event.content}</p>
                {event.metadata && (
                  <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap overflow-hidden">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            {pulseData.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {connected
                  ? "Waiting for stream data..."
                  : "Connecting to stream..."}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
