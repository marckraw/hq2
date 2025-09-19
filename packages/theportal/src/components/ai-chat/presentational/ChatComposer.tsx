"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ChatComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  overlay?: React.ReactNode;
  className?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your request and press Enter...",
  overlay,
  className,
}) => {
  return (
    <div className={cn("group", className)}>
      <div className="relative">
        {overlay && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {overlay}
          </div>
        )}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default ChatComposer;
