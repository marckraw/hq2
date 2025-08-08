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
import { Check, Bot } from "lucide-react";

export interface AgentOption {
  id: string;
  type:
    | "general"
    | "test-openrouter"
    | "scribe"
    | "rephraser"
    | "figma-analyzer"
    | "figma-to-storyblok"
    | "storyblok-editor"
    | "site-builder"
    | "orchestrator"
    | "irf-architect";
  name: string;
  description: string;
  capabilities: string[];
  icon: string;
}

interface AgentSelectorPopoverProps {
  value: string;
  onValueChange: (value: string) => void;
  agents: AgentOption[];
  disabled: boolean;
}

export const AgentSelectorPopover = ({
  value,
  onValueChange,
  agents,
  disabled,
}: AgentSelectorPopoverProps) => {
  const [open, setOpen] = useState(false);

  const selectedAgent = agents.find((agent) => agent.type === value);

  const getButtonText = () => {
    if (!selectedAgent) {
      return "Select agent";
    }
    return `${selectedAgent.icon} ${selectedAgent.name}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-accent hover:text-accent-foreground text-foreground/70 hover:text-foreground"
          disabled={disabled}
        >
          <Bot className="h-4 w-4 mr-1" />
          <span className="text-xs">{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[28rem] p-0 max-w-[calc(100vw-2rem)]"
        align="start"
        side="top"
        sideOffset={8}
      >
        <Command>
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Select AI Agent</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Choose an agent based on your task requirements
            </p>
          </div>
          <CommandInput placeholder="Search agents..." className="h-9" />
          <CommandList className="max-h-[350px]">
            <CommandEmpty>No agents found.</CommandEmpty>
            <CommandGroup heading="Available Agents">
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.type}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{agent.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {agent.description}
                      </div>
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
                  {value === agent.type && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
