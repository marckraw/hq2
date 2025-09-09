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

  const start = async (userText: string) => {
    setError(null);
    setIsWorking(true);
    // Append user message to persistent chat history
    setChat((prev) => [...prev, { role: "user", content: userText }]);
    // Reset inline events for this new run
    setEvents([]);

    try {
      const requestBody: InitRequest = {
        messages: [{ role: "user", content: userText }],
        autonomousMode: true,
        agentType: "general",
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
                return [...prev, { role: "assistant", content: payload.content || "" }];
              }
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: (last.content || "") + (payload.content || ""),
              };
              return updated;
            });
          }
          if (payload.type === "finished") {
            evt.close();
            eventSourceRef.current = null;
            streamTokenRef.current = null;
            setIsWorking(false);
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

  return { chat, events, isWorking, error, start, stop };
};
