import React from "react";
import { EXAMPLE_PROMPTS } from "../ChatArea.utils";

interface WelcomeScreenProps {
  onExampleClick: (prompt: string) => void;
}

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="text-center pt-16 grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXAMPLE_PROMPTS.map((prompt, index) => (
          <div
            key={index}
            onClick={() => onExampleClick(prompt.prompt)}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors duration-200 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{prompt.icon}</span>
              <div>
                <p className="font-semibold text-sm">{prompt.title}</p>
                <p className="text-xs text-muted-foreground">
                  {prompt.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
