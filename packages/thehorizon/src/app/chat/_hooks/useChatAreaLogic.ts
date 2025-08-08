import { useRef, useEffect } from "react";
import type {
  Message,
  ConversationTimeline,
} from "@/app/chat/_components/ChatInterface.types";
import type { EnhancedEditorRef } from "@/app/chat/_components/EnhancedEditor";
import { useCurrentSelection, useProgressExpansion } from "../_state/chat";
import { useChatStreaming } from "./useChatStreaming";
import { useFileUpload } from "./useFileUpload";
import { useVoiceRecording } from "./useVoiceRecording";
import { useAgentManagement } from "./useAgentManagement";

interface ChatAreaLogicProps {
  conversationId: number | null;
  messages: Message[];
  timeline?: ConversationTimeline | null;
  onConversationCreate: (conversationId: number) => void;
  onRefreshMessages?: (conversationId?: number) => Promise<void>;
}

export const useChatAreaLogic = ({
  conversationId,
  messages,
  onConversationCreate,
  onRefreshMessages,
}: ChatAreaLogicProps) => {
  // Use specialized hooks
  const streaming = useChatStreaming();
  const fileUpload = useFileUpload();
  const voiceRecording = useVoiceRecording();
  const agentManagement = useAgentManagement();

  // Use new hooks for shared state
  const { selectedModel, setSelectedModel } = useCurrentSelection();
  const { isProgressExpanded, toggleProgressExpanded } = useProgressExpansion();

  // Keep remaining local state for now
  const editorRef = useRef<EnhancedEditorRef>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear optimistic messages when conversation changes
    // This is now handled by the streaming hook
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const text = editorRef.current?.getContent()?.trim();
    if (!text || streaming.isLoading) return;

    // Progress is expanded by default when starting a stream
    editorRef.current?.clear();

    await streaming.startStream(
      text,
      conversationId,
      agentManagement.isAutonomousMode,
      {
        onConversationCreate,
        onRefreshMessages,
      }
    );
  };

  const stopGeneration = async () => {
    await streaming.stopStream();
  };

  const toggleAutonomousMode = () => agentManagement.toggleAutonomousMode();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (prompt: string) => {
    editorRef.current?.setContent(prompt);
    editorRef.current?.focus();
  };

  const handleVoiceRecordingToggle = () => {
    voiceRecording.toggleRecording();
  };

  const handleVoiceTranscription = (transcription: string) => {
    voiceRecording.handleTranscription(transcription, editorRef);
  };

  return {
    selectedModel,
    setSelectedModel,
    isLoading: streaming.isLoading,
    agents: agentManagement.agents,
    isLoadingAgents: agentManagement.isLoadingAgents,
    localOptimisticMessages: streaming.localOptimisticMessages,
    editorRef,
    messagesEndRef,
    isAutonomousMode: agentManagement.isAutonomousMode,
    toggleAutonomousMode,
    agentType: agentManagement.agentType,
    setAgentType: agentManagement.setAgentType,
    attachments: fileUpload.attachments,
    handleFileSelect: fileUpload.handleFileSelect,
    removeAttachment: fileUpload.removeAttachment,
    progressMessages: streaming.progressMessages,
    isProgressExpanded,
    toggleProgressExpanded,
    connectionStatus: streaming.connectionStatus,
    streamingResponse: streaming.streamingResponse,
    handleSubmit,
    handleKeyDown,
    handleExampleClick,
    stopGeneration,
    scrollToBottom,
    showVoiceRecorder: voiceRecording.showVoiceRecorder,
    handleVoiceRecordingToggle,
    handleVoiceTranscription,
  };
};
