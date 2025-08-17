import React from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  GitBranch, 
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { CollapsibleSection } from "../disclosure";
import { Badge } from "@/components/ui/badge";
import { AgentAvatar, DEFAULT_AGENTS } from "../ui/AgentAvatar";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export interface RouteDecision {
  /** Why this agent was chosen */
  reason: string;
  /** Confidence score 0-100 */
  confidence?: number;
  /** Alternative agents considered */
  alternatives?: Array<{
    agentId: string;
    agentName: string;
    reason: string;
    confidence?: number;
  }>;
}

export interface AgentRouterProps {
  /** Source agent ID/name */
  fromAgent?: string;
  /** Target agent ID/name */
  toAgent: string;
  /** Routing decision details */
  decision?: RouteDecision;
  /** Status of the routing */
  status?: "pending" | "routing" | "complete" | "error";
  /** Whether this is a handoff vs delegation */
  type?: "handoff" | "delegation" | "escalation";
  /** Compact mode */
  compact?: boolean;
  /** Whether details are expanded */
  expanded?: boolean;
  /** Callback when expansion changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Custom className */
  className?: string;
  /** Timestamp of routing */
  timestamp?: Date;
}

/**
 * AgentRouter - Visualizes agent routing/handoff decisions
 * 
 * Pure presentational component for showing agent transitions
 */
export const AgentRouter: React.FC<AgentRouterProps> = ({
  fromAgent,
  toAgent,
  decision,
  status = "complete",
  type = "handoff",
  compact = false,
  expanded = false,
  onExpandedChange,
  className,
  timestamp,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case "delegation": return GitBranch;
      case "escalation": return AlertCircle;
      default: return ArrowRight;
    }
  };

  const TypeIcon = getTypeIcon();

  const getTypeLabel = () => {
    switch (type) {
      case "delegation": return "Delegating to";
      case "escalation": return "Escalating to";
      default: return "Routing to";
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    const variant = confidence >= 80 ? "default" : 
                   confidence >= 60 ? "secondary" : 
                   "outline";
    
    return (
      <Badge variant={variant} className="text-xs">
        {confidence}% confidence
      </Badge>
    );
  };

  // Get agent info from DEFAULT_AGENTS if available
  const fromAgentInfo = fromAgent ? DEFAULT_AGENTS[fromAgent.toLowerCase()] : null;
  const toAgentInfo = DEFAULT_AGENTS[toAgent.toLowerCase()];

  // Get routing intent
  const getRoutingIntent = () => {
    if (decision?.reason) {
      // Truncate reason to show intent
      const reason = decision.reason;
      if (reason.length > 60) {
        return reason.substring(0, 60) + "...";
      }
      return reason;
    }
    return `${getTypeLabel()} ${toAgent}`;
  };

  const intent = getRoutingIntent();

  // Compact mode
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm",
        status === "routing" && "text-primary",
        status === "error" && "text-destructive",
        className
      )}>
        <TypeIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex items-center gap-1 flex-1 min-w-0">
          {fromAgent && (
            <>
              <span className="font-medium">{fromAgent}</span>
              <span className="text-muted-foreground">→</span>
            </>
          )}
          <span className="font-medium">{toAgent}</span>
          <span className="text-muted-foreground truncate">: {intent}</span>
        </span>
        {decision?.confidence && decision.confidence >= 80 && (
          <Badge variant="outline" className="text-xs h-5">
            {decision.confidence}%
          </Badge>
        )}
      </div>
    );
  }

  // Full mode header
  const header = (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1 flex-1">
        {fromAgentInfo ? (
          <AgentAvatar agent={fromAgentInfo} size="xs" showName={false} />
        ) : fromAgent ? (
          <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-[10px]">{fromAgent[0]}</span>
          </div>
        ) : null}
        
        <TypeIcon className={cn(
          "h-3.5 w-3.5",
          status === "routing" && "animate-pulse text-primary"
        )} />
        
        {toAgentInfo ? (
          <AgentAvatar agent={toAgentInfo} size="xs" showName={false} />
        ) : (
          <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-[10px]">{toAgent[0]}</span>
          </div>
        )}
        
        <span className="flex items-center gap-1">
          <span className="font-medium">{toAgent}</span>
          <span className="text-muted-foreground truncate">: {intent}</span>
        </span>
      </div>
      
      {decision?.confidence && (
        <Badge variant="outline" className="text-xs h-5">
          {decision.confidence}%
        </Badge>
      )}
      
      {status === "routing" && (
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
      )}
    </div>
  );

  // Simple version without decision details
  if (!decision) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-md",
        "bg-muted/20 border border-muted-foreground/5",
        className
      )}>
        {header}
      </div>
    );
  }

  return (
    <CollapsibleSection
      title={header}
      open={expanded}
      onOpenChange={onExpandedChange}
      className={cn(
        "rounded-md border border-muted-foreground/5 bg-muted/20",
        className
      )}
      headerClassName="p-2 hover:bg-muted/30"
      contentClassName="px-2 pb-2"
      showIcon={true}
      closedIcon={ChevronRight}
      openIcon={ChevronDown}
    >
      <div className="space-y-2">
        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString()}
          </div>
        )}

        {/* Primary Reason */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Reason:</p>
          <Card className="p-2 bg-background/50 border-muted-foreground/5">
            <p className="text-xs">{decision.reason}</p>
          </Card>
        </div>

        {/* Alternative Agents Considered */}
        {decision.alternatives && decision.alternatives.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Also considered:
            </p>
            <div className="space-y-1">
              {decision.alternatives.map((alt, index) => (
                <motion.div
                  key={alt.agentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-1.5 bg-background/30 border-muted-foreground/5">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {DEFAULT_AGENTS[alt.agentId.toLowerCase()] ? (
                          <AgentAvatar 
                            agent={DEFAULT_AGENTS[alt.agentId.toLowerCase()]} 
                            size="xs" 
                            showName={false}
                          />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-[10px]">{alt.agentName[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium">{alt.agentName}</p>
                          <p className="text-[10px] text-muted-foreground">{alt.reason}</p>
                        </div>
                      </div>
                      {alt.confidence && (
                        <Badge variant="outline" className="text-[10px] h-4 shrink-0">
                          {alt.confidence}%
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};