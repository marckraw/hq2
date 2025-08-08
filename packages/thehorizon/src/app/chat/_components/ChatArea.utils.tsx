import React from "react";
import {
  Search,
  Image,
  FileText,
  Lightbulb,
  Database,
  PenTool,
  FileEdit,
  Type,
  Eye,
  Figma,
  MessageCircle,
  Blocks,
  Settings,
  Layout,
  Layers,
  Code,
  Wrench,
  TestTube,
  RefreshCw,
  RotateCcw,
  Zap,
  Clock,
  Brain,
  Bot,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Hourglass,
  Rocket,
  Crown,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import type { TimelineItem, Message } from "./ChatInterface.types";
import { cn } from "@/lib/utils";
import { RenderMarkdown } from "@/components/RenderMarkdown/RenderMarkdown";
import { TooltipProvider } from "@/components/ui/tooltip";
import { transformTextToMentions } from "./EnhancedEditor";
import type { SuggestionItem } from "./EnhancedEditor";
import { Button } from "@/components/ui/button";

type Model = {
  id: string;
  name: string;
  description: string;
  speed: "very slow" | "slow" | "medium" | "fast" | "very fast";
  intelligence: "low" | "medium" | "high" | "highest";
};

export const MODELS: Model[] = [
  {
    id: "gpt-4.1-2025-04-14",
    name: "GPT-4.1",
    description: "Flagship GPT model for complex tasks.",
    speed: "medium",
    intelligence: "high",
  },
  {
    id: "gpt-4.1-mini-2025-04-14",
    name: "GPT-4.1 mini",
    description: "Balanced for intelligence, speed, and cost.",
    speed: "fast",
    intelligence: "medium",
  },
  {
    id: "gpt-4.1-nano-2025-04-14",
    name: "GPT-4.1 nano",
    description: "Fastest, most cost-effective GPT-4.1 model.",
    speed: "very fast",
    intelligence: "low",
  },
  {
    id: "gpt-4o-2024-08-06",
    name: "GPT-4o",
    description: "Fast, intelligent, flexible GPT model.",
    speed: "medium",
    intelligence: "high",
  },
  {
    id: "o4-mini-2025-04-16",
    name: "o4-mini",
    description: "Faster, more affordable reasoning model.",
    speed: "medium",
    intelligence: "high",
  },
  {
    id: "o3-2025-04-16",
    name: "o3",
    description: "Our most powerful reasoning model",
    speed: "very slow",
    intelligence: "highest",
  },
];

export const EXAMPLE_PROMPTS = [
  {
    icon: "✍️",
    title: "Write a to-do list",
    description: "for a personal project or task",
    prompt:
      "Help me create a comprehensive to-do list for organizing my home office space",
  },
  {
    icon: "📧",
    title: "Generate an email",
    description: "to job offer or business inquiry",
    prompt:
      "Write a professional email accepting a job offer with gratitude and enthusiasm",
  },
  {
    icon: "🤖",
    title: "How does AI work",
    description: "in a technical capacity",
    prompt:
      "Explain how artificial intelligence works from a technical perspective, focusing on neural networks",
  },
  {
    icon: "💡",
    title: "Brainstorm ideas",
    description: "for creative projects",
    prompt:
      "Help me brainstorm innovative ideas for a sustainable technology startup",
  },
];

export const getCapabilityIcon = (capability: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    web_search: <Search className="h-3 w-3" />,
    image_generation: <Image className="h-3 w-3" />,
    file_analysis: <FileText className="h-3 w-3" />,
    planning: <Lightbulb className="h-3 w-3" />,
    memory_search: <Database className="h-3 w-3" />,
    writing: <PenTool className="h-3 w-3" />,
    summarizing: <FileEdit className="h-3 w-3" />,
    content_creation: <Type className="h-3 w-3" />,
    text_refinement: <RefreshCw className="h-3 w-3" />,
    text_rephrasing: <RotateCcw className="h-3 w-3" />,
    clarity_improvement: <Eye className="h-3 w-3" />,
    design_analysis: <Figma className="h-3 w-3" />,
    figma_integration: <Figma className="h-3 w-3" />,
    ui_ux_feedback: <MessageCircle className="h-3 w-3" />,
    storyblok_components: <Blocks className="h-3 w-3" />,
    cms_management: <Settings className="h-3 w-3" />,
    content_structure: <Layout className="h-3 w-3" />,
    layout_design: <Layout className="h-3 w-3" />,
    architecture_planning: <Layers className="h-3 w-3" />,
    design_systems: <Layers className="h-3 w-3" />,
    openrouter_models: <Brain className="h-3 w-3" />,
    experimental_features: <TestTube className="h-3 w-3" />,
    model_testing: <TestTube className="h-3 w-3" />,
    design_to_code: <Code className="h-3 w-3" />,
    component_generation: <Wrench className="h-3 w-3" />,
  };

  return iconMap[capability] || <Wrench className="h-3 w-3" />;
};

