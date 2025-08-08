"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  GitBranch, 
  MessageSquare,
  X,
  ChevronRight,
  Sparkles,
  Wrench
} from "lucide-react";
import type { OrchestrationResult} from "./types";
import { AVAILABLE_AGENTS } from "./types";

interface SubthreadRevealPanelProps {
  visible: boolean;
  onClose: () => void;
  orchestrationResult?: OrchestrationResult;
}

export function SubthreadRevealPanel({
  visible,
  onClose,
  orchestrationResult
}: SubthreadRevealPanelProps) {
  if (!orchestrationResult) return null;
  
  const orchestratorAgent = AVAILABLE_AGENTS.find(a => a.id === orchestrationResult.orchestrator);
  
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Reveal Panel */}
          <motion.div
            className="absolute right-0 top-0 h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl overflow-hidden"
            style={{ zIndex: 20 }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300 
            }}
          >
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Agent Council Process
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Led by {orchestratorAgent?.name} • {orchestrationResult.subthreads.length} internal exchanges
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Execution Plan */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Execution Plan</h4>
                  </div>
                  <div className="space-y-3">
                    {orchestrationResult.plan.steps.map((step, idx) => {
                      const agent = AVAILABLE_AGENTS.find(a => a.id === step.agent);
                      return (
                        <motion.div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{agent?.name}</span>
                              {step.dependsOn && step.dependsOn.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  (depends on {step.dependsOn.join(", ")})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {step.task}
                            </div>
                            {step.tools && step.tools.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Wrench className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {step.tools.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* Agent Subthreads */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Internal Agent Communications</h4>
                  </div>
                  <div className="space-y-4">
                    {orchestrationResult.subthreads.map((thread, idx) => {
                      const fromAgent = AVAILABLE_AGENTS.find(a => a.id === thread.fromAgent);
                      const toAgent = thread.toAgent ? AVAILABLE_AGENTS.find(a => a.id === thread.toAgent) : null;
                      
                      return (
                        <motion.div
                          key={thread.id}
                          className="relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          {/* Connection line */}
                          {idx < orchestrationResult.subthreads.length - 1 && (
                            <div className="absolute top-12 left-6 w-0.5 h-12 bg-border" />
                          )}
                          
                          <div className="flex gap-4">
                            {/* Agent avatar */}
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm"
                              style={{ 
                                backgroundColor: `${fromAgent?.color === "blue" ? "#3b82f6" : 
                                                  fromAgent?.color === "purple" ? "#a855f7" : 
                                                  fromAgent?.color === "green" ? "#22c55e" : 
                                                  "var(--primary)"}20`
                              }}
                            >
                              {fromAgent?.name[0]}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{fromAgent?.name}</span>
                                {toAgent && (
                                  <>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{toAgent.name}</span>
                                  </>
                                )}
                                {thread.confidence && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {Math.round(thread.confidence * 100)}% confident
                                  </span>
                                )}
                              </div>
                              <div className="p-3 rounded-lg bg-muted/20 text-sm">
                                {thread.content}
                              </div>
                              {thread.tools && thread.tools.length > 0 && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Wrench className="w-3 h-3" />
                                  Used: {thread.tools.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* Final Synthesis */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Final Synthesis</h4>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ 
                          backgroundColor: `${orchestratorAgent?.color === "blue" ? "#3b82f6" : 
                                            orchestratorAgent?.color === "purple" ? "#a855f7" : 
                                            orchestratorAgent?.color === "green" ? "#22c55e" : 
                                            "var(--primary)"}20`
                        }}
                      >
                        {orchestratorAgent?.name[0]}
                      </div>
                      <span className="font-medium text-sm">{orchestratorAgent?.name}'s Response</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {orchestrationResult.finalResponse}
                    </div>
                  </div>
                </motion.section>

                {/* Metadata */}
                <motion.section
                  className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div>Duration: {orchestrationResult.duration}ms</div>
                  <div>Confidence: {Math.round(orchestrationResult.confidence * 100)}%</div>
                  {orchestrationResult.toolsUsed && orchestrationResult.toolsUsed.length > 0 && (
                    <div>Tools used: {orchestrationResult.toolsUsed.join(", ")}</div>
                  )}
                </motion.section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}