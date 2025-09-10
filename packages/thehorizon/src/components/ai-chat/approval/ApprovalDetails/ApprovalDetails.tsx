"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  ChevronUp, 
  AlertTriangle, 
  GitCompare, 
  Lightbulb,
  Code,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface ApprovalDetailsProps {
  details?: {
    before?: string | React.ReactNode;
    after?: string | React.ReactNode;
    changes?: string[];
    risks?: string[];
    alternatives?: Array<{
      title: string;
      description: string;
      confidence: number;
    }>;
  };
  onCollapse: () => void;
  className?: string;
}

export function ApprovalDetails({
  details,
  onCollapse,
  className,
}: ApprovalDetailsProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [selectedTab, setSelectedTab] = useState("changes");

  if (!details) {
    return null;
  }

  const hasComparison = details.before || details.after;
  const hasChanges = details.changes && details.changes.length > 0;
  const hasRisks = details.risks && details.risks.length > 0;
  const hasAlternatives = details.alternatives && details.alternatives.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRaw(!showRaw)}
            className="h-7 px-2 text-xs"
          >
            {showRaw ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide Raw
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show Raw
              </>
            )}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="h-7 px-2 text-xs"
        >
          <ChevronUp className="h-3 w-3 mr-1" />
          Collapse
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="changes" className="text-xs">Changes</TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs">Compare</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">
            Risks
            {hasRisks && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {details.risks!.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="text-xs">Alt</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="mt-3"
          >
            <TabsContent value="changes" className="mt-0 space-y-2">
              {hasChanges ? (
                <div className="space-y-1">
                  {details.changes!.map((change, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Code className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{change}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specific changes listed</p>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              {hasComparison ? (
                <div className="grid grid-cols-2 gap-2">
                  <Card className="p-2">
                    <div className="text-xs font-medium mb-1 text-muted-foreground">Before</div>
                    <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                      {showRaw && typeof details.before === "string" ? (
                        <pre className="whitespace-pre-wrap">{details.before}</pre>
                      ) : (
                        <div>{details.before || "Current state"}</div>
                      )}
                    </div>
                  </Card>
                  <Card className="p-2">
                    <div className="text-xs font-medium mb-1 text-muted-foreground">After</div>
                    <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                      {showRaw && typeof details.after === "string" ? (
                        <pre className="whitespace-pre-wrap">{details.after}</pre>
                      ) : (
                        <div>{details.after || "Proposed state"}</div>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitCompare className="h-4 w-4" />
                  <span>No comparison available</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="risks" className="mt-0">
              {hasRisks ? (
                <div className="space-y-2">
                  {details.risks!.map((risk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{risk}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No significant risks identified</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alternatives" className="mt-0">
              {hasAlternatives ? (
                <div className="space-y-2">
                  {details.alternatives!.map((alt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs font-medium">{alt.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alt.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {alt.confidence}%
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span>No alternatives suggested</span>
                </div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}