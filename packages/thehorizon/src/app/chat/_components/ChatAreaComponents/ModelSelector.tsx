import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Check, Bot, Brain } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  getCapabilityIcon,
  formatCapabilityText,
  getSpeedIcon,
  getIntelligenceIcon,
  getModelTypeIcon,
  formatSpeedText,
  formatIntelligenceText,
  getModelTypeText,
  MODELS,
} from "../ChatArea.utils";
import { useGetAgents } from "../../_hooks/useGetAgents";
import { useCurrentSelection, useAgents } from "../../_state/chat";

export const ModelSelector = () => {
  // Use new hooks for state management
  const {
    selectedModel,
    setSelectedModel,
    agentType,
    setAgentType,
    currentSelection,
  } = useCurrentSelection();
  const { agents } = useAgents();

  // Still call the hook to trigger agent fetching
  useGetAgents();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-2 text-xs font-medium shadow-sm border border-border hover:shadow-md"
        >
          {currentSelection?.type === "agent" ? (
            <Bot className="h-3 w-3 mr-1" />
          ) : (
            <Brain className="h-3 w-3 mr-1" />
          )}
          {currentSelection?.item?.name || "GPT-4.1"}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[28rem] p-0 max-w-[calc(100vw-2rem)]"
        align="start"
        side="top"
        sideOffset={8}
        alignOffset={0}
        collisionPadding={16}
      >
        <Command>
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Select AI Model or Agent</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the model or specialized agent that best fits your needs
            </p>
          </div>
          <CommandInput
            placeholder="Search models and agents..."
            className="h-9"
          />
          <CommandList className="max-h-80">
            <CommandEmpty>No models or agents found.</CommandEmpty>
            <CommandGroup heading="AI Models">
              {MODELS.map((model) => (
                <CommandItem
                  key={model.id}
                  value={`${model.name} ${model.description} ${model.speed} ${model.intelligence}`}
                  onSelect={() => {
                    setSelectedModel(model.id);
                    setAgentType("chat");
                  }}
                  className="flex items-center justify-between p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div className="p-1 rounded hover:bg-accent/50 transition-colors">
                            {getModelTypeIcon(model.id)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">
                            {getModelTypeText(model.id)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {model.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {model.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="flex gap-1 items-center">
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div className="p-1 rounded hover:bg-accent/50 transition-colors">
                            {getSpeedIcon(model.speed)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">
                            {formatSpeedText(model.speed)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div className="p-1 rounded hover:bg-accent/50 transition-colors">
                            {getIntelligenceIcon(model.intelligence)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">
                            {formatIntelligenceText(model.intelligence)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {selectedModel === model.id && agentType === "chat" && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {agents.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Specialized Agents">
                  {agents.map((agent) => (
                    <CommandItem
                      key={agent.id}
                      value={`${agent.name} ${
                        agent.description
                      } ${agent.capabilities.join(" ")}`}
                      onSelect={() => {
                        setAgentType(agent.type);
                      }}
                      className="flex items-center justify-between p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-lg">{agent.icon}</span>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className="flex gap-1 items-center">
                          {agent.capabilities.slice(0, 4).map((capability) => (
                            <Tooltip key={capability} delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div className="p-1 rounded hover:bg-accent/50 transition-colors">
                                  {getCapabilityIcon(capability)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">
                                  {formatCapabilityText(capability)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {agent.capabilities.length > 4 && (
                            <div className="text-xs text-muted-foreground">
                              +{agent.capabilities.length - 4}
                            </div>
                          )}
                        </div>
                        {agentType === agent.type && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
