"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SmoothProgressIndicator } from "./SmoothProgressIndicator";
import { AgentSuggestionBanner } from "./AgentSuggestionBanner";
import { useEnhancedProgress } from "../_hooks/useEnhancedProgress";
import type { ProgressMessage } from "core.mrck.dev";

// Mock progress messages for demo
const createMockProgressMessages = (scenario: string): ProgressMessage[] => {
  switch (scenario) {
    case "image_generation":
      return [
        {
          type: "thinking",
          content: "Let me understand what kind of image you want to create...",
          metadata: { agentType: "general" },
        },
        {
          type: "tool_execution",
          content: "general executing: create_image",
          metadata: {
            functionName: "create_image",
            toolCallArguments: JSON.stringify({
              prompt: "A beautiful sunset over mountains with vibrant colors",
            }),
          },
        },
        {
          type: "tool_response",
          content: "Image created successfully: https://example.com/image.jpg",
          metadata: { functionName: "create_image" },
        },
        {
          type: "finished",
          content: "I've created your image! The sunset scene turned out beautifully.",
          metadata: {},
        },
      ];

    case "url_analysis":
      return [
        {
          type: "thinking",
          content: "I'll analyze the webpage content for you...",
          metadata: { agentType: "general" },
        },
        {
          type: "tool_execution",
          content: "general executing: read_url",
          metadata: {
            functionName: "read_url",
            toolCallArguments: JSON.stringify({
              url: "https://example.com/article",
            }),
          },
        },
        {
          type: "tool_response",
          content: "Successfully read webpage content",
          metadata: { functionName: "read_url" },
        },
        {
          type: "finished",
          content: "I've analyzed the webpage. Here's a summary of the key points...",
          metadata: {},
        },
      ];

    case "figma_design":
      return [
        {
          type: "thinking",
          content: "Let me fetch your Figma design data...",
          metadata: { agentType: "figma-to-storyblok" },
        },
        {
          type: "tool_execution",
          content: "figma-to-storyblok executing: get_figma_data",
          metadata: {
            functionName: "get_figma_data",
            toolCallArguments: JSON.stringify({
              fileId: "abc123",
              nodeId: "1:2",
            }),
          },
        },
        {
          type: "tool_response",
          content: "Figma data retrieved successfully",
          metadata: { functionName: "get_figma_data" },
        },
        {
          type: "finished",
          content: "I've converted your Figma design into Storyblok components!",
          metadata: {},
        },
      ];

    default:
      return [];
  }
};

export const EnhancedAgentDemo: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<string>("image_generation");
  const [currentAgent, setCurrentAgent] = useState<string>("general");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [dismissedSuggestion, setDismissedSuggestion] = useState<boolean>(false);

  // Get mock messages for current scenario
  const mockMessages = createMockProgressMessages(currentScenario);

  // Use the enhanced progress hook
  const {
    enhancedMessages,
    currentMessage,
    progress,
    phase,
    completedSteps,
    estimatedTimeRemaining,
    hasErrors,
    suggestBetterAgent,
  } = useEnhancedProgress({
    rawMessages: isActive ? mockMessages : [],
    agentType: currentAgent,
    isActive,
  });

  // Get agent suggestion based on user input
  const agentSuggestion = userInput && !dismissedSuggestion ? suggestBetterAgent(userInput) : null;

  // Auto-stop demo after completion
  useEffect(() => {
    if (progress >= 100 && isActive) {
      const timer = setTimeout(() => setIsActive(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, isActive]);

  const scenarios = [
    {
      id: "image_generation",
      name: "Image Generation",
      input: "Create a beautiful sunset image",
    },
    {
      id: "url_analysis",
      name: "URL Analysis",
      input: "Read this webpage for me",
    },
    {
      id: "figma_design",
      name: "Figma Design",
      input: "Convert my Figma design to Storyblok",
    },
  ];

  const agents = [
    { id: "general", name: "General Assistant", icon: "🤖" },
    { id: "figma-to-storyblok", name: "Figma to Storyblok", icon: "🎨" },
    { id: "rephraser", name: "Text Improver", icon: "📝" },
  ];

  const handleStartDemo = () => {
    setIsActive(true);
    setDismissedSuggestion(false);
  };

  const handleStopDemo = () => {
    setIsActive(false);
  };

  const handleScenarioChange = (scenarioId: string) => {
    setCurrentScenario(scenarioId);
    setIsActive(false);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setUserInput(scenario.input);
    }
    setDismissedSuggestion(false);
  };

  const handleAgentChange = (agentId: string) => {
    setCurrentAgent(agentId);
    setIsActive(false);
    setDismissedSuggestion(false);
  };

  const handleAcceptSuggestion = (agentType: string) => {
    setCurrentAgent(agentType);
    setDismissedSuggestion(true);
  };

  const handleDismissSuggestion = () => {
    setDismissedSuggestion(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Enhanced Agent Progress Demo</h2>
        <p className="text-muted-foreground">Experience the new conversational agent progress system</p>
      </div>

      {/* Controls */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Demo Controls</h3>

        {/* Scenario Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scenario:</label>
          <div className="flex gap-2 flex-wrap">
            {scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant={currentScenario === scenario.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleScenarioChange(scenario.id)}
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Agent Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Agent:</label>
          <div className="flex gap-2 flex-wrap">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                variant={currentAgent === agent.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleAgentChange(agent.id)}
              >
                {agent.icon} {agent.name}
              </Button>
            ))}
          </div>
        </div>

        {/* User Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">User Input (for agent suggestions):</label>
          <Input
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setDismissedSuggestion(false);
            }}
            placeholder="Type your request here..."
          />
        </div>

        {/* Demo Controls */}
        <div className="flex gap-2">
          <Button onClick={handleStartDemo} disabled={isActive} className="flex-1">
            {isActive ? "Demo Running..." : "Start Demo"}
          </Button>
          <Button variant="outline" onClick={handleStopDemo} disabled={!isActive}>
            Stop
          </Button>
        </div>
      </Card>

      {/* Agent Suggestion Banner */}
      <AgentSuggestionBanner
        suggestion={agentSuggestion}
        currentAgent={currentAgent}
        onAcceptSuggestion={handleAcceptSuggestion}
        onDismiss={handleDismissSuggestion}
      />

      {/* Progress Indicator */}
      <SmoothProgressIndicator messages={enhancedMessages} agentType={currentAgent} isActive={isActive} />

      {/* Debug Info */}
      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Progress:</span>
            <div className="font-mono">{progress}%</div>
          </div>
          <div>
            <span className="text-muted-foreground">Phase:</span>
            <div className="font-mono">{phase}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Steps:</span>
            <div className="font-mono">{completedSteps}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Time Left:</span>
            <div className="font-mono">{estimatedTimeRemaining}s</div>
          </div>
        </div>

        {currentMessage && (
          <div className="mt-3 pt-3 border-t">
            <span className="text-muted-foreground text-xs">Current Message:</span>
            <div className="text-xs font-mono bg-background p-2 rounded mt-1">
              {currentMessage.userFriendlyContent || currentMessage.content}
            </div>
          </div>
        )}

        {hasErrors && (
          <Badge variant="destructive" className="mt-2">
            Has Errors
          </Badge>
        )}
      </Card>
    </div>
  );
};
