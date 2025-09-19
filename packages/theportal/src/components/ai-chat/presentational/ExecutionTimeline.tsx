"use client";

import React from "react";
import { ExecutionStep, type ExecutionStatus } from "./ExecutionStep/ExecutionStep";

export interface ExecutionEventItem {
  type: string;
  content: string;
}

export interface ExecutionTimelineProps {
  events: ExecutionEventItem[];
  mapTypeToStatus: (type: string) => ExecutionStatus;
  onCopy?: (content: string) => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ events, mapTypeToStatus, onCopy }) => {
  if (!events?.length) return null;

  return (
    <div className="mt-3 grid gap-2">
      {events.map((e, i) =>
        e.type !== "llm_response" && e.type !== "user_message" ? (
          <ExecutionStep
            key={`evt-${i}`}
            status={mapTypeToStatus(e.type)}
            title={e.type}
            content={e.content}
            compact
            rightActions={
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {/* inline copy only when handler provided */}
                {onCopy ? (
                  <button
                    onClick={() => onCopy(e.content)}
                    className="text-xs px-2 py-1 rounded border hover:bg-accent hover:text-accent-foreground"
                  >
                    Copy
                  </button>
                ) : null}
              </div>
            }
          />
        ) : null
      )}
    </div>
  );
};

export default ExecutionTimeline;
