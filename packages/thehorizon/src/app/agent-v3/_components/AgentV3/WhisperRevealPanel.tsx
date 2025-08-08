"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Wrench, 
  Database, 
  GitBranch, 
  Sparkles,
  X,
  ArrowRight,
  Clock,
  Zap
} from "lucide-react";

interface RevealContent {
  thoughts: string[];
  tools: { name: string; purpose: string; result?: string }[];
  memory: { key: string; value: string; relevance: number }[];
  reasoning: { step: number; action: string; result: string }[];
  suggestions?: string[];
}

interface WhisperRevealPanelProps {
  visible: boolean;
  onClose: () => void;
  messageId: string;
  agentName: string;
  content?: RevealContent;
}

// Mock data generator for demo
const generateMockReveal = (messageId: string): RevealContent => ({
  thoughts: [
    "User is asking about scheduling, need to check calendar availability",
    "Multiple time zones might be involved, should clarify",
    "Previous similar requests preferred afternoon slots"
  ],
  tools: [
    { name: "calendar_check", purpose: "Check available slots", result: "Found 3 slots" },
    { name: "timezone_converter", purpose: "Convert between timezones", result: "UTC+5 to PST" },
    { name: "preference_analyzer", purpose: "Check user preferences", result: "Prefers 2-4 PM" }
  ],
  memory: [
    { key: "last_meeting_time", value: "Tuesday 3 PM", relevance: 0.9 },
    { key: "preferred_duration", value: "30 minutes", relevance: 0.8 },
    { key: "timezone_preference", value: "Local time", relevance: 0.7 }
  ],
  reasoning: [
    { step: 1, action: "Analyzed request context", result: "Scheduling query detected" },
    { step: 2, action: "Retrieved user preferences", result: "Found historical patterns" },
    { step: 3, action: "Generated optimal times", result: "3 suitable slots identified" }
  ],
  suggestions: [
    "Create recurring meeting?",
    "Add to calendar now?",
    "Set reminder?"
  ]
});

export function WhisperRevealPanel({
  visible,
  onClose,
  messageId,
  agentName,
  content = generateMockReveal(messageId)
}: WhisperRevealPanelProps) {
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
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-background border-l border-border shadow-2xl overflow-hidden"
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
                    <h3 className="text-lg font-semibold">
                      {agentName}'s Process
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      How the magic happened
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

              {/* Content sections with staggered animations */}
              <div className="p-6 space-y-8">
                {/* Thoughts */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Thought Process</h4>
                  </div>
                  <div className="space-y-3">
                    {content.thoughts.map((thought, i) => (
                      <motion.div
                        key={i}
                        className="p-3 rounded-lg bg-muted/50 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                      >
                        {thought}
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Tools Used */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Tools & APIs</h4>
                  </div>
                  <div className="space-y-2">
                    {content.tools.map((tool, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <Zap className="w-3 h-3 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-mono">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tool.purpose}
                          </div>
                          {tool.result && (
                            <div className="text-xs text-primary mt-1">
                              → {tool.result}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Memory References */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Memory Context</h4>
                  </div>
                  <div className="space-y-2">
                    {content.memory.map((mem, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      >
                        <div>
                          <div className="text-sm">{mem.key}</div>
                          <div className="text-xs text-muted-foreground">
                            {mem.value}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(mem.relevance * 100)}% relevant
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Reasoning Chain */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium">Reasoning Steps</h4>
                  </div>
                  <div className="relative">
                    {content.reasoning.map((step, i) => (
                      <motion.div
                        key={i}
                        className="flex gap-4 mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {step.step}
                          </div>
                          {i < content.reasoning.length - 1 && (
                            <div className="absolute top-8 left-4 w-0.5 h-12 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-sm font-medium">{step.action}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {step.result}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Suggestions */}
                {content.suggestions && content.suggestions.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-medium">Suggestions</h4>
                    </div>
                    <div className="space-y-2">
                      {content.suggestions.map((suggestion, i) => (
                        <motion.button
                          key={i}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-sm">{suggestion}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}