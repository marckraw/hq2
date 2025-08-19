"use client";

import React, { useState, useCallback } from "react";
import { ChatMessage } from "@/components/ai-chat/primitives/ChatMessage/ChatMessage";
import { AgentAvatar, type Agent } from "@/components/ai-chat/ui/AgentAvatar";
import { AttachmentList } from "@/components/ai-chat/attachments/AttachmentList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Brain, CheckCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Message {
  id: number;
  role: string;
  content: string;
  createdAt: string;
  attachments?: any[];
}

interface Execution {
  id: number;
  messageId: number;
  createdAt: Date;
  updatedAt: Date;
  steps: ExecutionStep[];
}

interface ExecutionStep {
  id: number;
  stepType: string;
  content: string;
  metadata?: any;
  createdAt: Date;
  startTime?: number;
  endTime?: number;
  status?: string;
  result?: string;
}

interface Timeline {
  messages: Message[];
  executions: Execution[];
}

interface MessageListProps {
  messages: Message[];
  timeline?: Timeline;
  onCopyMessage: (content: string) => void;
  defaultAgent: Agent;
  responseTimes?: Record<number | string, number>;
}

export function MessageList({ 
  messages, 
  timeline,
  onCopyMessage,
  defaultAgent,
  responseTimes = {}
}: MessageListProps) {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  const toggleMessageExpansion = useCallback((messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const toggleStepExpansion = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case "thinking": return Brain;
      case "search": return Brain;
      case "fetch": return Brain;
      case "analyze": return Brain;
      case "tool_execution": return Brain;
      case "tool_response": return CheckCircle;
      default: return Brain;
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      {messages.map((message) => {
        const isExpanded = expandedMessages.has(message.id.toString());
        const messageExecution = timeline?.executions
          .find(e => e.messageId === message.id) || null;
        const messageSteps = messageExecution?.steps || [];

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="group"
            onMouseEnter={() => setHoveredMessage(message.id.toString())}
            onMouseLeave={() => setHoveredMessage(null)}
          >
            {/* Main Message */}
            <div className="flex gap-3">
              {message.role === "assistant" && (
                <AgentAvatar agent={defaultAgent} size="sm" />
              )}
              <div className="flex-1 space-y-2">
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.createdAt}
                  showAvatar={false}
                  status="sent"
                  thinkingTime={
                    message.role === "assistant" 
                      ? responseTimes[message.id] || responseTimes[`temp_${message.id}`]
                      : undefined
                  }
                />
                
                {/* Research Process */}
                {messageSteps.length > 0 && (
                  <div className="ml-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredMessage === message.id.toString() || isExpanded ? 1 : 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Researched {messageSteps.length} sources</span>
                      {messageExecution && (
                        <>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{((messageExecution.updatedAt.getTime() - messageExecution.createdAt.getTime()) / 1000).toFixed(1)}s</span>
                        </>
                      )}
                      
                      <AnimatePresence>
                        {(hoveredMessage === message.id.toString() || isExpanded) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMessageExpansion(message.id.toString())}
                              className="h-5 px-2 text-xs gap-1 ml-2 hover:text-primary"
                            >
                              <Brain className="h-3 w-3" />
                              {isExpanded ? "Hide" : "View"} thinking process
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    {/* Expanded research details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="p-3 mt-2">
                          <div className="space-y-2">
                            {messageSteps.map((step, idx) => {
                              const StepIcon = getStepIcon(step.stepType);
                              const isStepExpanded = expandedSteps.has(step.id.toString());
                              
                              return (
                                <Collapsible
                                  key={step.id}
                                  open={isStepExpanded}
                                  onOpenChange={() => toggleStepExpansion(step.id.toString())}
                                >
                                  <div className="flex items-start gap-2">
                                    <StepIcon className={`h-4 w-4 mt-0.5 ${
                                      step.status === "complete" ? "text-green-500" : "text-muted-foreground"
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                      <CollapsibleTrigger className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                                        {isStepExpanded ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                        <span className="truncate">{step.content}</span>
                                      </CollapsibleTrigger>
                                      
                                      <CollapsibleContent>
                                        <div className="mt-1 pl-5 text-xs text-muted-foreground">
                                          {step.result && (
                                            <div className="mb-1">{step.result}</div>
                                          )}
                                          {step.metadata && (
                                            <pre className="text-xs bg-muted/50 p-2 rounded mt-1 overflow-x-auto">
                                              {JSON.stringify(step.metadata, null, 2)}
                                            </pre>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </div>
                                </Collapsible>
                              );
                            })}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    <AttachmentList
                      attachments={message.attachments.map(att => ({
                        id: att.id,
                        name: att.name,
                        type: att.type as any,
                        size: att.size,
                        status: "success" as const,
                        uploadProgress: 100,
                        removable: false,
                      }))}
                      compact
                      direction="horizontal"
                      showCount={false}
                      editable={false}
                    />
                  </div>
                )}
              </div>
              
              {/* Message Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onCopyMessage(message.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}