export const formatCapabilityText = (capability: string) => {
  return capability
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getSpeedIcon = (speed: string) => {
  const speedIconMap: Record<string, React.ReactNode> = {
    "very fast": <Rocket className="h-3 w-3 text-green-500" />,
    fast: <Zap className="h-3 w-3 text-green-500" />,
    medium: <Clock className="h-3 w-3 text-yellow-500" />,
    slow: <Brain className="h-3 w-3 text-blue-500" />,
    "very slow": <Hourglass className="h-3 w-3 text-red-500" />,
  };
  return speedIconMap[speed] || <Clock className="h-3 w-3" />;
};

export const getIntelligenceIcon = (intelligence: string) => {
  const intelligenceIconMap: Record<string, React.ReactNode> = {
    highest: <Crown className="h-3 w-3 text-purple-500" />,
    high: <Brain className="h-3 w-3 text-purple-500" />,
    medium: <Lightbulb className="h-3 w-3 text-orange-500" />,
    low: <Wrench className="h-3 w-3 text-gray-500" />,
  };
  return intelligenceIconMap[intelligence] || <Lightbulb className="h-3 w-3" />;
};

export const getModelTypeIcon = (modelId: string) => {
  if (modelId.includes("gpt")) {
    return <Bot className="h-3 w-3 text-green-600" />;
  } else if (modelId.includes("claude")) {
    return <Brain className="h-3 w-3 text-orange-600" />;
  }
  return <Sparkles className="h-3 w-3 text-blue-600" />;
};

export const formatSpeedText = (speed: string) => {
  const speedDescriptions: Record<string, string> = {
    "very fast": "Very Fast",
    fast: "Fast Response",
    medium: "Medium Speed",
    slow: "Slower but Thorough",
    "very slow": "Very Slow",
  };
  return speedDescriptions[speed] || speed;
};

export const formatIntelligenceText = (intelligence: string) => {
  const intelligenceDescriptions: Record<string, string> = {
    highest: "Highest Intelligence",
    high: "High Intelligence",
    medium: "Medium Intelligence",
    low: "Basic Intelligence",
  };
  return intelligenceDescriptions[intelligence] || intelligence;
};

export const getModelTypeText = (modelId: string) => {
  if (modelId.includes("gpt")) {
    return "OpenAI Model";
  } else if (modelId.includes("claude")) {
    return "Anthropic Model";
  }
  return "AI Model";
};

type ExecutionGroup = {
  type: "execution_group";
  executionId: number;
  agentType: string;
  autonomousMode: boolean;
  triggeringMessageId: number | null;
  steps: any[];
  timestamp: string;
};

export const groupExecutionSteps = (
  timeline: TimelineItem[]
): (TimelineItem | ExecutionGroup)[] => {
  const grouped: (TimelineItem | ExecutionGroup)[] = [];
  const executionGroups = new Map<number, ExecutionGroup>();
  const nonExecutionItems: TimelineItem[] = [];

  timeline.forEach((item) => {
    if (item.type === "execution_step") {
      const executionId = item.data.execution.id;
      if (!executionGroups.has(executionId)) {
        executionGroups.set(executionId, {
          type: "execution_group",
          executionId,
          agentType: item.data.execution.agentType,
          autonomousMode: item.data.execution.autonomousMode,
          triggeringMessageId: item.data.execution.triggeringMessageId,
          steps: [],
          timestamp: item.timestamp,
        });
      }
      executionGroups.get(executionId)!.steps.push(item.data);
    } else {
      nonExecutionItems.push(item);
    }
  });

  const sortedExecutionGroups = Array.from(executionGroups.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  nonExecutionItems.forEach((item) => {
    grouped.push(item);
    if (item.type === "message") {
      const messageId = parseInt(item.data.id);
      const relatedExecution = sortedExecutionGroups.find(
        (exec) => exec.triggeringMessageId === messageId
      );

      if (relatedExecution) {
        grouped.push(relatedExecution);
        const index = sortedExecutionGroups.indexOf(relatedExecution);
        if (index > -1) {
          sortedExecutionGroups.splice(index, 1);
        }
      }
    }
  });
  return [...grouped, ...sortedExecutionGroups];
};

export const renderTimelineItem = (
  item: TimelineItem | ExecutionGroup,
  index: number,
  allItems: (TimelineItem | ExecutionGroup)[],
  isLoading: boolean,
  MentionWithTooltip: React.FC<{ mention: string; fullText: string }>,
  snippets: SuggestionItem[],
  ttsActions?: {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    isLoading: boolean;
    currentText: string | null;
  }
) => {
  console.log("[renderTimelineItem] item", item);
  if (item.type === "message") {
    const message = (item as TimelineItem).data as Message;
    const isLastUserMessage =
      message.role === "user" &&
      index === (allItems.length || 0) - 1 &&
      isLoading;

    return (
      <div
        key={`message-${message.id}`}
        className={cn(
          "group relative animate-in fade-in duration-300",
          message.role === "user"
            ? "ml-auto max-w-[80%] slide-in-from-right"
            : message.metadata?.type === "memory_notification"
            ? "mr-auto max-w-[70%] slide-in-from-left"
            : "mr-auto max-w-[80%] slide-in-from-left"
        )}
      >
        {message.metadata?.type === "memory_notification" ? (
          <div className="rounded-lg px-4 py-3 bg-blue-50 border border-blue-200 text-blue-800">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">🧠</span>
              <span className="font-medium">Updated saved memory</span>
            </div>
            <div className="text-sm mt-1 text-blue-700">
              {message.content.replace("💾 Saved: ", "")}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg px-4 py-3 transition-all duration-200 hover:scale-[1.02]",
              message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted/50"
            )}
          >
            {message.role === "assistant" || message.role === "tool" ? (
              <RenderMarkdown>{message.content || "..."}</RenderMarkdown>
            ) : (
              <TooltipProvider>
                <div className="whitespace-pre-wrap">
                  {transformTextToMentions(
                    message.content,
                    (props) => (
                      <MentionWithTooltip {...props} />
                    ),
                    snippets
                  )}
                </div>
              </TooltipProvider>
            )}
          </div>
        )}

        {message.role === "assistant" && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigator.clipboard.writeText(message.content)}
              title="Copy message"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {ttsActions && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => {
                  if (
                    ttsActions.isPlaying &&
                    ttsActions.currentText === message.content
                  ) {
                    ttsActions.stop();
                  } else {
                    ttsActions.speak(message.content);
                  }
                }}
                title={
                  ttsActions.isPlaying &&
                  ttsActions.currentText === message.content
                    ? "Stop speaking"
                    : "Read aloud"
                }
                disabled={ttsActions.isLoading}
              >
                {ttsActions.isLoading &&
                ttsActions.currentText === message.content ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : ttsActions.isPlaying &&
                  ttsActions.currentText === message.content ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              title="Good response"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              title="Poor response"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              title="Regenerate response"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  } else if (item.type === "execution_step") {
    return null;
  }
  return null;
};
