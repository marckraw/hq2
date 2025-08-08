import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Upload, Mic } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import {
  useAutonomousMode,
  useVoiceRecorder,
  useConversationState,
} from "../../_state/chat";
import { useAtomValue } from "jotai";
import { agentTypeAtom } from "../../_state/chat/atoms/models";

interface EditorToolbarProps {
  onFileSelect: (files: FileList | null) => void;
  onVoiceRecordingToggle: () => void;
}

export function EditorToolbar({
  onFileSelect,
  onVoiceRecordingToggle,
}: EditorToolbarProps) {
  // Get state from custom hooks following official Jotai pattern
  const { isAutonomousMode, toggleAutonomousMode } = useAutonomousMode();
  const { showVoiceRecorder } = useVoiceRecorder();
  const { isLoading } = useConversationState();
  const agentType = useAtomValue(agentTypeAtom);
  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-2">
      <ModelSelector />

      {agentType !== "chat" && (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant={isAutonomousMode ? "default" : "secondary"}
              size="sm"
              onClick={toggleAutonomousMode}
              className="h-7 px-2 text-xs font-medium shadow-sm border border-border hover:shadow-md"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isAutonomousMode ? "Auto" : "Manual"}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">
              {isAutonomousMode
                ? "Agent will work autonomously with multiple steps"
                : "Agent will work step by step with your guidance"}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs font-medium shadow-sm border border-border hover:shadow-md"
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={isLoading}
          >
            <Upload className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Upload files (images, PDFs)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant={showVoiceRecorder ? "default" : "secondary"}
            size="sm"
            className="h-7 px-2 text-xs font-medium shadow-sm border border-border hover:shadow-md"
            onClick={onVoiceRecordingToggle}
            disabled={isLoading}
          >
            <Mic className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Record voice message</p>
        </TooltipContent>
      </Tooltip>

      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={(e) => onFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
