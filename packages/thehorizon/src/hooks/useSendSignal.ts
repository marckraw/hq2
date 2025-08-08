import { useCallback } from "react";

interface SendSignalOptions {
  source: string;
  type: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
}

export const useSendSignal = () => {
  const sendSignal = useCallback(async (options: SendSignalOptions) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/signals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
          body: JSON.stringify(options),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to send signal: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("[useSendSignal] Error sending signal:", error);
      throw error;
    }
  }, []);

  return { sendSignal };
};
