"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WhisperPromptTextarea } from "./WhisperPromptTextarea";
import { WhisperResponseBlock } from "./WhisperResponseBlock";
import { WhisperRevealPanel } from "./WhisperRevealPanel";
import { PrecisionOverlay } from "./PrecisionOverlay";
import { AgentCollaborationTrace } from "./AgentCollaborationTrace";
import { SubthreadRevealPanel } from "./SubthreadRevealPanel";
import { TypingIndicator } from "./TypingIndicator";
import { ExecutionPlanIndicator } from "./ExecutionPlanIndicator";
import type { Message } from "./types";
import { AVAILABLE_AGENTS } from "./types";
import { useMockResponses } from "../../_hooks/useMockResponses";
import { useKeyboardShortcuts } from "../../_hooks/useKeyboardShortcuts";
import { useAutoAgentSelection } from "../../_hooks/useAutoAgentSelection";
import { useAgentCollaboration } from "../../_hooks/useAgentCollaboration";
import { useAgentOrchestration } from "../../_hooks/useAgentOrchestration";
import { cn } from "@/lib/utils";
import { Sparkles, Users } from "lucide-react";

let messageIdCounter = 0;

export function WhisperChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [showPrecision, setShowPrecision] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [currentCollaborationId, setCurrentCollaborationId] = useState<
    string | null
  >(null);
  const [showCollaborationTrace, setShowCollaborationTrace] = useState(false);
  const [showSubthreadReveal, setShowSubthreadReveal] = useState(false);
  const [selectedOrchestrationId, setSelectedOrchestrationId] = useState<
    string | null
  >(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const [executionPlan, setExecutionPlan] = useState<{
    orchestrationId: string;
    orchestrator: string;
    currentStep: number;
    totalSteps: number;
    activeAgent: string;
    currentTask?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<{
    focus: () => void;
    setValue: (value: string) => void;
  }>(null);
  const { generateMessage } = useMockResponses();

  // Auto agent selection
  const {
    selectedAgent,
    setSelectedAgent,
    selectAgentForQuery,
    isAnalyzing,
    setTypingQuery,
    lastIntent,
  } = useAutoAgentSelection();

  // Agent collaboration
  const {
    shouldCollaborate,
    orchestrateCollaboration,
    detectCollaborationPattern,
    getCollaborationTrace,
  } = useAgentCollaboration();

  // Agent orchestration (new subthread system)
  const {
    shouldOrchestrate,
    orchestrate,
    getOrchestrationResult,
    orchestrationResults,
  } = useAgentOrchestration();

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
    onEscape: () => {
      setShowReveal(false);
      setShowPrecision(false);
      setShowCollaborationTrace(false);
      setShowSubthreadReveal(false);
    },
  });

  const handleRevealClick = useCallback((messageId: string) => {
    // Always show the regular reveal panel for individual agent thinking
    setSelectedMessageId(messageId);
    setShowReveal(true);
  }, []);

  const handleOrchestrationRevealClick = useCallback(
    (messageId: string) => {
      console.log("=== Orchestration reveal clicked ===");
      console.log("Looking for message ID:", messageId);
      console.log("Total messages:", messages.length);
      console.log(
        "All message IDs:",
        messages.map((m) => ({
          id: m.id,
          role: m.role,
          isOrchestrated: m.isOrchestrated,
        }))
      );

      const message = messages.find((m) => m.id === messageId);
      console.log("Found message:", message);

      if (message?.isOrchestrated && message.orchestrationId) {
        console.log(
          "Opening subthread reveal for orchestration:",
          message.orchestrationId
        );
        const result = getOrchestrationResult(message.orchestrationId);
        console.log("Orchestration result found:", !!result);
        setSelectedOrchestrationId(message.orchestrationId);
        setShowSubthreadReveal(true);
      } else {
        console.log("Cannot open - missing orchestration data");
        if (message) {
          console.log("Message details:", {
            role: message.role,
            isOrchestrated: message.isOrchestrated,
            orchestrationId: message.orchestrationId,
            agent: message.agent,
          });
        }
      }
    },
    [messages, getOrchestrationResult]
  );

  const handleFollowUpClick = useCallback(
    (agentId: string, agentName: string) => {
      // Set the selected agent for precision mode
      setSelectedAgent(agentId);

      // Focus the textarea and add agent mention
      if (textareaRef.current) {
        textareaRef.current.setValue(`@${agentName} `);
        textareaRef.current.focus();
      }
    },
    [setSelectedAgent]
  );

  const handleSubmit = useCallback(
    async (value: string) => {
      // Mark as interacted on first message
      if (!hasInteracted) {
        setHasInteracted(true);
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-${++messageIdCounter}`,
        role: "user",
        content: value,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Check if this should use orchestration (new subthread system)
      if (shouldOrchestrate(value)) {
        try {
          // Get the orchestrator for display
          const agents = [
            { id: "chronos", confidence: 0.7 },
            { id: "valkyrie", confidence: 0.8 },
            { id: "odin", confidence: 0.9 },
            { id: "heimdall", confidence: 0.6 },
            { id: "hermes", confidence: 0.5 },
          ];
          const orchestrator = agents.sort(
            (a, b) => b.confidence - a.confidence
          )[0].id;

          const orchestratedMessage = await orchestrate(value, (update) => {
            setExecutionPlan({
              orchestrator,
              ...update,
            });
          });

          console.log("Orchestrated message created:", {
            id: orchestratedMessage.id,
            role: orchestratedMessage.role,
            isOrchestrated: orchestratedMessage.isOrchestrated,
            orchestrationId: orchestratedMessage.orchestrationId,
            agent: orchestratedMessage.agent,
          });

          setIsTyping(false);
          setExecutionPlan(null); // Clear execution plan
          setMessages((prev) => [...prev, orchestratedMessage]);
          return;
        } catch (error) {
          console.error("Orchestration failed:", error);
          setExecutionPlan(null);
          // Fall back to regular response
        }
      }

      // Check if this should be a collaborative response (old system)
      else if (shouldCollaborate(value)) {
        const pattern = detectCollaborationPattern(value);
        if (pattern) {
          // Orchestrate multi-agent collaboration
          const { messages: collabMessages, trace } =
            await orchestrateCollaboration(value, pattern, (message) => {
              // Add each message as it's generated
              setMessages((prev) => [...prev, message]);
            });

          setCurrentCollaborationId(trace.id);
          setIsTyping(false);
          return;
        }
      }

      // Single agent response (either manual or auto-selected)
      const agentId = showPrecision
        ? selectedAgent
        : (await selectAgentForQuery(value)).agentId;
      const aiMessage = await generateMessage(value, agentId);

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    },
    [
      shouldOrchestrate,
      orchestrate,
      shouldCollaborate,
      detectCollaborationPattern,
      orchestrateCollaboration,
      selectedAgent,
      selectAgentForQuery,
      generateMessage,
      showPrecision,
      hasInteracted,
    ]
  );

  const handleTyping = useCallback(
    (value: string) => {
      setTypingQuery(value);
    },
    [setTypingQuery]
  );

  const currentAgent =
    AVAILABLE_AGENTS.find((a) => a.id === selectedAgent) || AVAILABLE_AGENTS[0];

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Messages Area - hidden when no messages */}
      <AnimatePresence>
        {hasInteracted && (
          <motion.div
            className="flex-1 overflow-y-auto px-6 pt-32 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => {
                  const isCollaboration =
                    message.collaborationId === currentCollaborationId;

                  // Debug: Log orchestrated messages
                  if (message.isOrchestrated) {
                    console.log(
                      `Rendering orchestrated message at index ${index}:`,
                      {
                        id: message.id,
                        role: message.role,
                        isOrchestrated: message.isOrchestrated,
                        orchestrationId: message.orchestrationId,
                        agent: message.agent,
                      }
                    );
                  }

                  return (
                    <div key={message.id}>
                      <WhisperResponseBlock
                        message={message}
                        index={index}
                        onRevealClick={handleRevealClick}
                        onOrchestrationRevealClick={
                          message.isOrchestrated
                            ? handleOrchestrationRevealClick
                            : undefined
                        }
                        onFollowUpClick={handleFollowUpClick}
                        showCollaborationInfo={isCollaboration}
                      />

                      {/* Show collaboration trace after the last message in the chain */}
                      {isCollaboration &&
                        messages[index + 1]?.collaborationId !==
                          currentCollaborationId &&
                        currentCollaborationId && (
                          <AgentCollaborationTrace
                            trace={
                              getCollaborationTrace(currentCollaborationId)!
                            }
                            visible={showCollaborationTrace}
                            onClose={() => setShowCollaborationTrace(false)}
                          />
                        )}
                    </div>
                  );
                })}
              </AnimatePresence>

              {/* Show execution plan OR typing indicator */}
              {executionPlan ? (
                <ExecutionPlanIndicator
                  orchestrator={executionPlan.orchestrator}
                  currentStep={executionPlan.currentStep}
                  totalSteps={executionPlan.totalSteps}
                  activeAgent={executionPlan.activeAgent}
                  currentTask={executionPlan.currentTask}
                  onRevealClick={() => {
                    setSelectedOrchestrationId(executionPlan.orchestrationId);
                    setShowSubthreadReveal(true);
                  }}
                />
              ) : isTyping ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <TypingIndicator
                    agentName={currentAgent.name}
                    agentColor={currentAgent.color}
                  />
                </motion.div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - centered initially, bottom when messages exist */}
      <motion.div
        className={cn(
          "relative z-10",
          !hasInteracted && "flex-1 flex items-center justify-center"
        )}
        layout
        transition={{
          layout: { duration: 0.5, ease: "easeInOut" },
        }}
      >
        <motion.div
          className={cn(
            "w-full",
            hasInteracted
              ? "bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-8"
              : ""
          )}
          layout
        >
          <div className="px-6 max-w-4xl mx-auto">
            <WhisperPromptTextarea
              ref={textareaRef}
              onSubmit={handleSubmit}
              onTyping={handleTyping}
              isDisabled={isTyping}
              isAnalyzing={isAnalyzing}
              suggestedAgent={
                lastIntent?.confidence && lastIntent.confidence > 0.5
                  ? currentAgent.name
                  : undefined
              }
              placeholder={
                messages.length === 0 ? "Ask anything…" : "Continue..."
              }
            />
          </div>

          {/* Collaboration indicator */}
          {currentCollaborationId && !showCollaborationTrace && (
            <motion.button
              className="absolute top-2 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs"
              onClick={() => setShowCollaborationTrace(true)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-3 h-3" />
              Show collaboration
            </motion.button>
          )}

          {/* Subtle hint */}
          {messages.length === 0 && (
            <motion.div
              className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              The system knows what you need • Press / for manual control
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Reveal Panel */}
      <WhisperRevealPanel
        visible={showReveal}
        onClose={() => setShowReveal(false)}
        messageId={selectedMessageId || ""}
        agentName={currentAgent.name}
      />

      {/* Subthread Reveal Panel */}
      <SubthreadRevealPanel
        visible={showSubthreadReveal}
        onClose={() => setShowSubthreadReveal(false)}
        orchestrationResult={
          selectedOrchestrationId
            ? getOrchestrationResult(selectedOrchestrationId)
            : undefined
        }
      />

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
