"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

export interface JsonBlockProps {
  value: unknown;
  compact?: boolean;
}

export const JsonBlock: React.FC<JsonBlockProps> = ({ value, compact = false }) => {
  const pretty = useMemo(() => {
    try {
      if (typeof value === "string") {
        return JSON.stringify(JSON.parse(value), null, compact ? 0 : 2);
      }
      return JSON.stringify(value, null, compact ? 0 : 2);
    } catch {
      return typeof value === "string" ? value : JSON.stringify(value, null, compact ? 0 : 2);
    }
  }, [value, compact]);

  return (
    <div className="rounded-md border bg-background/60 p-2 text-xs whitespace-pre-wrap overflow-x-auto">
      <div className="flex items-center justify-end mb-1">
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => navigator.clipboard.writeText(pretty)}>
          Copy
        </Button>
      </div>
      <pre className="text-[11px] leading-relaxed">{pretty}</pre>
    </div>
  );
};

export default JsonBlock;
