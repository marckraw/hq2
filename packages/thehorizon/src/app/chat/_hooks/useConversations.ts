import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@/app/chat/_components/ChatInterface.types";

// API functions
export async function fetchConversationsApi(): Promise<Conversation[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/conversations`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch conversations");
  const data = await response.json();
  return data.content || [];
}

export async function deleteConversationApi(
  conversationId: number
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/conversation/${conversationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to delete conversation");
}

// Hooks
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversationsApi,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversationApi,
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
    },
  });
}
