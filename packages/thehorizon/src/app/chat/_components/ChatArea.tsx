"use client";

import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, ConversationTimeline } from "./ChatInterface.types";
import { MinimalStyleProgress } from "./ChatAreaComponents/MinimalStyleProgress";
import { RenderExecutionGroup } from "./ChatAreaComponents/RenderExecutionGroup";
import { ModelStatusDisplay } from "./ChatAreaComponents/ModelStatusDisplay";
import { LoadingIndicator } from "./ChatAreaComponents/LoadingIndicator";
import { AttachmentCounter } from "./ChatAreaComponents/AttachmentCounter";
import { SubmitStatus } from "./ChatAreaComponents/SubmitStatus";
import { ChatHeader } from "./ChatAreaComponents/ChatHeader";
import { MobileChatHeader } from "./ChatAreaComponents/MobileChatHeader";
import { WelcomeScreen } from "./ChatAreaComponents/WelcomeScreen";
import { ChatMessages } from "./ChatAreaComponents/ChatMessages";
import { StreamingMessage } from "./ChatAreaComponents/StreamingMessage";
import { LoadingMessage } from "./ChatAreaComponents/LoadingMessage";
import { ChatInput } from "./ChatAreaComponents/ChatInput";
import { useChatAreaLogic } from "../_hooks/useChatAreaLogic";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { usePromptSnippets } from "@/hooks/usePromptSnippets";
import { useSettings } from "@/app/settings/_hooks/useSettings";
import {
  useConversationState,
  useConversationActions,
  useCurrentSelection,
  useTTS,
} from "../_state/chat";

interface ChatAreaProps {
  conversationId: number | null;
  messages: Message[];
  timeline?: ConversationTimeline | null;
  onMessagesUpdate: (messages: Message[]) => void;
  onConversationCreate: (conversationId: number) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onRefreshMessages?: (conversationId?: number) => Promise<void>;
}

export function ChatArea(props: ChatAreaProps) {
  // Use new hooks for state management
  const { displayItems, isNewChat } = useConversationState();
  const { setConversationId, setMessages, setTimeline } =
    useConversationActions();
  const { setTtsActions } = useTTS();

  // Update atoms when props change
  useEffect(() => {
    setConversationId(props.conversationId);
    setMessages(props.messages);
    setTimeline(props.timeline || null);
  }, [
    props.conversationId,
    props.messages,
    props.timeline,
    setConversationId,
    setMessages,
    setTimeline,
  ]);

  const {
    isLoading,
    editorRef,
    messagesEndRef,
    isAutonomousMode,
    toggleAutonomousMode,
    agentType,
    attachments,
    handleFileSelect,
    removeAttachment,
    progressMessages,
    streamingResponse,
    handleSubmit,
    handleKeyDown,
    handleExampleClick,
    stopGeneration,
    scrollToBottom,
    showVoiceRecorder,
    handleVoiceRecordingToggle,
    handleVoiceTranscription,
  } = useChatAreaLogic(props);

  // Text-to-speech functionality
  const {
    speak,
    stop: stopTTS,
    isPlaying: isTTSPlaying,
    isLoading: isTTSLoading,
    currentText: currentTTSText,
    error: ttsError,
  } = useTextToSpeech();

  // Update TTS actions atom
  useEffect(() => {
    setTtsActions({
      speak: async (text: string) => {
        try {
          await speak(text);
        } catch (error) {
          console.error("TTS Error:", error);
        }
      },
      stop: stopTTS,
      isPlaying: isTTSPlaying,
      isLoading: isTTSLoading,
      currentText: currentTTSText,
    });
  }, [
    speak,
    stopTTS,
    isTTSPlaying,
    isTTSLoading,
    currentTTSText,
    setTtsActions,
  ]);

  const { snippets } = usePromptSnippets();
  const { settings } = useSettings();
  const enabledSnippetIds = settings.interface?.enabledSnippets || [];
  const snippetSuggestions = React.useMemo(
    () =>
      snippets
        .filter((s) =>
          enabledSnippetIds.length === 0
            ? true
            : enabledSnippetIds.includes(s.id)
        )
        .map((s) => ({
          id: s.title,
          title: s.title,
          description: s.description,
          insertText: s.insertText,
        })),
    [snippets, enabledSnippetIds]
  );

  useEffect(() => {
    scrollToBottom();
  }, [displayItems, scrollToBottom]);

  // Get current selection and TTS actions from hooks
  const { currentSelection } = useCurrentSelection();
  const {
    ttsActions: rawTtsActions,
    speak: ttsSpeak,
    stop: ttsStop,
    isPlaying: ttsIsPlaying,
    isLoading: ttsIsLoading,
    currentText: ttsCurrentText,
  } = useTTS();

  // Create ttsActions object for compatibility
  const ttsActions = rawTtsActions || {
    speak: ttsSpeak,
    stop: ttsStop,
    isPlaying: ttsIsPlaying,
    isLoading: ttsIsLoading,
    currentText: ttsCurrentText,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatHeader />
      <MobileChatHeader />

      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="w-full max-w-none sm:max-w-4xl mx-auto p-2 sm:p-4 pt-8 space-y-6">
            {isNewChat ? (
              <WelcomeScreen onExampleClick={handleExampleClick} />
            ) : (
              <ChatMessages
                displayItems={displayItems}
                isLoading={isLoading}
                snippetSuggestions={snippetSuggestions}
                ttsActions={ttsActions}
              />
            )}

            {streamingResponse && (
              <StreamingMessage content={streamingResponse.content} />
            )}
            {progressMessages.length > 0 && (
              <MinimalStyleProgress
                messages={progressMessages}
                isActive={isLoading}
              />
            )}
            {isLoading && progressMessages.length === 0 && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <ChatInput
        editorRef={editorRef}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        onFileSelect={handleFileSelect}
        onRemoveAttachment={removeAttachment}
        onVoiceRecordingToggle={handleVoiceRecordingToggle}
        onVoiceTranscription={handleVoiceTranscription}
        onStopGeneration={stopGeneration}
      />
    </div>
  );
}
