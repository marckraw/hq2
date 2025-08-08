import React from "react";
import { useAtomValue } from "jotai";
import { agentTypeAtom } from "../../_state/chat/atoms/models";

export function LoadingMessage() {
  const agentType = useAtomValue(agentTypeAtom);
  return (
    <div className="mr-auto max-w-[80%] animate-in slide-in-from-left duration-300">
      <div className="bg-muted/50 rounded-lg px-4 py-3 transition-all duration-200 hover:scale-[1.02]">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
          <span className="text-sm text-muted-foreground animate-typing-dots">
            {agentType === "chat" ? "Thinking..." : "Starting agent..."}
          </span>
        </div>
      </div>
    </div>
  );
}
