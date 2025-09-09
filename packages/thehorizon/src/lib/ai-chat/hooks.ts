import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import aiApiService from "./api";
import type { ProgressMessage } from "@/schemas/stream.schemas";

// ===== ATOMS FOR STATE MANAGEMENT =====
const currentConversationIdAtom = atom<number | null>(null);
const streamTokenAtom = atom<string | null>(null);
const isStreamingAtom = atom(false);
const progressMessagesAtom = atom<ProgressMessage[]>([]);
const streamingResponseAtom = atom<string>("");
const responseTimesAtom = atom<Record<number, number>>({});  // messageId -> responseTime in ms
const streamStartTimeAtom = atom<number | null>(null);

// ===== CONVERSATION HOOKS =====
export function useConversations() {
  return useQuery({
    queryKey: ["ai-conversations"],
    queryFn: aiApiService.getConversations,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiApiService.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-timeline"] });
    },
  });
}

export function useTimeline(conversationId: number | null) {
  return useQuery({
    queryKey: ["ai-timeline", conversationId],
    queryFn: () => aiApiService.getTimeline(conversationId!),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
}

// ===== STREAMING HOOK =====
export function useAIStreaming() {
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useAtom(currentConversationIdAtom);
  const [streamToken, setStreamToken] = useAtom(streamTokenAtom);
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const [progressMessages, setProgressMessages] = useAtom(progressMessagesAtom);
  const [streamingResponse, setStreamingResponse] = useAtom(streamingResponseAtom);
  const [responseTimes, setResponseTimes] = useAtom(responseTimesAtom);
  const [streamStartTime, setStreamStartTime] = useAtom(streamStartTimeAtom);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(
    async (message: string, conversationId?: number, attachments?: any[]) => {
      try {
        setIsStreaming(true);
        setProgressMessages([]);
        setStreamingResponse("");
        setStreamStartTime(Date.now()); // Track when we start

        // Initialize conversation and get stream token
        const { streamToken: token, conversationId: convId } = await aiApiService.init(
          message,
          conversationId,
          attachments
        );

        setStreamToken(token);
        setCurrentConversationId(convId);

        // Start SSE stream
        const eventSource = aiApiService.stream(token);
        eventSourceRef.current = eventSource;

        let assistantContent = "";

        eventSource.onmessage = (event) => {
          try {
            const data: ProgressMessage = JSON.parse(event.data);

            // Handle different message types
            switch (data.type) {
              case "user_message":
              case "thinking":
              case "tool_execution":
              case "tool_response":
              case "attachment_upload":
                setProgressMessages((prev) => [...prev, data]);
                break;

              case "llm_response":
                assistantContent += data.content;
                setStreamingResponse(assistantContent);
                break;

              case "finished":
                // Calculate response time
                if (streamStartTime) {
                  const responseTime = Date.now() - streamStartTime;
                  // We'll store it when we get the actual message ID from the timeline
                  // For now, store it with conversation ID as key temporarily
                  setResponseTimes(prev => ({
                    ...prev,
                    [`temp_${convId}`]: responseTime
                  }));
                }
                
                setIsStreaming(false);
                setStreamingResponse(""); // Clear the streaming response
                setStreamStartTime(null); // Clear start time
                eventSource.close();
                eventSourceRef.current = null;
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
                queryClient.invalidateQueries({ queryKey: ["ai-timeline", convId] });
                break;

              case "error":
                console.error("Stream error:", data.content);
                setIsStreaming(false);
                setStreamingResponse(""); // Clear on error too
                eventSource.close();
                eventSourceRef.current = null;
                break;

              default:
                // Handle any other message types
                setProgressMessages((prev) => [...prev, data]);
            }
          } catch (error) {
            console.error("Failed to parse stream message:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("EventSource error:", error);
          setIsStreaming(false);
          setStreamingResponse(""); // Clear on EventSource error
          eventSource.close();
          eventSourceRef.current = null;
        };

        return convId;
      } catch (error) {
        console.error("Failed to start stream:", error);
        setIsStreaming(false);
        throw error;
      }
    },
    [queryClient, setCurrentConversationId, setIsStreaming, setProgressMessages, setStreamingResponse, setStreamToken, setStreamStartTime, streamStartTime, setResponseTimes]
  );

  const stopStream = useCallback(async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (streamToken) {
      try {
        await aiApiService.stopStream(streamToken);
      } catch (error) {
        console.error("Failed to stop stream:", error);
      }
    }

    setIsStreaming(false);
    setStreamToken(null);
    setProgressMessages([]);
    setStreamingResponse("");
  }, [streamToken, setIsStreaming, setStreamToken, setProgressMessages, setStreamingResponse]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    // State
    currentConversationId,
    isStreaming,
    progressMessages,
    streamingResponse,
    responseTimes,

    // Actions
    startStream,
    stopStream,
    setCurrentConversationId,
  };
}

// ===== COMBINED HOOK FOR EASY USE =====
export function useAIChat() {
  const conversations = useConversations();
  const deleteConversation = useDeleteConversation();
  const streaming = useAIStreaming();
  const timeline = useTimeline(streaming.currentConversationId);
  const [responseTimes, setResponseTimes] = useAtom(responseTimesAtom);

  // Update response times with actual message IDs when timeline updates
  useEffect(() => {
    if (timeline.data?.messages && streaming.currentConversationId) {
      const tempKey = `temp_${streaming.currentConversationId}`;
      const tempResponseTime = responseTimes[tempKey];
      
      if (tempResponseTime) {
        // Find the last assistant message
        const lastAssistantMessage = [...timeline.data.messages]
          .reverse()
          .find(msg => msg.role === 'assistant');
        
        if (lastAssistantMessage) {
          setResponseTimes(prev => {
            const newTimes = { ...prev };
            // Store with actual message ID
            newTimes[lastAssistantMessage.id] = tempResponseTime;
            // Remove temp key
            delete newTimes[tempKey];
            return newTimes;
          });
        }
      }
    }
  }, [timeline.data, streaming.currentConversationId, responseTimes, setResponseTimes]);

  return {
    // Conversation management
    conversations: conversations.data || [],
    conversationsLoading: conversations.isLoading,
    deleteConversation: deleteConversation.mutate,

    // Current conversation
    currentConversationId: streaming.currentConversationId,
    setCurrentConversationId: streaming.setCurrentConversationId,
    timeline: timeline.data,
    timelineLoading: timeline.isLoading,

    // Streaming
    isStreaming: streaming.isStreaming,
    progressMessages: streaming.progressMessages,
    streamingResponse: streaming.streamingResponse,
    responseTimes: responseTimes,
    startStream: streaming.startStream,
    stopStream: streaming.stopStream,
  };
}