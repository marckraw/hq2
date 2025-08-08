import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface WebhookEntry {
  id: string;
  timestamp: string;
  headers: Record<string, string>;
  payload: any;
}

export async function fetchWebhooksApi(): Promise<WebhookEntry[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook-tester`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch webhooks");
  const data = await response.json();
  return data.data as WebhookEntry[];
}

export async function clearWebhooksApi(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook-tester/clear`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
    },
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: fetchWebhooksApi,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useClearWebhooks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearWebhooksApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

