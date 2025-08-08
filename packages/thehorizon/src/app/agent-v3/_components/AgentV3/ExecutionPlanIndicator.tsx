"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Brain, ArrowRight, Sparkles } from "lucide-react";
import { AVAILABLE_AGENTS } from "./types";

interface ExecutionPlanIndicatorProps {
  orchestrator: string;
  currentStep: number;
  totalSteps: number;
  activeAgent: string;
  currentTask?: string;
  onRevealClick?: () => void;
  className?: string;
}

export function ExecutionPlanIndicator({
  orchestrator,
  currentStep,
  totalSteps,
  activeAgent,
  currentTask,
  onRevealClick,
  className
}: ExecutionPlanIndicatorProps) {
  const orchestratorAgent = AVAILABLE_AGENTS.find(a => a.id === orchestrator);
  const activeAgentData = AVAILABLE_AGENTS.find(a => a.id === activeAgent);
  
  return (
    <motion.div
      className={cn(
        "relative flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50",
        "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onRevealClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Orchestrator Icon */}
      <div className="relative">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ 
            backgroundColor: `${orchestratorAgent?.color === "blue" ? "#3b82f6" : 
                              orchestratorAgent?.color === "purple" ? "#a855f7" : 
                              orchestratorAgent?.color === "green" ? "#22c55e" : 
                              orchestratorAgent?.color === "indigo" ? "#6366f1" :
                              orchestratorAgent?.color === "amber" ? "#f59e0b" :
                              "var(--primary)"}20`
          }}
        >
          {orchestratorAgent?.name[0]}
        </div>
        
        {/* Pulsing indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{orchestratorAgent?.name}</span>
          <span className="text-muted-foreground">is orchestrating...</span>
          <span className="text-xs text-muted-foreground">
            ({currentStep}/{totalSteps})
          </span>
        </div>
        
        {/* Current Task */}
        <AnimatePresence mode="wait">
          {currentTask && (
            <motion.div
              key={currentTask}
              className="flex items-center gap-1.5 mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Consulting{" "}
                <span 
                  className="font-medium"
                  style={{ 
                    color: activeAgentData?.color === "blue" ? "#3b82f6" : 
                           activeAgentData?.color === "purple" ? "#a855f7" : 
                           activeAgentData?.color === "green" ? "#22c55e" : 
                           activeAgentData?.color === "indigo" ? "#6366f1" :
                           activeAgentData?.color === "amber" ? "#f59e0b" :
                           "var(--primary)"
                  }}
                >
                  {activeAgentData?.name}
                </span>
                {currentTask && ` for ${currentTask}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress Bar */}
      <div className="w-20">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Reveal Hint */}
      <motion.div
        className="flex items-center gap-1 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles className="w-3 h-3" />
        <span>reveal</span>
      </motion.div>
    </motion.div>
  );
}