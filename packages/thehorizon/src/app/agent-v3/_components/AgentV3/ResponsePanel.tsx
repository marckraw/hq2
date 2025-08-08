"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Message } from "./types";
import { AVAILABLE_AGENTS } from "./types";
import { useState } from "react";

interface ResponsePanelProps {
  message: Message;
  index: number;
}

export function ResponsePanel({ message, index }: ResponsePanelProps) {
  const [isHovered, setIsHovered] = useState(false);

  const agent =
    AVAILABLE_AGENTS.find((a) => a.id === message.agent) || AVAILABLE_AGENTS[0];
  const isUser = message.role === "user";

  const getAgentColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-500/10 dark:bg-blue-500/5",
          border: "border-blue-500/20",
          text: "text-blue-600 dark:text-blue-400",
          glow: "shadow-blue-500/20",
        };
      case "purple":
        return {
          bg: "bg-purple-500/10 dark:bg-purple-500/5",
          border: "border-purple-500/20",
          text: "text-purple-600 dark:text-purple-400",
          glow: "shadow-purple-500/20",
        };
      case "green":
        return {
          bg: "bg-green-500/10 dark:bg-green-500/5",
          border: "border-green-500/20",
          text: "text-green-600 dark:text-green-400",
          glow: "shadow-green-500/20",
        };
      case "gray":
        return {
          bg: "bg-gray-500/10 dark:bg-gray-500/5",
          border: "border-gray-500/20",
          text: "text-gray-600 dark:text-gray-400",
          glow: "shadow-gray-500/20",
        };
      default:
        return {
          bg: "bg-primary/10 dark:bg-primary/5",
          border: "border-primary/20",
          text: "text-primary",
          glow: "shadow-primary/20",
        };
    }
  };

  const colorClasses = getAgentColorClasses(!isUser ? agent.color : "gray");

  return (
    <motion.div
      className={cn(
        "relative group",
        isUser ? "flex justify-end" : "flex justify-start"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 14,
        delay: index * 0.1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl p-4 transition-all duration-300",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : cn(
                colorClasses.bg,
                "border",
                colorClasses.border,
                isHovered && `shadow-lg ${colorClasses.glow}`
              )
        )}
      >
        {!isUser && (
          <motion.div
            className={cn("text-xs font-medium mb-1", colorClasses.text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {agent.name}
          </motion.div>
        )}

        <div
          className={cn(
            "text-base leading-relaxed",
            isUser ? "text-primary-foreground" : "text-foreground"
          )}
        >
          {message.content}
        </div>

        {!isUser && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-transparent"
            style={{
              background: `radial-gradient(circle, ${
                agent.color === "blue"
                  ? "#3b82f6"
                  : agent.color === "purple"
                  ? "#a855f7"
                  : agent.color === "green"
                  ? "#22c55e"
                  : "var(--primary)"
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: isHovered ? [1, 1.5, 1] : 1,
              opacity: isHovered ? [0.5, 0.8, 0.5] : 0.5,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
