"use client";

import React, { createContext, useContext, useCallback, useRef } from "react";
import { useGridStream } from "@/hooks/useGridStream";

type HQStreamEvent = {
  type: string;
  content: string;
  metadata?: Record<string, any>;
};

type StreamContextType = {
  connected: boolean;
  addMessageListener: (listener: (event: HQStreamEvent) => void) => () => void;
};

const StreamContext = createContext<StreamContextType | null>(null);

export function StreamProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Set<(event: HQStreamEvent) => void>>(new Set());

  const handleMessage = useCallback((event: HQStreamEvent) => {
    listenersRef.current.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in stream listener:", error);
      }
    });
  }, []);

  const { connected } = useGridStream({
    onMessage: handleMessage,
    onError: (error) => {
      console.error("Stream error:", error);
    },
  });

  const addMessageListener = useCallback(
    (listener: (event: HQStreamEvent) => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    []
  );

  return (
    <StreamContext.Provider value={{ connected, addMessageListener }}>
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStream must be used within a StreamProvider");
  }
  return context;
}
