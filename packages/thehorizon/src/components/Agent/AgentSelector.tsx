import { useState } from "react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentOption {
  id: string;
  type:
    | "general"
    | "test-openrouter"
    | "scribe"
    | "rephraser"
    | "figma-analyzer"
    | "figma-to-storyblok"
    | "storyblok-editor"
    | "orchestrator";
  name: string;
  description: string;
  capabilities: string[];
  icon: string;
}

interface AgentSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  agents: AgentOption[];
  disabled: boolean;
}

export const AgentSelector = ({
  value,
  onValueChange,
  agents,
  disabled,
}: AgentSelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedAgent = agents.find((agent) => agent.type === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[2.5rem] p-3"
          disabled={disabled}
        >
          {selectedAgent ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-base">{selectedAgent.icon}</span>
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-sm text-foreground">
                  {selectedAgent.name}
                </span>
                <span className="text-xs text-muted-foreground/80 dark:text-muted-foreground truncate max-w-full">
                  {selectedAgent.description}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground/70 dark:text-muted-foreground">
              {disabled ? "Loading agents..." : "Search for an agent..."}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          onKeyDown={(e) => {
            // Prevent Enter key from propagating to parent form
            if (e.key === "Enter") {
              e.stopPropagation();
            }
          }}
        >
          <CommandInput placeholder="Search agents..." />
          <CommandList>
            <CommandEmpty>No agents found.</CommandEmpty>
            <CommandGroup>
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.type}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === agent.type ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-base">{agent.icon}</span>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground">
                        {agent.name}
                      </span>
                      <span className="text-xs text-muted-foreground/90 dark:text-muted-foreground">
                        {agent.description}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.capabilities.slice(0, 3).map((capability) => (
                          <span
                            key={capability}
                            className="text-xs bg-muted/60 dark:bg-muted text-muted-foreground/90 dark:text-muted-foreground px-1.5 py-0.5 rounded"
                          >
                            {capability.replace(/_/g, " ")}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="text-xs text-muted-foreground/70 dark:text-muted-foreground">
                            +{agent.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Export the AgentOption type for use in other components
export type { AgentOption };
