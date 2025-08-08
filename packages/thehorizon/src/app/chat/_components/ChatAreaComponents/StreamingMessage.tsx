import React from "react";
import { RenderMarkdown } from "@/components/RenderMarkdown/RenderMarkdown";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="mr-auto max-w-[80%] animate-in slide-in-from-left duration-300">
      <div className="rounded-lg px-4 py-3 bg-muted/50 transition-all duration-200 hover:scale-[1.02]">
        <RenderMarkdown>{content}</RenderMarkdown>
      </div>
    </div>
  );
}
