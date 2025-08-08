import { useEffect, useRef, useState } from "react";

type HQStreamEvent = {
  type: string;
  content: string;
  metadata?: Record<string, any>;
};

type Options = {
  onMessage?: (event: HQStreamEvent) => void;
  onError?: (error: unknown) => void;
};

const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 3;

export const useGridStream = (options?: Options) => {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isInitializedRef = useRef(false);

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      console.log(
        "[HQStream Debug] Closing EventSource, readyState:",
        eventSourceRef.current.readyState
      );
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const initializeStream = async (isCancelled: boolean) => {
    if (isInitializedRef.current) {
      console.log("[HQStream Debug] Stream already initialized");
      return;
    }

    try {
      console.log("[HQStream Debug] Starting stream initialization");
      // Step 1: Get streamToken
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/streams/init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );

      console.log("[HQStream Debug] Init response status:", res.status);

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to initialize stream" }));
        console.log("[HQStream Debug] Init response error:", error);
        throw new Error(error.error || "Failed to initialize HQ stream.");
      }

      const data = await res.json();
      console.log("[HQStream Debug] Init response data:", data);
      const streamToken = data.streamToken;

      console.log("[HQStream Debug] Stream token:", streamToken);

      if (!streamToken) {
        throw new Error("No streamToken received.");
      }

      // Step 2: Open SSE connection
      closeEventSource(); // Close any existing connection

      const streamUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/streams/horizon?streamToken=${streamToken}`;
      console.log("[HQStream Debug] Creating EventSource with URL:", streamUrl);

      const evtSource = new EventSource(streamUrl);
      console.log(
        "[HQStream Debug] EventSource created, readyState:",
        evtSource.readyState
      );
      eventSourceRef.current = evtSource;

      evtSource.onopen = () => {
        console.log(
          "[HQStream Debug] EventSource opened, readyState:",
          evtSource.readyState
        );
        if (isCancelled) {
          console.log("[HQStream Debug] Connection cancelled during open");
          return;
        }
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        isInitializedRef.current = true;
        console.log("[HQStream] Connected to Grid.");
      };

      evtSource.onmessage = (event) => {
        console.log("[HQStream Debug] Message received:", {
          data: event.data,
          lastEventId: event.lastEventId,
          origin: event.origin,
        });
        if (isCancelled) return;

        try {
          const parsed: HQStreamEvent = JSON.parse(event.data);

          console.log("This is parsed stuff: ");
          console.log(parsed);
          options?.onMessage?.(parsed);
        } catch (error) {
          console.error("[HQStream Debug] Failed to parse message:", error);
          console.log("[HQStream Debug] Raw message data:", event.data);
        }
      };

      evtSource.onerror = (error) => {
        console.log("[HQStream Debug] Stream error:", {
          error,
          readyState: evtSource.readyState,
          url: evtSource.url,
        });
        setConnected(false);
        closeEventSource();
        isInitializedRef.current = false;
        options?.onError?.(error);

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `[HQStream Debug] Attempting reconnect ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isCancelled) {
              initializeStream(isCancelled);
            }
          }, RECONNECT_DELAY);
        }
      };
    } catch (error) {
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("[HQStream Debug] Initialization error:", error);
      console.log("[HQStream Debug] Error details:", {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      if (isCancelled) return;
      console.error("[HQStream] Failed to initialize stream:", error);
      options?.onError?.(error);
      isInitializedRef.current = false;
    }
  };

  useEffect(() => {
    console.log("[HQStream Debug] Setting up stream effect");
    let isCancelled = false;

    initializeStream(isCancelled);

    return () => {
      console.log("[HQStream Debug] Cleaning up stream effect");
      isCancelled = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      closeEventSource();
      isInitializedRef.current = false;
      console.log("[HQStream] Stream closed.");
    };
  }, []);

  return { connected };
};
