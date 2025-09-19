import { useRef, useState } from "react";

export type ProgressMessage = {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type InitRequest = {
  messages: { role: "user" | "assistant"; content: string }[];
  attachments?: { id?: string; name?: string; type?: string; dataUrl?: string }[];
  conversationId?: number | null;
  autonomousMode?: boolean;
  agentType?: string;
  contextData?: Record<string, unknown>;
};

export const useAgentStream = () => {
  const [events, setEvents] = useState<ProgressMessage[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamTokenRef = useRef<string | null>(null);
  const conversationIdRef = useRef<number | null>(null);
  const runStartAtRef = useRef<number | null>(null);
  const userIndexRef = useRef<number | null>(null);
  const assistantIndexRef = useRef<number | null>(null);
  const [traces, setTraces] = useState<
    Array<{
      events: ProgressMessage[];
      durationMs: number;
      userIndex: number;
      assistantIndex?: number;
    }>
  >([]);

  const start = async (userText: string, agentType: string = "general") => {
    setError(null);
    setIsWorking(true);
    // Append user message to persistent chat history
    setChat((prev) => {
      userIndexRef.current = prev.length;
      return [...prev, { role: "user", content: userText }];
    });
    // Reset inline events for this new run
    setEvents([]);
    runStartAtRef.current = Date.now();
    assistantIndexRef.current = null;

    try {
      const requestBody: InitRequest = {
        messages: [{ role: "user", content: userText }],
        autonomousMode: true,
        agentType,
        contextData: {},
        conversationId: conversationIdRef.current ?? undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to initialize agent stream");
      }

      const { streamToken, conversationId } = await res.json();
      if (typeof conversationId === "number") {
        conversationIdRef.current = conversationId;
      }
      streamTokenRef.current = streamToken;

      const evt = new EventSource(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/stream?streamToken=${streamToken}`);
      eventSourceRef.current = evt;

      evt.onmessage = (event) => {
        try {
          const payload: ProgressMessage = JSON.parse(event.data);
          // Keep raw events for potential debugging/telemetry
          setEvents((prev) => [...prev, payload]);

          // Build/append assistant message progressively
          if (payload.type === "llm_response") {
            setChat((prev) => {
              const last = prev[prev.length - 1];
              if (!last || last.role !== "assistant") {
                // first assistant token for this run
                assistantIndexRef.current = prev.length;
                return [...prev, { role: "assistant", content: payload.content || "" }];
              }
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: (last.content || "") + (payload.content || ""),
              };
              if (assistantIndexRef.current == null) {
                assistantIndexRef.current = updated.length - 1;
              }
              return updated;
            });
          }
          if (payload.type === "finished") {
            const finishedAt = Date.now();
            const durationMs = runStartAtRef.current ? finishedAt - runStartAtRef.current : 0;
            // capture final snapshot in setEvents to avoid race
            setEvents((prev) => {
              const finalEvents = [...prev];
              // some streams may not push explicit finished as a payload earlier in prev; keep as-is
              setTraces((tr) => {
                const idx =
                  typeof userIndexRef.current === "number" ? userIndexRef.current : Math.max(0, chat.length - 1);
                const aIdx = assistantIndexRef.current == null ? undefined : assistantIndexRef.current;
                return [...tr, { events: finalEvents, durationMs, userIndex: idx, assistantIndex: aIdx }];
              });
              return finalEvents;
            });

            evt.close();
            eventSourceRef.current = null;
            streamTokenRef.current = null;
            setIsWorking(false);
            runStartAtRef.current = null;
            userIndexRef.current = null;
            assistantIndexRef.current = null;
          }
        } catch (e) {
          console.warn("Failed to parse event:", e);
        }
      };

      evt.onerror = (e) => {
        console.error("SSE error", e);
        setError("Connection error");
        setIsWorking(false);
        evt.close();
        eventSourceRef.current = null;
        streamTokenRef.current = null;
      };
    } catch (e) {
      setIsWorking(false);
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const stop = async () => {
    if (eventSourceRef.current && streamTokenRef.current) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/stop-stream?streamToken=${streamTokenRef.current}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        });
      } catch (e) {
        console.warn("Failed to stop stream", e);
      } finally {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        streamTokenRef.current = null;
        setIsWorking(false);
      }
    }
  };

  return { chat, events, isWorking, error, start, stop, traces };
};
