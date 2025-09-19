"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { useAvailableAgents } from "@/hooks/useAvailableAgents";
import { ensureAllowedAgent, getAllowedAgents } from "@/lib/entitlements";

type AgentType = "general" | "sonoma" | "health-coach" | (string & {});

export function AgentSelector({
  value,
  onChange,
  className,
}: {
  value: AgentType;
  onChange: (v: AgentType) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const availableAgents = useAvailableAgents() as AgentType[];
  const allowedAgents = useMemo(
    () => getAllowedAgents(session ?? null, availableAgents) as AgentType[],
    [session, availableAgents]
  );

  // Ensure currently selected value remains allowed; otherwise, force to a safe default
  const safeValue = useMemo(
    () => ensureAllowedAgent(session ?? null, value, availableAgents) as AgentType,
    [session, value, availableAgents]
  );
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="opacity-60 hover:opacity-100">
            Agent:{" "}
            {safeValue === "general"
              ? "General"
              : safeValue === "sonoma"
                ? "Sonoma"
                : safeValue === "health-coach"
                  ? "Health Coach"
                  : safeValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-1">
          {allowedAgents.map((type) => (
            <button
              key={type}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange(type);
                setOpen(false);
              }}
            >
              {type === "general"
                ? "General"
                : type === "sonoma"
                  ? "Sonoma"
                  : type === "health-coach"
                    ? "Health Coach"
                    : type}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
