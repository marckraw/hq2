const createFetcherService = () => {
  const fetchAvailableAgents = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/available-agents`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const initializeChat = async (requestBody: any) => {
    try {
      const initResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!initResponse.ok) {
        const error = await initResponse.json();
        throw new Error(error.error?.message || "Failed to initialize chat");
      }

      const initData = await initResponse.json();
      const currentConversationId = initData.conversationId;
      const currentStreamToken = initData.streamToken;

      return { currentConversationId, currentStreamToken };
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      throw new Error("Failed to initialize chat");
    }
  };

  const stopChatStreamGeneration = async (streamToken: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/stop-stream?streamToken=${streamToken}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        }
      );
    } catch (error) {
      throw new Error("Failed to stop chat stream generation");
    }
  };

  // Return public interface
  return {
    fetchAvailableAgents,
    initializeChat,
    stopChatStreamGeneration,
  };
};

export const fetcherService = createFetcherService();
export { createFetcherService };

// Export the type for the service registry
export type LLMService = typeof fetcherService;
