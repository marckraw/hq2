"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Coins, 
  Zap, 
  Timer,
  RotateCcw,
  Link,
  Database,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ApprovalMetadataProps {
  metadata: {
    cost?: {
      tokens?: number;
      apiCalls?: number;
      estimatedTime?: string;
      estimatedPrice?: number;
    };
    rollback?: boolean;
    dependencies?: string[];
  };
  className?: string;
  showDetails?: boolean;
}

export function ApprovalMetadata({
  metadata,
  className,
  showDetails = true,
}: ApprovalMetadataProps) {
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  };

  const metadataItems = [
    {
      condition: metadata.cost?.tokens,
      icon: <Coins className="h-3 w-3" />,
      label: "Tokens",
      value: metadata.cost?.tokens ? formatTokens(metadata.cost.tokens) : null,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      condition: metadata.cost?.apiCalls,
      icon: <Zap className="h-3 w-3" />,
      label: "API Calls",
      value: metadata.cost?.apiCalls,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      condition: metadata.cost?.estimatedTime,
      icon: <Timer className="h-3 w-3" />,
      label: "Est. Time",
      value: metadata.cost?.estimatedTime,
      color: "text-green-600 dark:text-green-400",
    },
    {
      condition: metadata.cost?.estimatedPrice,
      icon: <DollarSign className="h-3 w-3" />,
      label: "Est. Cost",
      value: metadata.cost?.estimatedPrice ? formatPrice(metadata.cost.estimatedPrice) : null,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      condition: metadata.rollback !== undefined,
      icon: <RotateCcw className="h-3 w-3" />,
      label: "Rollback",
      value: metadata.rollback ? "Available" : "Not available",
      color: metadata.rollback ? "text-green-600 dark:text-green-400" : "text-gray-500",
    },
  ];

  const activeItems = metadataItems.filter(item => item.condition);

  if (activeItems.length === 0 && (!metadata.dependencies || metadata.dependencies.length === 0)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "border-t pt-3 space-y-2",
        className
      )}
    >
      {activeItems.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {activeItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-1.5"
            >
              <div className={cn("flex items-center gap-1", item.color)}>
                {item.icon}
                {showDetails && (
                  <span className="text-xs font-medium">{item.label}:</span>
                )}
              </div>
              <Badge 
                variant="secondary" 
                className="text-xs h-5 px-1.5"
              >
                {item.value}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {metadata.dependencies && metadata.dependencies.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link className="h-3 w-3" />
            <span className="font-medium">Dependencies:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {metadata.dependencies.map((dep, index) => (
              <motion.div
                key={dep}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge 
                  variant="outline" 
                  className="text-xs h-5 px-1.5"
                >
                  {dep}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {metadata.cost?.estimatedPrice && metadata.cost.estimatedPrice > 0.1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400"
        >
          <Database className="h-3 w-3" />
          <span>This action will consume resources</span>
        </motion.div>
      )}
    </motion.div>
  );
}