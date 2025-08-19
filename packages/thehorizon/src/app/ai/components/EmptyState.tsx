"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { ChatInputRef } from "@/components/ai-chat/primitives/ChatInput/ChatInput";

interface EmptyStateProps {
  chatInputRef: React.RefObject<ChatInputRef>;
}

const SUGGESTIONS = [
  "Explain quantum computing",
  "Write a Python script",
  "Analyze this data",
  "Help with creative writing"
];

export function EmptyState({ chatInputRef }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-lg font-medium mb-2">How can I help you today?</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        Just type your question below and I'll help you find the answer.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map(suggestion => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => chatInputRef.current?.setValue(suggestion)}
            className="text-xs"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}