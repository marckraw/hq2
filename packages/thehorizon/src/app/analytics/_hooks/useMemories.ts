import { useQuery } from "@tanstack/react-query";

interface Memory {
  id: number;
  type: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface MemoriesResponse {
  data: Memory[];
}

interface UseMemoriesOptions {
  limit?: number;
  offset?: number;
}

export async function fetchMemoriesApi({
  limit = 10,
  offset = 0,
}: UseMemoriesOptions = {}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/memories?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch memories");
  }

  const data: MemoriesResponse = await response.json();
  return data.data;
}

export function useMemories(options: UseMemoriesOptions = {}) {
  const { limit = 10, offset = 0 } = options;

  return useQuery({
    queryKey: ["memories", { limit, offset }],
    queryFn: () => fetchMemoriesApi({ limit, offset }),
    refetchInterval: 5000, // 5 seconds - same as other hooks
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export type { Memory, UseMemoriesOptions };
