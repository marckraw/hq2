"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  agentName?: string;
  agentColor?: string;
}

export function TypingIndicator({ agentName = "AI", agentColor = "primary" }: TypingIndicatorProps) {
  return (
    <motion.div 
      className="flex items-center space-x-3 px-6 py-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn(
              "block w-2 h-2 rounded-full",
              agentColor === "blue" && "bg-blue-500",
              agentColor === "purple" && "bg-purple-500",
              agentColor === "green" && "bg-green-500",
              agentColor === "primary" && "bg-primary"
            )}
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <motion.span 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {agentName} is thinking...
      </motion.span>
    </motion.div>
  );
}