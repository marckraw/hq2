"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConversationState } from "../_state/chat";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onCancel,
  className = "",
}) => {
  // Get disabled state from custom hook following official Jotai pattern
  const { isLoading: disabled } = useConversationState();
  const {
    isRecording,
    isProcessing,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    transcribeAudio,
  } = useVoiceRecording();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    if (disabled) return;
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSendRecording = async () => {
    if (!audioBlob) return;

    const transcription = await transcribeAudio();
    if (transcription) {
      onTranscriptionComplete(transcription);
      clearRecording();
    }
  };

  const handleClearRecording = () => {
    clearRecording();
  };

  // If we have an error, show it
  if (error) {
    return (
      <Card className={cn("p-4", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-end mt-3">
          <Button variant="outline" size="sm" onClick={clearRecording}>
            Dismiss
          </Button>
        </div>
      </Card>
    );
  }

  // If we have a recording, show playback controls
  if (audioBlob && !isRecording) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Recording ready</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRecording}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSendRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isProcessing ? "Transcribing..." : "Send"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // If we're recording, show recording UI
  if (isRecording) {
    return (
      <Card className={cn("p-4 border-red-200 bg-red-50", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">
                Recording...
              </span>
            </div>
            <span className="text-xs text-red-600 font-mono">
              {formatDuration(duration)}
            </span>
          </div>

          <Button variant="destructive" size="sm" onClick={handleStopRecording}>
            <Square className="h-4 w-4" />
            Stop
          </Button>
        </div>
      </Card>
    );
  }

  // Default state - show record button
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Ready to record</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleStartRecording}
            disabled={disabled || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {isProcessing ? "Starting..." : "Start Recording"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VoiceRecorder;
