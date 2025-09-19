"use client";

import { useMemo, useState, useEffect } from "react";
import { useAgentStream } from "@/hooks/useAgentStream";
import { AgentSelector } from "@/components/agent/agent-selector";
import { mapProgressTypeToStatus } from "@/lib/progress-status";
import { ChatComposer } from "@/components/ai-chat/presentational/ChatComposer";
import { ComposerActions } from "@/components/ai-chat/presentational/ComposerActions";
import { InlineNotice } from "@/components/ai-chat/presentational/InlineNotice";
import { ChatConversation } from "@/components/ai-chat/presentational/ChatConversation";
import { ExecutionTimeline } from "@/components/ai-chat/presentational/ExecutionTimeline";
import { ToolTimeline } from "@/components/ai-chat/presentational/ToolTimeline";
import { RunAccordion } from "@/components/ai-chat/presentational/RunAccordion";
import { useSession } from "next-auth/react";
import { ensureAllowedAgent } from "@/lib/entitlements";
import { useAvailableAgents } from "@/hooks/useAvailableAgents";

export default function ChatContainer() {
  const [prompt, setPrompt] = useState("");
  const { chat, events, isWorking, error, start, stop, traces } = useAgentStream();
  const [agentType, setAgentType] = useState<string>("general");
  const { data: session } = useSession();
  const availableAgents = useAvailableAgents();

  // Keep agent selection safe if entitlements change after login
  useEffect(() => {
    const safe = ensureAllowedAgent(session ?? null, agentType, availableAgents);
    if (safe !== agentType) setAgentType(safe);
  }, [session, availableAgents, agentType]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isWorking) return;
    const safe = ensureAllowedAgent(session ?? null, agentType, availableAgents);
    await start(prompt.trim(), safe);
  };

  const hasError = events.some((e) => e.type === "error");

  // Determine where to attach the live inline area during streaming
  const attachIndex = useMemo(() => {
    if (!isWorking) return undefined;
    const lastIdx = chat.length - 1;
    if (lastIdx >= 0 && (chat as any)[lastIdx].role === "assistant") return lastIdx;
    for (let i = chat.length - 1; i >= 0; i--) {
      if ((chat as any)[i].role === "user") return i;
    }
    return undefined;
  }, [isWorking, chat]);

  // Map past run accordions to the specific assistant message produced in that run
  const areasByIndex = useMemo(() => {
    const runTraces = Array.isArray(traces) ? traces : [];
    return runTraces.reduce(
      (acc: Record<number, React.ReactNode>, t) => {
        const assistantIndex: number | undefined = (t as any).assistantIndex;
        let attachIdx: number | undefined = typeof assistantIndex === "number" ? assistantIndex : undefined;
        if (typeof attachIdx !== "number") {
          // Fallback: find first assistant after the user message index
          for (let i = t.userIndex; i < chat.length; i++) {
            if ((chat as any)[i]?.role === "assistant") {
              attachIdx = i;
              break;
            }
          }
        }
        if (typeof attachIdx === "number") {
          acc[attachIdx] = (
            <RunAccordion durationMs={t.durationMs}>
              <ExecutionTimeline
                events={t.events.filter((e: any) => e.type !== "tool_execution" && e.type !== "tool_response") as any}
                mapTypeToStatus={mapProgressTypeToStatus as any}
                onCopy={(content) => navigator.clipboard.writeText(content)}
              />
              <div className="mt-2" />
              <ToolTimeline
                events={t.events.filter((e: any) => e.type === "tool_execution" || e.type === "tool_response") as any}
              />
            </RunAccordion>
          );
        }
        return acc;
      },
      {} as Record<number, React.ReactNode>
    );
  }, [chat, traces]);

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Kinship AI</h1>
        <p className="text-muted-foreground">Ask the AI assistant to help you.</p>
      </div>

      <div className="grid gap-3">
        <div className="group">
          <ChatComposer
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            overlay={
              <AgentSelector
                value={agentType as any}
                onChange={(v) => setAgentType(v)}
                className="opacity-60 hover:opacity-100"
              />
            }
          />
          <ComposerActions isWorking={isWorking} canSubmit={!!prompt.trim()} onSubmit={handleSubmit} onStop={stop} />
        </div>
      </div>

      <div className="mt-8 min-h-[80px]">
        {error && <div className="text-destructive">{error}</div>}
        {chat.length > 0 && (
          <ChatConversation
            chat={chat as any}
            showInlineForLastUser={false}
            inlineAttachToIndex={attachIndex}
            inlineAreasByIndex={areasByIndex}
            inlineArea={
              <>
                {hasError && (
                  <InlineNotice
                    variant="error"
                    message={`The "${agentType}" agent is unavailable. Switch back to General?`}
                    actionLabel="Use General"
                    onAction={() => setAgentType("general")}
                    className="mt-3 mb-2"
                  />
                )}
                {isWorking
                  ? events.length > 0 && (
                      <>
                        <ExecutionTimeline
                          events={
                            events.filter((e) => e.type !== "tool_execution" && e.type !== "tool_response") as any
                          }
                          mapTypeToStatus={mapProgressTypeToStatus as any}
                          onCopy={(content) => navigator.clipboard.writeText(content)}
                        />
                        <ToolTimeline
                          events={
                            events.filter((e) => e.type === "tool_execution" || e.type === "tool_response") as any
                          }
                        />
                      </>
                    )
                  : null}
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
