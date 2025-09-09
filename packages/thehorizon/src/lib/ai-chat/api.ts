// API service for AI chat using closure pattern
const createAIApiService = () => {
  // Private helper for API calls
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Public methods
  const init = async (
    message: string,
    conversationId?: number,
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      dataUrl: string;
    }>
  ) => {
    const url = "/api/ai/init";
    const payload = {
      message,
      conversationId,
      attachments: attachments || [],
    };
    
    console.log("🚀 Sending message to:", `${process.env.NEXT_PUBLIC_BASE_URL}${url}`);
    console.log("📦 Payload:", payload);
    
    try {
      const result = await apiCall(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("✅ Init response:", result);
      return result;
    } catch (error) {
      console.error("❌ Init failed:", error);
      throw error;
    }
  };

  const stream = (streamToken: string) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/stream?streamToken=${streamToken}`;
    console.log("📡 Opening SSE stream:", url);
    
    const eventSource = new EventSource(url);
    
    eventSource.onerror = (error) => {
      console.error("❌ SSE Error:", error);
    };
    
    return eventSource;
  };

  const stopStream = async (streamToken: string) => {
    return apiCall("/api/ai/stop", {
      method: "POST",
      body: JSON.stringify({ streamToken }),
    });
  };

  const getConversations = async () => {
    const response = await apiCall("/api/ai/conversations");
    return response.conversations || [];
  };

  const getTimeline = async (conversationId: number) => {
    const response = await apiCall(`/api/ai/conversation/${conversationId}/timeline`);
    return response.timeline;
  };

  const deleteConversation = async (conversationId: number) => {
    return apiCall(`/api/ai/conversation/${conversationId}`, {
      method: "DELETE",
    });
  };

  // Return public interface
  return {
    init,
    stream,
    stopStream,
    getConversations,
    getTimeline,
    deleteConversation,
  };
};

// Create singleton instance
export const aiApiService = createAIApiService();
export default aiApiService;