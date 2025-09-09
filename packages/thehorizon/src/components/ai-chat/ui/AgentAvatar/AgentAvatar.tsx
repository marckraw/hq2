import React from "react";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  Clock, 
  Shield, 
  Zap, 
  Brain, 
  Send,
  Sparkles,
  Code,
  Eye,
  Cpu
} from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  status?: "active" | "idle" | "offline";
  capabilities?: string[];
  color?: string;
  icon?: React.ElementType;
  description?: string;
}

export interface AgentAvatarProps {
  /** Agent information */
  agent?: Agent;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg";
  /** Whether to show a ring around the avatar */
  showRing?: boolean;
  /** Whether to animate on mount */
  animate?: boolean;
  /** Custom className */
  className?: string;
  /** Whether to show online indicator */
  isOnline?: boolean;
  /** Whether the agent is currently active/typing */
  isActive?: boolean;
}

// Default agents based on your system
export const DEFAULT_AGENTS: Record<string, Agent> = {
  chronos: {
    id: "chronos",
    name: "Chronos",
    role: "Time & scheduling specialist",
    color: "bg-blue-500",
    icon: Clock,
    description: "Time & scheduling specialist",
    status: "active",
    capabilities: ["scheduling", "time-management", "reminders"]
  },
  valkyrie: {
    id: "valkyrie",
    name: "Valkyrie",
    role: "Code & development expert",
    color: "bg-purple-500",
    icon: Code,
    description: "Code & development expert",
    status: "active",
    capabilities: ["coding", "debugging", "architecture"]
  },
  odin: {
    id: "odin",
    name: "Odin",
    role: "Architecture & strategy",
    color: "bg-amber-500",
    icon: Brain,
    description: "Architecture & strategy",
    status: "active",
    capabilities: ["planning", "architecture", "strategy"]
  },
  heimdall: {
    id: "heimdall",
    name: "Heimdall",
    role: "Monitoring & observation",
    color: "bg-green-500",
    icon: Eye,
    description: "Monitoring & observation",
    status: "active",
    capabilities: ["monitoring", "alerting", "observation"]
  },
  hermes: {
    id: "hermes",
    name: "Hermes",
    role: "Communication & messaging",
    color: "bg-cyan-500",
    icon: Send,
    description: "Communication & messaging",
    status: "active",
    capabilities: ["messaging", "notifications", "communication"]
  },
  general: {
    id: "general",
    name: "Assistant",
    role: "General purpose AI",
    color: "bg-primary",
    icon: Sparkles,
    description: "General purpose AI",
    status: "active",
    capabilities: ["general", "assistance", "analysis"]
  }
};

/**
 * AgentAvatar - A pure presentational component for displaying agent avatars
 * 
 * Displays agent-specific avatars with colors, icons, and status indicators
 */
export const AgentAvatar = React.forwardRef<HTMLDivElement, AgentAvatarProps>(
  (
    {
      agent,
      size = "md",
      showRing = false,
      animate = false,
      className,
      isOnline = false,
      isActive = false,
    },
    ref
  ) => {
    // Size configurations
    const sizeConfig = {
      xs: {
        container: "w-6 h-6",
        icon: "w-3 h-3",
        ring: "ring-1",
        indicator: "w-1.5 h-1.5",
        text: "text-[10px]"
      },
      sm: {
        container: "w-8 h-8",
        icon: "w-4 h-4",
        ring: "ring-2",
        indicator: "w-2 h-2",
        text: "text-xs"
      },
      md: {
        container: "w-10 h-10",
        icon: "w-5 h-5",
        ring: "ring-2",
        indicator: "w-2.5 h-2.5",
        text: "text-sm"
      },
      lg: {
        container: "w-12 h-12",
        icon: "w-6 h-6",
        ring: "ring-2",
        indicator: "w-3 h-3",
        text: "text-base"
      }
    };

    const config = sizeConfig[size];
    const agentData = agent || DEFAULT_AGENTS.general;
    const Icon = agentData.icon || Bot;

    // Get color classes
    const getColorClasses = () => {
      // Check if color exists and is a string
      if (agentData.color && typeof agentData.color === 'string' && agentData.color.startsWith("bg-")) {
        return {
          background: agentData.color,
          text: agentData.color.replace("bg-", "text-")
        };
      }
      // Otherwise, use CSS variable approach
      return {
        background: "bg-primary",
        text: "text-primary"
      };
    };

    const colors = getColorClasses();

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex",
          animate && "animate-in fade-in-50 zoom-in-90 duration-200",
          className
        )}
      >
        {/* Main avatar */}
        <div
          className={cn(
            "rounded-full flex items-center justify-center transition-all duration-200",
            config.container,
            colors.background,
            "text-white",
            showRing && cn(config.ring, "ring-offset-2 ring-offset-background", colors.text.replace("text-", "ring-")),
            isActive && "animate-pulse",
            "hover:scale-105"
          )}
        >
          <Icon className={cn(config.icon)} />
        </div>

        {/* Online indicator */}
        {isOnline && (
          <div
            className={cn(
              "absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-background",
              config.indicator,
              isActive && "animate-pulse"
            )}
          />
        )}

        {/* Active/typing indicator */}
        {isActive && (
          <div className="absolute -bottom-1 -right-1">
            <div className="flex space-x-0.5">
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>
    );
  }
);

AgentAvatar.displayName = "AgentAvatar";

/**
 * AgentBadge - A small badge showing agent name and status
 */
export interface AgentBadgeProps {
  agent: Agent;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const AgentBadge: React.FC<AgentBadgeProps> = ({
  agent,
  showIcon = true,
  size = "sm",
  className
}) => {
  const Icon = agent?.icon || Bot;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5"
  };

  const getColorClasses = () => {
    if (agent?.color && typeof agent.color === 'string' && agent.color.startsWith("bg-")) {
      return {
        background: agent.color.replace("bg-", "bg-") + "/10",
        text: agent.color.replace("bg-", "text-"),
        border: agent.color.replace("bg-", "border-")
      };
    }
    return {
      background: "bg-primary/10",
      text: "text-primary",
      border: "border-primary"
    };
  };

  const colors = getColorClasses();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        sizeClasses[size],
        colors.background,
        colors.text,
        colors.border + "/20",
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      <span>{agent?.name || 'Agent'}</span>
    </div>
  );
};