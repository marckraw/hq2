"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AVAILABLE_AGENTS, AVAILABLE_MODELS } from "./types";
import { cn } from "@/lib/utils";
import { DetailModal } from "@/components/ui/detail-modal";

interface PrecisionOverlayProps {
  visible: boolean;
  onClose: () => void;
  selectedAgent: string;
  selectedModel: string;
  onSelectAgent: (agentId: string) => void;
  onSelectModel: (modelId: string) => void;
}

export function PrecisionOverlay({
  visible,
  onClose,
  selectedAgent,
  selectedModel,
  onSelectAgent,
  onSelectModel,
}: PrecisionOverlayProps) {
  return (
    <DetailModal
      isOpen={visible}
      onClose={onClose}
      title="Precision Mode"
      width="default"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
            }}
          >
            {/* Agent Selection */}
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-3 block">
                Select Agent
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AVAILABLE_AGENTS.map((agent) => {
                  const isSelected = selectedAgent === agent.id;
                  return (
                    <motion.button
                      key={agent.id}
                      onClick={() => onSelectAgent(agent.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-1">{agent.name[0]}</div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {agent.description}
                      </div>

                      {isSelected && (
                        <motion.div
                          className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"
                          layoutId="agent-selector"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">
                Select Model
              </label>
              <div className="space-y-2">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => onSelectModel(model.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {model.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {model.description}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">
                    Esc
                  </kbd>{" "}
                  to close
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">
                    ⌘K
                  </kbd>{" "}
                  to reopen
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DetailModal>
  );
}
