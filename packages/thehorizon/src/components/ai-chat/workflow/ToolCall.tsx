import React from "react";
import { cn } from "@/lib/utils";
import {
  Wrench,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Terminal,
  Code,
  Database,
  Search,
  FileText,
  Globe,
} from "lucide-react";
import { CollapsibleSection } from "../disclosure";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "../animations";
import { fontSize, componentSize, spacing, borders, effects } from "../design-system";

export type ToolStatus = "pending" | "running" | "success" | "error" | "cancelled";

export interface ToolCallProps {
  /** Name of the tool being called */
  toolName: string;
  /** Tool category/type for icon selection */
  toolType?: "code" | "search" | "database" | "file" | "web" | "terminal" | "generic";
  /** Input parameters to the tool */
  input?: Record<string, any> | string;
  /** Output/result from the tool */
  output?: Record<string, any> | string;
  /** Current status of the tool call */
  status?: ToolStatus;
  /** Duration of the tool call in ms */
  duration?: number;
  /** Error message if status is error */
  error?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Whether details are expanded */
  expanded?: boolean;
  /** Callback when expansion changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Show raw JSON for input/output */
  showRaw?: boolean;
  /** Custom className */
  className?: string;
  /** Timestamp when tool was called */
  timestamp?: Date;
}

/**
 * ToolCall - Visualizes tool usage by agents
 *
 * Pure presentational component for showing tool calls
 */
export const ToolCall: React.FC<ToolCallProps> = ({
  toolName,
  toolType = "generic",
  input,
  output,
  status = "pending",
  duration,
  error,
  compact = false,
  expanded = false,
  onExpandedChange,
  showRaw = false,
  className,
  timestamp,
}) => {
  // Icon selection based on tool type
  const getToolIcon = () => {
    switch (toolType) {
      case "code":
        return Code;
      case "search":
        return Search;
      case "database":
        return Database;
      case "file":
        return FileText;
      case "web":
        return Globe;
      case "terminal":
        return Terminal;
      default:
        return Wrench;
    }
  };

  const ToolIcon = getToolIcon();

  // Status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "error":
        return <XCircle className="h-3 w-3 text-destructive" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "text-primary";
      case "success":
        return "text-green-500";
      case "error":
        return "text-destructive";
      case "cancelled":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatData = (data: any) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (showRaw) return JSON.stringify(data, null, 2);

    // Pretty format for common patterns
    if (Array.isArray(data)) {
      return `Array with ${data.length} items`;
    }
    if (typeof data === "object") {
      const keys = Object.keys(data);
      if (keys.length <= 3) {
        return keys.map((k) => `${k}: ${JSON.stringify(data[k])}`).join(", ");
      }
      return `Object with ${keys.length} properties`;
    }
    return String(data);
  };

  // Get tool intent/purpose
  const getToolIntent = () => {
    if (typeof input === "string") return input;
    if (typeof input === "object" && input) {
      // Try to extract the most meaningful field
      if ("task" in input) return input.task;
      if ("query" in input) return input.query;
      if ("prompt" in input) return input.prompt;
      if ("action" in input) return input.action;
      // Show first meaningful value
      const values = Object.values(input).filter((v) => typeof v === "string");
      if (values.length > 0) return values[0];
    }
    if (output && status === "success") {
      return typeof output === "string" ? output.substring(0, 50) + "..." : "Completed";
    }
    return null;
  };

  const intent = getToolIntent();

  // Compact mode - single line with intent
  if (compact) {
    return (
      <div className={cn("flex items-center", spacing.gap.sm, fontSize.body, getStatusColor(), className)}>
        <ToolIcon className={cn(componentSize.icon.sm, "flex-shrink-0")} />
        <span className="flex items-center gap-1 flex-1 min-w-0">
          <span className="font-medium">{toolName}</span>
          {intent && <span className={cn(effects.status.muted, "truncate")}>: {intent}</span>}
        </span>
        {getStatusIcon()}
        {status === "running" && <StatusIndicator text="" status="processing" />}
        {status === "success" && duration && (
          <span className={cn(fontSize.label, effects.status.muted)}>({formatDuration(duration)})</span>
        )}
        {status === "error" && (
          <span className={cn(fontSize.label, effects.status.error, "truncate max-w-[100px]")}>
            {error || "Failed"}
          </span>
        )}
      </div>
    );
  }

  // Full mode with details
  const header = (
    <div className="flex items-center gap-2 text-sm">
      <ToolIcon className={cn("h-3.5 w-3.5", getStatusColor())} />
      <span className="flex-1 flex items-center gap-1">
        <span className="font-medium">{toolName}</span>
        {intent && <span className="text-muted-foreground truncate">: {intent}</span>}
      </span>
      <div className="flex items-center gap-1">
        {status === "running" && <StatusIndicator text="" status="processing" />}
        {getStatusIcon()}
        {duration && status !== "running" && (
          <Badge variant="secondary" className="text-xs h-5">
            {formatDuration(duration)}
          </Badge>
        )}
      </div>
    </div>
  );

  // Simple version without details
  if (!input && !output && !error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md",
          "bg-muted/20 border border-muted-foreground/5",
          className
        )}
      >
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
        status === "error" && "border-destructive/20",
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
        {timestamp && <div className="text-xs text-muted-foreground">Called at {timestamp.toLocaleTimeString()}</div>}

        {/* Input */}
        {input && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Input:</p>
            <Card className="p-2 bg-background/50 border-muted-foreground/5">
              <pre className="text-xs whitespace-pre-wrap break-all font-mono">{formatData(input)}</pre>
            </Card>
          </div>
        )}

        {/* Output or Error */}
        {status === "error" && error ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-destructive">Error:</p>
            <Card className="p-2 bg-destructive/10 border-destructive/20">
              <p className="text-xs text-destructive">{error}</p>
            </Card>
          </div>
        ) : output ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Output:</p>
            <Card className="p-2 bg-background/50 border-muted-foreground/5">
              <pre className="text-xs whitespace-pre-wrap break-all font-mono">{formatData(output)}</pre>
            </Card>
          </div>
        ) : status === "running" ? (
          <div className="text-xs text-muted-foreground italic">Waiting for response...</div>
        ) : null}
      </div>
    </CollapsibleSection>
  );
};
