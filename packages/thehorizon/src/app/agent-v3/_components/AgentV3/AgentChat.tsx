"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PromptTextarea } from "./PromptTextarea";
import { ResponsePanel } from "./ResponsePanel";
import { TypingIndicator } from "./TypingIndicator";
import { PrecisionOverlay } from "./PrecisionOverlay";
import type { Message } from "./types";
import { AVAILABLE_AGENTS } from "./types";
import { useMockResponses } from "../../_hooks/useMockResponses";
import { useKeyboardShortcuts } from "../../_hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPrecision, setShowPrecision] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("chronos");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateMessage } = useMockResponses();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSlashCommand: () => setShowPrecision(true),
    onCommandK: () => setShowPrecision(true),
    onEscape: () => setShowPrecision(false),
  });

  const handleSubmit = useCallback(
    async (value: string) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: value,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Generate AI response
      const aiMessage = await generateMessage(value, selectedAgent);

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    },
    [selectedAgent, generateMessage]
  );

  const agent =
    AVAILABLE_AGENTS.find((a) => a.id === selectedAgent) || AVAILABLE_AGENTS[0];

  return (
    <div className="relative flex flex-col h-[80vh] min-h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <ResponsePanel key={message.id} message={message} index={index} />
          ))}

          {isTyping && (
            <TypingIndicator agentName={agent.name} agentColor={agent.color} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="relative border-t border-border bg-background/80 backdrop-blur-sm"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
      >
        {/* Agent Badge - shows after first message */}
        {messages.length > 0 && (
          <motion.button
            className={cn(
              "absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-medium",
              "bg-background border border-border",
              "hover:scale-105 transition-transform cursor-pointer",
              "flex items-center gap-1.5"
            )}
            onClick={() => setShowPrecision(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-3 h-3" />
            <span>Answering as {agent.name}</span>
          </motion.button>
        )}

        <PromptTextarea
          onSubmit={handleSubmit}
          isDisabled={isTyping}
          placeholder={
            messages.length === 0
              ? "Ask anything…"
              : "Continue the conversation…"
          }
        />

        {/* Hint for slash command */}
        {messages.length === 0 && (
          <motion.div
            className="absolute bottom-4 right-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded">/</kbd> for
            options
          </motion.div>
        )}
      </motion.div>

      {/* Precision Overlay */}
      <PrecisionOverlay
        visible={showPrecision}
        onClose={() => setShowPrecision(false)}
        selectedAgent={selectedAgent}
        selectedModel={selectedModel}
        onSelectAgent={setSelectedAgent}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
}
