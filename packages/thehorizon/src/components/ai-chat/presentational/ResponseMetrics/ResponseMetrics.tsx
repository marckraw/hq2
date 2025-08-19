"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Clock,
  Brain,
  Database,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  CheckCircle,
} from "lucide-react";

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: string;
  trend?: "up" | "down" | "neutral";
}

export interface ResponseMetricsProps {
  stepCount?: number;
  duration?: number;
  sources?: number;
  confidence?: number;
  tokens?: number;
  customMetrics?: MetricItem[];
  className?: string;
  animated?: boolean;
  variant?: "inline" | "card" | "detailed";
  showIcons?: boolean;
}

export function ResponseMetrics({
  stepCount,
  duration,
  sources,
  confidence,
  tokens,
  customMetrics = [],
  className,
  animated = true,
  variant = "inline",
  showIcons = true,
}: ResponseMetricsProps) {
  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  const defaultMetrics: MetricItem[] = [
    ...(stepCount !== undefined ? [{
      id: "steps",
      label: "Steps",
      value: stepCount,
      icon: Brain,
      color: "text-purple-500",
    }] : []),
    ...(duration !== undefined ? [{
      id: "duration",
      label: "Time",
      value: formatDuration(duration) || "0s",
      icon: Clock,
      color: "text-blue-500",
    }] : []),
    ...(sources !== undefined ? [{
      id: "sources",
      label: "Sources",
      value: sources,
      icon: Database,
      color: "text-green-500",
    }] : []),
    ...(confidence !== undefined ? [{
      id: "confidence",
      label: "Confidence",
      value: `${confidence}%`,
      icon: TrendingUp,
      color: confidence > 80 ? "text-green-500" : confidence > 60 ? "text-yellow-500" : "text-orange-500",
    }] : []),
    ...(tokens !== undefined ? [{
      id: "tokens",
      label: "Tokens",
      value: tokens.toLocaleString(),
      icon: Zap,
      color: "text-yellow-500",
    }] : []),
    ...customMetrics,
  ];

  if (defaultMetrics.length === 0) return null;

  const Container = animated ? motion.div : "div";
  const ItemContainer = animated ? motion.div : "div";

  const containerVariants = animated ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } : {};

  const itemVariants = animated ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  } : {};

  if (variant === "card") {
    return (
      <Container
        className={cn(
          "rounded-lg border bg-card p-4 space-y-3",
          className
        )}
        {...(animated ? containerVariants : {})}
      >
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Response Metrics</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {defaultMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <ItemContainer
                key={metric.id}
                className="flex items-start gap-2"
                {...(animated ? {
                  ...itemVariants,
                  transition: { delay: index * 0.05 }
                } : {})}
              >
                {showIcons && Icon && (
                  <Icon className={cn("h-4 w-4 mt-0.5", metric.color)} />
                )}
                <div>
                  <div className="text-xs text-muted-foreground">
                    {metric.label}
                  </div>
                  <div className="text-sm font-medium">
                    {metric.value}
                  </div>
                </div>
              </ItemContainer>
            );
          })}
        </div>
      </Container>
    );
  }

  if (variant === "detailed") {
    return (
      <Container
        className={cn(
          "space-y-2",
          className
        )}
        {...(animated ? containerVariants : {})}
      >
        {defaultMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <ItemContainer
              key={metric.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              {...(animated ? {
                ...itemVariants,
                transition: { delay: index * 0.05 }
              } : {})}
            >
              <div className="flex items-center gap-2">
                {showIcons && Icon && (
                  <Icon className={cn("h-4 w-4", metric.color)} />
                )}
                <span className="text-sm text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <Badge variant="secondary" className="font-mono">
                {metric.value}
              </Badge>
            </ItemContainer>
          );
        })}
      </Container>
    );
  }

  // Default inline variant
  return (
    <Container
      className={cn(
        "flex items-center gap-3 text-xs text-muted-foreground",
        className
      )}
      {...(animated ? containerVariants : {})}
    >
      {defaultMetrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <ItemContainer
            key={metric.id}
            className="flex items-center gap-1"
            {...(animated ? {
              ...itemVariants,
              transition: { delay: index * 0.05 }
            } : {})}
          >
            {showIcons && Icon && (
              <Icon className={cn("h-3 w-3", metric.color)} />
            )}
            <span>{metric.label}:</span>
            <span className="font-medium text-foreground">
              {metric.value}
            </span>
          </ItemContainer>
        );
      })}
    </Container>
  );
}