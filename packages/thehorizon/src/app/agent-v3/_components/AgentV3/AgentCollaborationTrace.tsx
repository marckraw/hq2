"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CollaborationTrace} from "./types";
import { AVAILABLE_AGENTS } from "./types";
import { cn } from "@/lib/utils";
import { ArrowRight, MessageSquare, Zap } from "lucide-react";

interface AgentCollaborationTraceProps {
  trace: CollaborationTrace;
  visible: boolean;
  onClose?: () => void;
}

export function AgentCollaborationTrace({ 
  trace, 
  visible,
  onClose 
}: AgentCollaborationTraceProps) {
  const getAgentData = (agentId: string) => 
    AVAILABLE_AGENTS.find(a => a.id === agentId) || AVAILABLE_AGENTS[0];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="relative mt-6 p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Agent Collaboration
            </h4>
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Hide
              </button>
            )}
          </div>

          {/* Agent Flow Visualization */}
          <div className="flex items-center gap-4 mb-6">
            {trace.agents.map((agentId, index) => {
              const agent = getAgentData(agentId);
              const isLast = index === trace.agents.length - 1;

              return (
                <motion.div
                  key={agentId}
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold",
                      "bg-gradient-to-br border-2",
                      agent.color === "blue" && "from-blue-500/20 to-blue-600/20 border-blue-500/50",
                      agent.color === "purple" && "from-purple-500/20 to-purple-600/20 border-purple-500/50",
                      agent.color === "green" && "from-green-500/20 to-green-600/20 border-green-500/50",
                    )}>
                      {agent.name[0]}
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                      {agent.name}
                    </div>
                  </div>
                  
                  {!isLast && (
                    <motion.div
                      className="mx-2"
                      initial={{ scale: 0, x: -10 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                    >
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Interactions Timeline */}
          {trace.interactions.length > 0 && (
            <div className="mt-8 space-y-3">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">
                Internal Communications
              </h5>
              
              {trace.interactions.map((interaction, index) => {
                const fromAgent = getAgentData(interaction.fromAgent);
                const toAgent = getAgentData(interaction.toAgent);
                
                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        fromAgent.color === "blue" && "bg-blue-500/20 text-blue-600",
                        fromAgent.color === "purple" && "bg-purple-500/20 text-purple-600",
                        fromAgent.color === "green" && "bg-green-500/20 text-green-600",
                      )}>
                        {fromAgent.name[0]}
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        toAgent.color === "blue" && "bg-blue-500/20 text-blue-600",
                        toAgent.color === "purple" && "bg-purple-500/20 text-purple-600",
                        toAgent.color === "green" && "bg-green-500/20 text-green-600",
                      )}>
                        {toAgent.name[0]}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-muted-foreground italic">
                        "{interaction.action}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <motion.div
            className="mt-6 pt-4 border-t border-border/50 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <MessageSquare className="w-3 h-3 inline-block mr-1" />
            {trace.agents.length} agents collaborated to answer your question
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}