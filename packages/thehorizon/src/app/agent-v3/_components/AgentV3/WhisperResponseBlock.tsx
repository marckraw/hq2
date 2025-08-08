"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Message} from "./types";
import { AVAILABLE_AGENTS } from "./types";
import { MoreHorizontal, ChevronRight, Sparkles, Brain } from "lucide-react";

interface WhisperResponseBlockProps {
  message: Message;
  index: number;
  onRevealClick?: (messageId: string) => void;
  onOrchestrationRevealClick?: (messageId: string) => void;
  onFollowUpClick?: (agentId: string, agentName: string) => void;
  isExpanded?: boolean;
  showCollaborationInfo?: boolean;
}

export function WhisperResponseBlock({ 
  message, 
  index,
  onRevealClick,
  onOrchestrationRevealClick,
  onFollowUpClick,
  isExpanded = false,
  showCollaborationInfo = false 
}: WhisperResponseBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localExpanded, setLocalExpanded] = useState(false);
  
  const agent = AVAILABLE_AGENTS.find(a => a.id === message.agent) || AVAILABLE_AGENTS[0];
  const isUser = message.role === "user";
  const expanded = isExpanded || localExpanded;

  // Debug logging
  if (message.isOrchestrated) {
    console.log("WhisperResponseBlock - Orchestrated message:", {
      id: message.id,
      role: message.role,
      agent: message.agent,
      orchestrationId: message.orchestrationId,
      shouldShowOrchestrationButton: message.role === "assistant" && message.isOrchestrated && !!onOrchestrationRevealClick
    });
  }

  if (isUser) {
    return (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 20,
          delay: index * 0.05
        }}
      >
        <div className="text-sm text-muted-foreground mb-2">You asked</div>
        <div className="text-lg leading-relaxed">{message.content}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-12 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Agent whisper label */}
      <motion.div 
        className="flex items-center gap-2 mb-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          {agent.name} 
          {message.isOrchestrated ? (
            <>
              <Brain className="w-3 h-3 text-primary opacity-60" />
              orchestrated
            </>
          ) : (
            " whispers"
          )}
          {message.referencedAgents && message.referencedAgents.length > 0 && (
            <span className="ml-1 opacity-70">
              (building on {message.referencedAgents.map(id => 
                AVAILABLE_AGENTS.find(a => a.id === id)?.name
              ).join(", ")})
            </span>
          )}
        </span>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  console.log(`Reveal button clicked for message ${message.id}`);
                  onRevealClick?.(message.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreHorizontal className="w-3 h-3" />
                <span>{message.isOrchestrated ? "reveal thinking" : "reveal"}</span>
              </motion.button>
              
              {message.role === "assistant" && message.isOrchestrated && onOrchestrationRevealClick && (
                <motion.button
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    console.log(`Orchestration button clicked for message ${message.id} (role: ${message.role})`);
                    onOrchestrationRevealClick?.(message.id);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-3 h-3" />
                  <span>reveal orchestration</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main response block */}
      <motion.div
        className={cn(
          "relative rounded-2xl p-6",
          "bg-gradient-to-br from-background to-muted/20",
          "border border-border/50",
          "transition-all duration-500",
          isHovered && "shadow-xl border-border"
        )}
        layout
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Subtle agent aura */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${
              agent.color === "blue" ? "rgba(59, 130, 246, 0.1)" :
              agent.color === "purple" ? "rgba(168, 85, 247, 0.1)" :
              agent.color === "green" ? "rgba(34, 197, 94, 0.1)" :
              "rgba(var(--primary), 0.1)"
            } 0%, transparent 70%)`
          }}
          animate={{
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative">
          {/* Collaboration indicator */}
          {message.isPartOfChain && showCollaborationInfo && (
            <motion.div
              className="absolute -left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-transparent"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ originY: 0 }}
            />
          )}
          
          <div className="text-base leading-relaxed">
            {message.content}
          </div>

          {/* Expand/collapse for long responses */}
          {message.content.length > 200 && (
            <motion.button
              className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setLocalExpanded(!expanded)}
              whileHover={{ x: 2 }}
            >
              <ChevronRight 
                className={cn(
                  "w-3 h-3 transition-transform",
                  expanded && "rotate-90"
                )}
              />
              {expanded ? "Show less" : "Continue reading"}
            </motion.button>
          )}
        </div>

        {/* Follow-up suggestion */}
        <AnimatePresence>
          {isHovered && onFollowUpClick && (
            <motion.button
              className="absolute -bottom-12 left-6 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3 }}
              onClick={() => onFollowUpClick(agent.id, agent.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Ask <span style={{ color: agent.color === "blue" ? "#3b82f6" : 
                                       agent.color === "purple" ? "#a855f7" : 
                                       agent.color === "green" ? "#22c55e" : 
                                       agent.color === "indigo" ? "#6366f1" :
                                       agent.color === "amber" ? "#f59e0b" :
                                       "var(--primary)" }}>@{agent.name}</span> a follow-up...
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}