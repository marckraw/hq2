"use client";

import React from "react";
import { MessageActions } from "@/components/ai-chat/disclosure/MessageActions";

export interface ChatMessageItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatConversationProps {
  chat: ChatMessageItem[];
  showInlineForLastUser?: boolean;
  inlineAttachToIndex?: number;
  inlineAreasByIndex?: Record<number, React.ReactNode>;
  inlineArea?: React.ReactNode;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  chat,
  showInlineForLastUser = false,
  inlineAttachToIndex,
  inlineAreasByIndex,
  inlineArea,
}) => {
  if (!chat?.length) return null;

  return (
    <div className="grid gap-3">
      {chat.map((m, idx) => {
        const isLastUserRow = m.role === "user" && idx === chat.length - 1;
        const attachByIndex = typeof inlineAttachToIndex === "number" ? idx === inlineAttachToIndex : false;
        const shouldShowInline = (isLastUserRow && showInlineForLastUser) || attachByIndex;
        const extraArea = inlineAreasByIndex?.[idx];
        return (
          <div key={`chat-${idx}`} className="rounded-lg border p-4 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{m.role === "user" ? "You" : "Assistant"}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageActions
                  visible
                  onCopy={() => navigator.clipboard.writeText(m.content)}
                  showActions={{ copy: true, details: true }}
                  animation="slide"
                  size="sm"
                />
              </div>
            </div>

            {shouldShowInline && inlineArea}
            {extraArea}
          </div>
        );
      })}
    </div>
  );
};

export default ChatConversation;
