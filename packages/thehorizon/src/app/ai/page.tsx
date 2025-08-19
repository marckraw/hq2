"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChatInput, type ChatInputRef } from "@/components/ai-chat/primitives/ChatInput/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/lib/ai-chat/hooks";
import type { DocumentAttachmentProps } from "@/components/ai-chat/attachments/DocumentAttachment";
import type { Agent } from "@/components/ai-chat/ui/AgentAvatar";

// Import our new components
import { ConversationSidebarWithHint } from "./components/ConversationSidebarWithHint";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { EmptyState } from "./components/EmptyState";
import { StreamingMessage } from "./components/StreamingMessage";
import { ResearchProgress } from "./components/ResearchProgress";
import { AttachmentsSection } from "./components/AttachmentsSection";

// Extended attachment type with dataUrl for upload
interface AttachmentWithData extends DocumentAttachmentProps {
  dataUrl?: string;
}

// Default agent configuration
const defaultAgent: Agent = {
  id: "assistant",
  name: "AI Assistant",
  role: "General Purpose AI",
  avatar: "🤖",
  status: "active",
  capabilities: ["reasoning", "analysis", "creative"],
};

export default function AIPage() {
  const chatInputRef = useRef<ChatInputRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use AI API hooks
  const {
    conversations,
    conversationsLoading,
    deleteConversation,
    currentConversationId,
    setCurrentConversationId,
    timeline,
    timelineLoading,
    isStreaming,
    progressMessages,
    streamingResponse,
    responseTimes,
    startStream,
    stopStream,
  } = useAIChat();

  // Local state
  const [attachments, setAttachments] = useState<AttachmentWithData[]>([]);
  const [pendingUserMessage, setPendingUserMessage] = useState<{
    content: string;
    timestamp: string;
  } | null>(null);

  // Get messages from timeline, excluding the last assistant message if we're streaming
  const messages = React.useMemo(() => {
    let allMessages = timeline?.messages || [];
    
    // If we're streaming and have a response, check if the last message is an assistant message
    // If it is, we should hide it because we're showing the streaming version
    if (isStreaming && streamingResponse) {
      const lastMessage = allMessages[allMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        // Return all messages except the last one
        allMessages = allMessages.slice(0, -1);
      }
    }
    
    // Add pending user message if it exists
    if (pendingUserMessage) {
      const tempMessage = {
        id: Date.now(), // Temporary ID
        role: "user",
        content: pendingUserMessage.content,
        createdAt: pendingUserMessage.timestamp,
      };
      return [...allMessages, tempMessage];
    }
    
    return allMessages;
  }, [timeline, isStreaming, streamingResponse, pendingUserMessage]);

  // Clear pending message when timeline updates (message was saved to DB)
  useEffect(() => {
    if (pendingUserMessage && timeline?.messages) {
      // Check if the pending message now exists in the timeline
      const messageExists = timeline.messages.some(
        msg => msg.role === "user" && msg.content === pendingUserMessage.content
      );
      if (messageExists) {
        setPendingUserMessage(null);
      }
    }
  }, [timeline, pendingUserMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [timeline, streamingResponse, progressMessages, pendingUserMessage]);

  // Handle message submission
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Convert attachments to the format expected by the API
    const apiAttachments = attachments.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type,
      dataUrl: att.dataUrl || att.url || "",
    }));

    // Clear input and attachments
    setAttachments([]);
    chatInputRef.current?.clear();

    // Set pending user message to show immediately
    setPendingUserMessage({
      content,
      timestamp: new Date().toISOString(),
    });

    try {
      // Start streaming with the API
      await startStream(content, currentConversationId || undefined, apiAttachments);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Clear pending message on error
      setPendingUserMessage(null);
    }
  }, [attachments, currentConversationId, startStream, isStreaming]);

  // Handle stop streaming
  const handleStopStreaming = useCallback(() => {
    stopStream();
  }, [stopStream]);

  // Handle conversation switch
  const handleConversationSwitch = useCallback((conversationId: number) => {
    setCurrentConversationId(conversationId);
    setPendingUserMessage(null); // Clear any pending message when switching conversations
  }, [setCurrentConversationId]);

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setPendingUserMessage(null); // Clear any pending message when creating new conversation
  }, [setCurrentConversationId]);

  // Handle delete conversation
  const handleDeleteConversation = useCallback((id: number) => {
    if (confirm("Delete this conversation? This cannot be undone.")) {
      deleteConversation(id);
      if (currentConversationId === id) {
        setCurrentConversationId(null);
      }
    }
  }, [deleteConversation, currentConversationId, setCurrentConversationId]);

  // Handle file attachments
  const handleAttachClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,.pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      // Read files as data URLs for upload
      const readPromises = files.map(file => {
        return new Promise<AttachmentWithData>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `attach-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              type: file.type.split("/")[0] as any || "document",
              uploadProgress: 100,
              status: "success" as const,
              removable: true,
              dataUrl: reader.result as string,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(newAttachments => {
        setAttachments(prev => [...prev, ...newAttachments]);
      });
    };
    input.click();
  }, []);

  // Handle attachment removal
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Handle copy message
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar with progressive disclosure */}
      <ConversationSidebarWithHint
        conversations={conversations}
        conversationsLoading={conversationsLoading}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleConversationSwitch}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <ChatHeader 
          sidebarOpen={false} 
          onToggleSidebar={() => {}} 
        />

        {/* Chat Area - Fixed structure for proper height constraints */}
        <div className="flex-1 flex flex-col overflow-hidden container mx-auto max-w-3xl w-full">
          {/* Messages Area with proper scrolling - takes remaining space */}
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-4 py-4 px-4">
              {messages.length === 0 ? (
                <EmptyState chatInputRef={chatInputRef} />
              ) : (
                <MessageList
                  messages={messages}
                  timeline={timeline}
                  onCopyMessage={handleCopyMessage}
                  defaultAgent={defaultAgent}
                  responseTimes={responseTimes}
                />
              )}

              {/* Streaming Response */}
              <StreamingMessage content={streamingResponse} />

              {/* Research Progress Indicator */}
              <ResearchProgress
                isStreaming={isStreaming}
                progressMessages={progressMessages}
                onStopStream={handleStopStreaming}
              />
            </div>
          </ScrollArea>

          {/* Attachments Preview - Fixed at bottom, outside scroll */}
          <AttachmentsSection 
            attachments={attachments}
            onRemove={handleRemoveAttachment}
          />

          {/* Chat Input - Fixed at bottom, outside scroll */}
          <div className="border-t px-4 py-4 flex-shrink-0">
            <ChatInput
              ref={chatInputRef}
              placeholder="Ask me anything..."
              onSubmit={handleSendMessage}
              showAttachButton
              showSendButton
              onAttachClick={handleAttachClick}
              disabled={isStreaming}
              isLoading={isStreaming}
              maxRows={6}
              showShortcuts={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}