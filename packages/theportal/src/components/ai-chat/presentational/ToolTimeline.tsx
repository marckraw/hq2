"use client";

import React from "react";
import ToolCallCard from "./ToolCallCard";

export interface ToolEventItem {
  type: string; // tool_execution | tool_response
  content: string; // JSON or text
  meta?: Record<string, any> | undefined; // may include toolName, elapsedMs, etc
}

export interface ToolTimelineProps {
  events: ToolEventItem[];
}

const tryParse = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const ToolTimeline: React.FC<ToolTimelineProps> = ({ events }) => {
  if (!events?.length) return null;

  // naive pairing: execution -> response based on order
  const pairs: Array<{ exec?: ToolEventItem; resp?: ToolEventItem }> = [];
  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    if (evt.type === "tool_execution") {
      const next = events[i + 1];
      if (next && next.type === "tool_response") {
        pairs.push({ exec: evt, resp: next });
        i++; // skip next as it's paired
      } else {
        pairs.push({ exec: evt });
      }
    } else if (evt.type === "tool_response") {
      pairs.push({ resp: evt });
    }
  }

  return (
    <div className="grid gap-2">
      {pairs.map((p, idx) => {
        const paramsObj = p.exec ? tryParse(p.exec.content) : undefined;
        const resultObj = p.resp ? tryParse(p.resp.content) : undefined;
        const toolNameFromParams = (() => {
          if (typeof paramsObj === "object" && paramsObj) {
            const t = (paramsObj as any).toolName || (paramsObj as any).tool || (paramsObj as any).name;
            return t ? String(t) : undefined;
          }
          return undefined;
        })();
        const toolNameFromResult = (() => {
          if (typeof resultObj === "object" && resultObj) {
            const t = (resultObj as any).toolName || (resultObj as any).tool || (resultObj as any).name;
            return t ? String(t) : undefined;
          }
          return undefined;
        })();
        const toolNameFromMeta = p.exec?.meta?.toolName || p.resp?.meta?.toolName;
        const toolNameFromText = (() => {
          const text = p.exec?.content || "";
          const m1 = /executing\s+([\w.-]+)/i.exec(text);
          if (m1 && m1[1]) return m1[1];
          const m2 = /tool\s+([\w.-]+)\s*(?:started|execution|call)?/i.exec(text);
          if (m2 && m2[1]) return m2[1];
          return undefined;
        })();
        const toolName = toolNameFromParams || toolNameFromResult || toolNameFromMeta || toolNameFromText || "tool";
        const status = p.resp ? ("completed" as const) : ("running" as const);
        const elapsedMs = (p.resp?.meta as any)?.elapsedMs || (p.exec?.meta as any)?.elapsedMs;
        return (
          <ToolCallCard
            key={`tool-${idx}`}
            toolName={toolName}
            parameters={paramsObj}
            result={resultObj}
            status={status}
            elapsedMs={typeof elapsedMs === "number" ? elapsedMs : undefined}
          />
        );
      })}
    </div>
  );
};

export default ToolTimeline;
