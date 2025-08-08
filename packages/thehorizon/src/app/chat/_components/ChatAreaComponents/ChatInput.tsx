import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, StopCircle, Upload, Mic, Sparkles } from "lucide-react";
import { EnhancedEditor } from "../EnhancedEditor";
import { AttachmentList } from "./AttachmentList";
import { VoiceRecorder } from "../VoiceRecorder";
import { ModelSelector } from "./ModelSelector";
import {
  MessageInputToolbar,
  ToolbarSection,
} from "@/components/ui/message-input-toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EnhancedEditorRef } from "../EnhancedEditor";
import {
  useConversationState,
  useChatUIState,
  useAutonomousMode,
  useVoiceRecorder,
} from "../../_state/chat";
import { useAtomValue } from "jotai";
import { agentTypeAtom } from "../../_state/chat/atoms/models";

interface ChatInputProps {
  editorRef: React.RefObject<EnhancedEditorRef | null>;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFileSelect: (files: FileList | null) => void;
  onRemoveAttachment: (id: string) => void;
  onVoiceRecordingToggle: () => void;
  onVoiceTranscription: (transcription: string) => void;
  onStopGeneration: () => void;
}

export function ChatInput({
  editorRef,
  onSubmit,
  onKeyDown,
  onFileSelect,
  onRemoveAttachment,
  onVoiceRecordingToggle,
  onVoiceTranscription,
  onStopGeneration,
}: ChatInputProps) {
  // Get state from new hooks
  const { isLoading } = useConversationState();
  const { showVoiceRecorder } = useChatUIState();
  const { isAutonomousMode, toggleAutonomousMode } = useAutonomousMode();
  const { showVoiceRecorder: voiceRecorderState } = useVoiceRecorder();
  const agentType = useAtomValue(agentTypeAtom);

  return (
    <div className="p-2 sm:p-4 border-t bg-background border-border flex-shrink-0">
      <div className="w-full max-w-none sm:max-w-4xl mx-auto">
        {showVoiceRecorder && (
          <div className="mb-4">
            <VoiceRecorder
              onTranscriptionComplete={onVoiceTranscription}
              onCancel={onVoiceRecordingToggle}
              className="w-full"
            />
          </div>
        )}
        <div className="space-y-2">
          {/* Editor Container */}
          <div className="relative border rounded-lg bg-background">
            <EnhancedEditor
              ref={editorRef}
              onSubmit={onSubmit}
              onKeyDown={onKeyDown}
              placeholder="Type @ for AI prompts..."
              disabled={isLoading}
              className="w-full pb-10"
            />

            {/* Attachments */}
            <AttachmentList onRemoveAttachment={onRemoveAttachment} />

            {/* Submit/Stop Button */}
            {isLoading ? (
              <Button
                size="icon"
                onClick={onStopGeneration}
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={onSubmit}
                disabled={isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Message Input Toolbar */}
          <MessageInputToolbar className="border border-border rounded-lg">
            <ToolbarSection position="left">
              <TooltipProvider>
                {/* Upload Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => document.getElementById("file-input")?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Upload files (images, PDFs)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Model Selector */}
                <ModelSelector />

                {/* Autonomous Mode Button (only show if not in chat mode) */}
                {agentType !== "chat" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isAutonomousMode ? "default" : "ghost"}
                        size="sm"
                        onClick={toggleAutonomousMode}
                        className="h-8 px-2 text-xs font-medium transition-all duration-200"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
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
              </TooltipProvider>
            </ToolbarSection>

            <ToolbarSection position="right">
              <TooltipProvider>
                {/* Voice Recording Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={voiceRecorderState ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0 transition-colors duration-200"
                      onClick={onVoiceRecordingToggle}
                      disabled={isLoading}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Record voice message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToolbarSection>
          </MessageInputToolbar>

          {/* Hidden file input */}
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => onFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2 animate-in fade-in delay-300">
          Chat can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
