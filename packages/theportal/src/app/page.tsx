"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAgentStream } from "@/hooks/useAgentStream";
import { MessageActions } from "@/components/ai-chat/disclosure/MessageActions";
import { ExecutionStep } from "@/components/ai-chat/presentational/ExecutionStep/ExecutionStep";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const { chat, events, isWorking, error, start, stop } = useAgentStream();

  const handleSubmit = async () => {
    if (!prompt.trim() || isWorking) return;
    await start(prompt.trim());
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold">EF Portal</h1>
          <p className="text-muted-foreground">Ask the AI assistant to help you.</p>
        </div>

        <div className="grid gap-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your request and press Enter..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="min-h-[120px]"
          />
          <div className="flex items-center gap-2 justify-end">
            {isWorking ? (
              <Button variant="destructive" onClick={stop}>
                Stop
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!prompt.trim()}>
                Submit
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 min-h-[80px]">
          {error && <div className="text-destructive">{error}</div>}
          {chat.length > 0 && (
            <div className="grid gap-3">
              {chat.map((m, idx) => {
                const isLastUser = m.role === "user" && idx === chat.length - 1 && isWorking;
                return (
                  <div key={`chat-${idx}`} className="rounded-lg border p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          {m.role === "user" ? "You" : "Assistant"}
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageActions
                          visible
                          onCopy={() => navigator.clipboard.writeText(m.content)}
                          showActions={{ copy: true, details: true }}
                          animation="slide"
                          size="sm"
                        />
                      </div>
                    </div>

                    {isLastUser && events.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {events.map((e, i) =>
                          e.type !== "llm_response" && e.type !== "user_message" ? (
                            <ExecutionStep
                              key={`evt-${i}`}
                              status={e.type === "thinking" ? "running" : e.type === "tool_execution" ? "info" : "info"}
                              title={e.type}
                              content={e.content}
                              compact
                              rightActions={
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MessageActions
                                    visible
                                    onCopy={() => navigator.clipboard.writeText(e.content)}
                                    showActions={{ copy: true }}
                                    animation="fade"
                                    size="sm"
                                  />
                                </div>
                              }
                            />
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
