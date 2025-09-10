"use client";

import React from "react";
import { ChatMessage } from "@/components/ai-chat/primitives/ChatMessage/ChatMessage";
import { motion } from "framer-motion";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  if (!content) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ml-11">
      <ChatMessage role="assistant" content={content} showAvatar={false} status="sending" />
    </motion.div>
  );
}
