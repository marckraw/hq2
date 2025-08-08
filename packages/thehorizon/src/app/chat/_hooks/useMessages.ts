import { useQuery } from "@tanstack/react-query";
import type {
  Message,
  ConversationTimeline,
} from "@/app/chat/_components/ChatInterface.types";

// API functions
export async function fetchMessagesApi(
  conversationId: number
): Promise<Message[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
      body: JSON.stringify({ conversationId }),
    }
  );
  if (!response.ok) throw new Error("Failed to fetch messages");
  const data = await response.json();
  return (
    data.content?.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.createdAt,
    })) || []
  );
}

export async function fetchTimelineApi(
  conversationId: number
): Promise<ConversationTimeline> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/timeline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
      body: JSON.stringify({ conversationId }),
    }
  );

  if (!response.ok) throw new Error("Failed to fetch timeline");
  const data = await response.json();

  console.log("[fetchTimelineApi] pure response from endpoint", data);
  return data.content;
}

// Hooks
export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessagesApi(conversationId!),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
}

export function useTimeline(conversationId: number | null) {
  return useQuery({
    queryKey: ["timeline", conversationId],
    queryFn: () => fetchTimelineApi(conversationId!),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // If timeline fails, we'll fallback to regular messages
      return failureCount < 1;
    },
  });
}
