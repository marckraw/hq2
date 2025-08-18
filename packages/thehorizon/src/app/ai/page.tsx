"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage } from "@/components/ai-chat/primitives/ChatMessage/ChatMessage";
import { ChatInput, type ChatInputRef } from "@/components/ai-chat/primitives/ChatInput/ChatInput";
import { AgentWorkflow, type WorkflowItem } from "@/components/ai-chat/workflow/AgentWorkflow";
import { AttachmentList } from "@/components/ai-chat/attachments/AttachmentList";
import { AgentAvatar, type Agent } from "@/components/ai-chat/ui/AgentAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  Sparkles,
  Search,
  FileText,
  Brain,
  Zap,
  Clock,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentAttachmentProps } from "@/components/ai-chat/attachments/DocumentAttachment";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define message types
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agent?: Agent;
  attachments?: DocumentAttachmentProps[];
  status?: "sending" | "sent" | "error";
  isQuickResponse?: boolean; // Is this a quick acknowledgment response?
  researchSteps?: ResearchStep[]; // Store research steps with the final message
  researchDuration?: number; // Total research time
}

// Research step type
interface ResearchStep {
  id: string;
  type: "search" | "fetch" | "analyze" | "think";
  description: string;
  status: "pending" | "active" | "complete";
  result?: string;
  parameters?: Record<string, any>;
  startTime?: number;
  endTime?: number;
}

// View modes
type ViewMode = "simple" | "detailed";

// Minimal agent definition for simplicity
const defaultAgent: Agent = {
  id: "assistant",
  name: "AI Assistant",
  role: "General Purpose AI",
  avatar: "🤖",
  status: "active",
  capabilities: ["reasoning", "analysis", "creative"],
};

