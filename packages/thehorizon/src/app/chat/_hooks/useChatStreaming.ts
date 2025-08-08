import type { Message } from "@/app/chat/_components/ChatInterface.types";
import type { ProgressMessage } from "@/schemas/stream.schemas";
import { fetcherService } from "@/services/fetcher.service";
import { useRef } from "react";
import {
  useConversation,
  useCurrentSelection,
  useOptimisticMessages,
  useStreaming,
  useStreamingActions,
} from "../_state/chat";
import { useFileUpload } from "./useFileUpload";

interface StreamRequestBody {
  messages: { content: string; role: string }[];
  modelId: string;
  agentType: string;
  autonomousMode: boolean;
  attachments: any[];
  conversationId?: number;
}

interface StreamCallbacks {
  onConversationCreate?: (conversationId: number) => void;
  onRefreshMessages?: (conversationId?: number) => Promise<void>;
}

export const useChatStreaming = () => {
  // Use specialized hooks
  const fileUpload = useFileUpload();

  // Use new hooks for state management
  const { isLoading, setIsLoading } = useConversation();
  const { connectionStatus, progressMessages, streamToken, streamingResponse } =
    useStreaming();
  const {
    setConnectionStatus,
    setProgressMessages,
    addProgressMessage,
    setStreamToken,
    setStreamingResponse,
  } = useStreamingActions();
  const {
    optimisticMessages: localOptimisticMessages,
    addOptimisticMessage,
    clearOptimisticMessages,
  } = useOptimisticMessages();
  const { selectedModel, agentType } = useCurrentSelection();

  // Refs for stream management
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamManagerRef = useRef<any>(null);

  const startStream = async (
    text: string,
    conversationId: number | null,
    isAutonomousMode: boolean,
    callbacks: StreamCallbacks = {}
  ) => {
    const { onConversationCreate, onRefreshMessages } = callbacks;

    try {
      setIsLoading(true);
      setConnectionStatus("connecting");
      setProgressMessages([]);

      // Create optimistic user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: text,
        role: "user",
        timestamp: new Date().toISOString(),
      };
      addOptimisticMessage(userMessage);

      // Upload files
      const validUploadedFiles = await fileUpload.prepareFiles(conversationId);

      // Prepare request body
      const requestBody: StreamRequestBody = {
        messages: [{ content: text, role: "user" }],
        modelId: selectedModel,
        agentType,
        autonomousMode: isAutonomousMode,
        attachments: validUploadedFiles.map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          dataUrl: file.dataUrl,
        })),
      };

      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      // Initialize chat
      const initResponse: any = await fetcherService.initializeChat(
        requestBody
      );
      const { currentConversationId, currentStreamToken } = initResponse;

      setStreamToken(currentStreamToken);

      if (!conversationId && currentConversationId && onConversationCreate) {
        onConversationCreate(currentConversationId);
      }

      // Clear attachments after successful upload
      fileUpload.clearAttachments();

      // Start streaming
      const streamUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/stream?streamToken=${currentStreamToken}`;
      let assistantMessageContent = "";
      setStreamingResponse({ content: "", isActive: true });

      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;
      streamManagerRef.current = { close: () => eventSource.close() };

      eventSource.onopen = () => setConnectionStatus("connected");

      eventSource.onmessage = async (event) => {
        try {
          const message: ProgressMessage = JSON.parse(event.data);

          if (message.type === "llm_response") {
            if (assistantMessageContent === "") setIsLoading(false);
            assistantMessageContent += message.content || "";
            setStreamingResponse({
              content: assistantMessageContent,
              isActive: true,
            });
          } else if (message.type === "finished") {
            setIsLoading(false);
            setConnectionStatus("disconnected");
            eventSource.close();
            if (onRefreshMessages) {
              await onRefreshMessages(currentConversationId);
            }
            clearOptimisticMessages();
            setStreamingResponse(null);
          } else if (message.type === "memory_saved") {
            if (onRefreshMessages) {
              await onRefreshMessages(currentConversationId);
            }
            clearOptimisticMessages();
            setStreamingResponse(null);
          } else if (
            agentType !== "chat" ||
            message.type === "tool_execution" ||
            message.type === "tool_response"
          ) {
            addProgressMessage(message);
          }
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        setConnectionStatus("error");
        setIsLoading(false);
        setStreamingResponse(null);
        eventSource.close();
      };
    } catch (error) {
      console.error("Error in startStream:", error);
      setIsLoading(false);
      setConnectionStatus("error");
      setStreamingResponse(null);

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: `Failed to send message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        role: "assistant",
        timestamp: new Date().toISOString(),
        metadata: { type: "error", error: true },
      };
      addOptimisticMessage(errorMessage);
    }
  };

  const stopStream = async () => {
    if (streamManagerRef.current && streamToken) {
      try {
        await fetcherService.stopChatStreamGeneration(streamToken);
      } catch (error) {
        console.error("Error stopping stream:", error);
      } finally {
        streamManagerRef.current.close();
        streamManagerRef.current = null;
        eventSourceRef.current = null;
        setStreamToken(null);
        setIsLoading(false);
        setConnectionStatus("disconnected");
        setProgressMessages([]);
        setStreamingResponse(null);
      }
    }
  };

  return {
    // State
    isLoading,
    connectionStatus,
    progressMessages,
    streamingResponse,
    localOptimisticMessages,

    // Actions
    startStream,
    stopStream,
  };
};
