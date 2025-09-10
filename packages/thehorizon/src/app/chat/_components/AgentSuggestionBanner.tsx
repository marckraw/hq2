"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AgentSuggestion {
  agent: string;
  reason: string;
  confidence: number;
}

interface AgentSuggestionBannerProps {
  suggestion: AgentSuggestion | null;
  currentAgent: string;
  onAcceptSuggestion: (agentType: string) => void;
  onDismiss: () => void;
  className?: string;
}

const getAgentDisplayName = (agentType: string): string => {
  const agentNames: Record<string, string> = {
    general: "General Assistant",
    "figma-to-storyblok": "Figma to Storyblok",
    rephraser: "Text Improver",
    "irf-architect": "IRF Architect",
  };
  return agentNames[agentType] || agentType;
};

const getAgentIcon = (agentType: string): string => {
  const agentIcons: Record<string, string> = {
    general: "🤖",
    "figma-to-storyblok": "🎨",
    rephraser: "📝",
    "irf-architect": "🏗️",
  };
  return agentIcons[agentType] || "🤖";
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200";
  if (confidence >= 0.6) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-blue-600 bg-blue-50 border-blue-200";
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.8) return "High confidence";
  if (confidence >= 0.6) return "Medium confidence";
  return "Low confidence";
};

export const AgentSuggestionBanner: React.FC<AgentSuggestionBannerProps> = ({
  suggestion,
  currentAgent,
  onAcceptSuggestion,
  onDismiss,
  className = "",
}) => {
  if (!suggestion || suggestion.agent === currentAgent) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("w-full", className)}
      >
        <Card className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 shadow-sm">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Better Agent Suggestion</h4>
                <Badge variant="outline" className={cn("text-xs", getConfidenceColor(suggestion.confidence))}>
                  {getConfidenceLabel(suggestion.confidence)}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Switch to:</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border">
                    <span>{getAgentIcon(suggestion.agent)}</span>
                    <span className="font-medium text-gray-900">{getAgentDisplayName(suggestion.agent)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" onClick={() => onAcceptSuggestion(suggestion.agent)} className="h-8 px-3 text-xs">
                Switch
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDismiss} className="h-8 w-8 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
