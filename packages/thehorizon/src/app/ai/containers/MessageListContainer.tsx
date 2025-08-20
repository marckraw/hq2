"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ai-chat/primitives/ChatMessage";
import { ExecutionStep, ResponseMetrics } from "@/components/ai-chat/presentational";
import { AgentThinking, ToolCall } from "@/components/ai-chat/workflow";
import { MessageActions } from "@/components/ai-chat/disclosure/MessageActions";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message, ExecutionTimeline } from "@/lib/ai-chat/types";

interface MessageListContainerProps {
  messages: Message[];
  timeline?: ExecutionTimeline[];
  isLoading?: boolean;
  className?: string;
}

export function MessageListContainer({ 
  messages, 
  timeline = [],
  isLoading = false,
  className
}: MessageListContainerProps) {
  const [expandedSteps, setExpandedSteps] = useState(new Set<string>());
  const [expandedMessages, setExpandedMessages] = useState(new Set<string>());
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle step expansion toggle
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

  // Handle message expansion toggle
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

  // Handle copy functionality
  const handleCopy = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Show a toast or some feedback that copy was successful
      console.log("Copied message:", messageId);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  }, []);

  // Map execution timeline to messages
  const getExecutionsForMessage = (messageId: string) => {
    // Filter timeline items that are execution steps for this message
    return timeline
      .filter((item: any) => 
        item.type === 'execution_step' && 
        item.data?.execution?.messageId === messageId
      )
      .map((item: any) => ({
        id: item.data.id,
        type: item.data.stepType || 'unknown',
        content: item.data.content || '',
        status: 'completed', // Historical steps are always completed
        metadata: item.data.metadata,
        createdAt: item.data.createdAt,
        duration: undefined, // We'll calculate this if needed
      }));
  };

  // Calculate metrics for a message
  const calculateMetrics = (messageId: string) => {
    const executions = getExecutionsForMessage(messageId);
    if (executions.length === 0) return null;

    const firstTime = executions[0]?.createdAt;
    const lastTime = executions[executions.length - 1]?.createdAt;
    const duration = firstTime && lastTime ? 
      (new Date(lastTime).getTime() - new Date(firstTime).getTime()) : 0;

    const tokens = executions.reduce((acc, e) => {
      return acc + (e.metadata?.tokens || 0);
    }, 0);

    return {
      stepCount: executions.length,
      duration: Math.round(duration / 1000), // Convert to seconds
      sources: 0, // We don't track sources in execution steps
      confidence: executions[0]?.metadata?.confidence,
      tokens
    };
  };

  // Render execution steps for a message
  const renderExecutionSteps = (messageId: string) => {
    const executions = getExecutionsForMessage(messageId);
    if (executions.length === 0) return null;

    const isExpanded = expandedMessages.has(messageId);

    return (
      <div className="mt-2 space-y-2">
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleMessageExpansion(messageId)}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          {executions.length} execution step{executions.length !== 1 ? 's' : ''}
        </Button>

        {/* Execution steps */}
        {isExpanded && (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            {executions.map((execution) => {
              const stepId = `${messageId}-${execution.id}`;
              const isStepExpanded = expandedSteps.has(stepId);

              // Map execution types to our ExecutionStep types
              const stepType = execution.type as any;
              
              return (
                <div key={execution.id} className="space-y-1">
                  <ExecutionStep
                    type={stepType}
                    content={execution.content || ""}
                    status={'complete'}
                    duration={execution.duration}
                    expanded={isStepExpanded}
                    onToggle={() => toggleStepExpansion(stepId)}
                    variant="default"
                  />

                </div>
              );
            })}
          </div>
        )}

        {/* Response metrics */}
        {isExpanded && (
          <div className="mt-3">
            <ResponseMetrics
              {...calculateMetrics(messageId)!}
              variant="inline"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={listRef}
      className={cn(
        "flex flex-col space-y-4 p-4 overflow-y-auto",
        className
      )}
    >
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const showThinking = isLastMessage && isLoading && message.role === 'assistant';

        return (
          <div key={message.id} className="space-y-2">
            {/* Main message */}
            <div 
              className="relative group"
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <ChatMessage
                role={message.role}
                content={message.content}
                timestamp={message.createdAt}
              />

              {/* Message actions - positioned based on role */}
              {message.content && (
                <div className={cn(
                  "absolute top-2",
                  message.role === 'user' ? "left-2" : "right-2"
                )}>
                  <MessageActions
                    visible={hoveredMessageId === message.id}
                    onCopy={() => handleCopy(message.id, message.content)}
                    onRetry={message.role === 'assistant' ? () => console.log('Retry') : undefined}
                    onShowDetails={message.role === 'assistant' ? () => toggleMessageExpansion(message.id) : undefined}
                    showActions={{
                      copy: true,
                      retry: message.role === 'assistant',
                      details: message.role === 'assistant' && getExecutionsForMessage(message.id).length > 0,
                    }}
                    size="sm"
                    animation="slide"
                  />
                </div>
              )}
            </div>

            {/* Show thinking indicator for assistant messages */}
            {showThinking && (
              <AgentThinking 
                thoughts={["Processing your request..."]}
              />
            )}

            {/* Show execution steps if available */}
            {message.role === 'assistant' && renderExecutionSteps(message.id)}
          </div>
        );
      })}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}