export default function AIPage() {
  const router = useRouter();
  const chatInputRef = useRef<ChatInputRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [currentStep, setCurrentStep] = useState<ResearchStep | null>(null);
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([]);
  const [attachments, setAttachments] = useState<DocumentAttachmentProps[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, currentStep]);

  // Toggle step expansion in detailed view
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

  // Toggle message research expansion
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

  // Simulate research process
  const simulateResearch = useCallback(async (query: string) => {
    const steps: ResearchStep[] = [
      {
        id: "step-1",
        type: "think",
        description: "Understanding your request",
        status: "pending",
        parameters: { input: query },
      },
      {
        id: "step-2",
        type: "search",
        description: "Searching web for information",
        status: "pending",
        parameters: { query: query.slice(0, 50), sources: ["google", "bing"], limit: 10 },
      },
      {
        id: "step-3",
        type: "fetch",
        description: "Fetching relevant documents",
        status: "pending",
        parameters: { urls: ["doc1.pdf", "doc2.html"], format: "markdown" },
      },
      {
        id: "step-4",
        type: "analyze",
        description: "Analyzing and synthesizing data",
        status: "pending",
        parameters: { method: "comprehensive", depth: "deep" },
      },
    ];

    setResearchSteps(steps);
    setIsResearching(true);

    // Process each step with animation
    for (let i = 0; i < steps.length; i++) {
      const step = { ...steps[i], status: "active" as const, startTime: Date.now() };
      setCurrentStep(step);
      
      // Update the step in the list
      setResearchSteps(prev => prev.map((s, idx) => 
        idx === i ? step : idx < i ? { ...s, status: "complete" as const } : s
      ));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      // Mark step as complete with result
      const completedStep = {
        ...step,
        status: "complete" as const,
        endTime: Date.now(),
        result: `Found ${Math.floor(Math.random() * 5 + 3)} relevant results`,
      };
      
      setResearchSteps(prev => prev.map((s, idx) => 
        idx === i ? completedStep : s
      ));
    }

    setCurrentStep(null);
    setIsResearching(false);

    // Return the research summary
    return steps;
  }, []);

  // Handle message submission
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      status: "sent",
    };

    setMessages(prev => [...prev, userMessage]);
    setAttachments([]);
    chatInputRef.current?.clear();

    // Quick acknowledgment for complex queries
    const needsResearch = content.length > 20 || content.includes("?");
    
    if (needsResearch) {
      // Quick response acknowledging the request
      setTimeout(() => {
        const quickResponse: Message = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "I'll help you with that. Let me research this for you...",
          timestamp: new Date(),
          agent: defaultAgent,
          status: "sent",
          isQuickResponse: true,
        };
        setMessages(prev => [...prev, quickResponse]);
      }, 300);

      // Start research process
      setTimeout(async () => {
        const startTime = Date.now();
        const completedSteps = await simulateResearch(content);
        const researchDuration = Date.now() - startTime;
        
        // Final comprehensive response after research
        const finalResponse: Message = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Based on my research, here's what I found about "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}":

After analyzing multiple sources and cross-referencing the information, I can provide you with a comprehensive answer.

The key findings are:
1. **Primary insight**: This is the main finding from the research
2. **Supporting evidence**: Multiple sources confirm this information
3. **Additional context**: This provides deeper understanding

I've searched through ${completedSteps.length} different sources and analyzed the data to ensure accuracy. The information is current and relevant to your query.

Would you like me to elaborate on any specific aspect or search for additional information?`,
          timestamp: new Date(),
          agent: defaultAgent,
          status: "sent",
          researchSteps: completedSteps, // Store the research steps with the message
          researchDuration: researchDuration,
        };
        
        setMessages(prev => [...prev, finalResponse]);
        setResearchSteps([]); // Clear active research steps after completion
      }, 500);
    } else {
      // Simple, quick response for basic queries
      setTimeout(() => {
        const simpleResponse: Message = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Got it! "${content}" - This is a straightforward response that doesn't require additional research.`,
          timestamp: new Date(),
          agent: defaultAgent,
          status: "sent",
        };
        setMessages(prev => [...prev, simpleResponse]);
      }, 500);
    }
  }, [attachments, simulateResearch]);

  // Handle file attachments
  const handleAttachClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,.pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const newAttachments: DocumentAttachmentProps[] = files.map(file => ({
        id: `attach-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type.split("/")[0] as any || "document",
        uploadProgress: 100,
        status: "success" as const,
        removable: true,
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    };
    input.click();
  }, []);

  // Handle attachment removal
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Copy message content
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  // Get icon for step type
  const getStepIcon = (type: ResearchStep["type"]) => {
    switch (type) {
      case "search": return Search;
      case "fetch": return FileText;
      case "analyze": return Brain;
      case "think": return Sparkles;
      default: return Zap;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Simplified Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Assistant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 container mx-auto max-w-3xl px-4 py-4 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-medium mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground text-sm max-w-md mb-6">
                    Just type your question below and I'll help you find the answer.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Explain quantum computing",
                      "Write a Python script",
                      "Analyze this data",
                      "Help with creative writing"
                    ].map(suggestion => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => chatInputRef.current?.setValue(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => {
                    const isExpanded = expandedMessages.has(message.id);
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="group"
                        onMouseEnter={() => setHoveredMessage(message.id)}
                        onMouseLeave={() => setHoveredMessage(null)}
                      >
                        {/* Main Message */}
                        <div className="flex gap-3">
                          {message.role === "assistant" && (
                            <AgentAvatar agent={message.agent} size="sm" />
                          )}
                          <div className="flex-1 space-y-2">
                            <ChatMessage
                              role={message.role}
                              content={message.content}
                              timestamp={message.timestamp}
                              showAvatar={false}
                              status={message.status}
                            />
                            
                            {/* Research Process - Shows on hover or when expanded */}
                            {message.researchSteps && message.researchSteps.length > 0 && !message.isQuickResponse && (
                              <div className="ml-2">
                                {/* Summary line - always visible but subtle */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: hoveredMessage === message.id || isExpanded ? 1 : 0.5 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Researched {message.researchSteps.length} sources</span>
                                  {message.researchDuration && (
                                    <>
                                      <span>•</span>
                                      <Clock className="h-3 w-3" />
                                      <span>{(message.researchDuration / 1000).toFixed(1)}s</span>
                                    </>
                                  )}
                                  
                                  {/* Show button on hover or if already expanded */}
                                  <AnimatePresence>
                                    {(hoveredMessage === message.id || isExpanded) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.15 }}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleMessageExpansion(message.id)}
                                          className="h-5 px-2 text-xs gap-1 ml-2 hover:text-primary"
                                        >
                                          <Brain className="h-3 w-3" />
                                          {isExpanded ? "Hide" : "View"} thinking process
                                        </Button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                                
                                {/* Expanded research details - shows when clicked */}
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Card className="p-3 mt-2">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-sm font-medium">
                                            <Brain className="h-4 w-4" />
                                            Research Process
                                          </div>
                                          {message.researchDuration && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Clock className="h-3 w-3" />
                                              <span>Total: {(message.researchDuration / 1000).toFixed(1)}s</span>
                                            </div>
                                          )}
                                        </div>
                                      {message.researchSteps.map((step) => {
                                        const Icon = getStepIcon(step.type);
                                        const isStepExpanded = expandedSteps.has(step.id);
                                        
                                        return (
                                          <Collapsible
                                            key={step.id}
                                            open={isStepExpanded}
                                            onOpenChange={() => toggleStepExpansion(step.id)}
                                          >
                                            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                              <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{step.description}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                {step.parameters && (
                                                  isStepExpanded ? 
                                                    <ChevronDown className="h-3 w-3" /> : 
                                                    <ChevronRight className="h-3 w-3" />
                                                )}
                                              </div>
                                            </CollapsibleTrigger>
                                            
                                            {step.parameters && (
                                              <CollapsibleContent className="px-6 pb-2">
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                  <div className="font-medium">Parameters:</div>
                                                  <pre className="bg-muted/30 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(step.parameters, null, 2)}
                                                  </pre>
                                                  {step.result && (
                                                    <>
                                                      <div className="font-medium mt-2">Result:</div>
                                                      <div className="bg-muted/30 p-2 rounded">
                                                        {step.result}
                                                      </div>
                                                    </>
                                                  )}
                                                  {step.startTime && step.endTime && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                      <Clock className="h-3 w-3" />
                                                      <span>{((step.endTime - step.startTime) / 1000).toFixed(1)}s</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </CollapsibleContent>
                                            )}
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
                                  attachments={message.attachments}
                                  compact
                                  direction="horizontal"
                                  showCount={false}
                                  editable={false}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Message Actions - Only on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {/* Research Progress Indicator */}
              {isResearching && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-11"
                >
                  {/* Default: Single line that updates with current step */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {currentStep && (
                        <>
                          {React.createElement(getStepIcon(currentStep.type), {
                            className: "h-4 w-4 animate-pulse"
                          })}
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={currentStep.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {currentStep.description}...
                            </motion.span>
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    
                    {/* On hover show more details button */}
                    <AnimatePresence>
                      {researchSteps.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 0.5, scale: 1 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Could expand inline if needed */}}
                            className="h-5 px-2 text-xs gap-1"
                          >
                            {researchSteps.filter(s => s.status === 'complete').length}/{researchSteps.length} steps
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="border-t pt-3 pb-2">
              <AttachmentList
                attachments={attachments}
                onRemove={handleRemoveAttachment}
                compact
                direction="horizontal"
                showCount
              />
            </div>
          )}

          {/* Simplified Input */}
          <div className="border-t pt-4">
            <ChatInput
              ref={chatInputRef}
              placeholder="Ask me anything..."
              onSubmit={handleSendMessage}
              showAttachButton
              showSendButton
              onAttachClick={handleAttachClick}
              disabled={isResearching}
              isLoading={isResearching}
              maxRows={6}
              showShortcuts={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}