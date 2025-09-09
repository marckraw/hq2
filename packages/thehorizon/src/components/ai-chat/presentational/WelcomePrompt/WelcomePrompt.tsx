"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Bot, 
  Brain, 
  Zap,
  AlertCircle,
  Loader2,
  MessageSquare
} from "lucide-react";

export type WelcomePromptVariant = "welcome" | "empty" | "error" | "loading";

export interface Suggestion {
  id: string;
  text: string;
  icon?: React.ElementType;
  category?: string;
}

export interface WelcomePromptProps {
  title?: string;
  subtitle?: string;
  suggestions?: Suggestion[];
  onSuggestionClick?: (suggestion: Suggestion) => void;
  variant?: WelcomePromptVariant;
  icon?: React.ElementType;
  className?: string;
  animated?: boolean;
  compact?: boolean;
}

const defaultSuggestions: Suggestion[] = [
  { id: "1", text: "Explain quantum computing", icon: Brain },
  { id: "2", text: "Write a Python script", icon: Zap },
  { id: "3", text: "Analyze this data", icon: Bot },
  { id: "4", text: "Help with creative writing", icon: MessageSquare },
];

const variantConfig = {
  welcome: {
    defaultIcon: Sparkles,
    defaultTitle: "How can I help you today?",
    defaultSubtitle: "Just type your question below and I'll help you find the answer.",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  empty: {
    defaultIcon: MessageSquare,
    defaultTitle: "Start a conversation",
    defaultSubtitle: "Ask me anything or choose from the suggestions below.",
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
  },
  error: {
    defaultIcon: AlertCircle,
    defaultTitle: "Something went wrong",
    defaultSubtitle: "Please try again or contact support if the problem persists.",
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  loading: {
    defaultIcon: Loader2,
    defaultTitle: "Loading...",
    defaultSubtitle: "Please wait while we set things up.",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
};

export function WelcomePrompt({
  title,
  subtitle,
  suggestions = defaultSuggestions,
  onSuggestionClick,
  variant = "welcome",
  icon,
  className,
  animated = true,
  compact = false,
}: WelcomePromptProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.defaultIcon;
  const displayTitle = title || config.defaultTitle;
  const displaySubtitle = subtitle || config.defaultSubtitle;

  const containerVariants = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } : {};

  const itemVariants = animated ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  } : {};

  const Container = animated ? motion.div : "div";
  const ItemContainer = animated ? motion.div : "div";

  return (
    <Container
      className={cn(
        "flex flex-col items-center justify-center text-center",
        !compact && "min-h-[400px]",
        compact && "py-8",
        className
      )}
      {...(animated ? containerVariants : {})}
    >
      <ItemContainer
        className={cn(
          "rounded-full p-3 mb-4",
          config.iconBg
        )}
        {...(animated ? {
          ...itemVariants,
          transition: { delay: 0.1 }
        } : {})}
      >
        <Icon className={cn(
          "h-6 w-6",
          config.iconColor,
          variant === "loading" && "animate-spin"
        )} />
      </ItemContainer>

      <ItemContainer
        {...(animated ? {
          ...itemVariants,
          transition: { delay: 0.2 }
        } : {})}
      >
        <h2 className={cn(
          "font-medium mb-2",
          compact ? "text-base" : "text-lg"
        )}>
          {displayTitle}
        </h2>
      </ItemContainer>

      <ItemContainer
        {...(animated ? {
          ...itemVariants,
          transition: { delay: 0.3 }
        } : {})}
      >
        <p className={cn(
          "text-muted-foreground max-w-md",
          compact ? "text-xs mb-4" : "text-sm mb-6"
        )}>
          {displaySubtitle}
        </p>
      </ItemContainer>

      {variant !== "loading" && suggestions.length > 0 && (
        <ItemContainer
          className="flex flex-wrap gap-2 justify-center"
          {...(animated ? {
            ...itemVariants,
            transition: { delay: 0.4 }
          } : {})}
        >
          {suggestions.map((suggestion, index) => {
            const SuggestionIcon = suggestion.icon;
            return (
              <motion.div
                key={suggestion.id}
                {...(animated ? {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.4 + index * 0.05 }
                } : {})}
              >
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className={cn(
                    "text-xs gap-1.5",
                    animated && "transition-all hover:scale-105"
                  )}
                  disabled={variant === "error"}
                >
                  {SuggestionIcon && <SuggestionIcon className="h-3 w-3" />}
                  <span>{suggestion.text}</span>
                  {suggestion.category && (
                    <span className="text-muted-foreground ml-1">
                      • {suggestion.category}
                    </span>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </ItemContainer>
      )}
    </Container>
  );
}