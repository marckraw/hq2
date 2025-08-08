import { useQuery } from "@tanstack/react-query";

interface Signal {
  id: string;
  timestamp: string;
  source: string;
  type: string;
  payload: any;
  metadata: Record<string, unknown> | null;
}

interface SignalsResponse {
  data: Signal[];
}

interface UseSignalsOptions {
  limit?: number;
  offset?: number;
}

export async function fetchSignalsApi({
  limit = 10,
  offset = 0,
}: UseSignalsOptions = {}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/signals?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch signals");
  }

  const data: SignalsResponse = await response.json();
  return data.data;
}

export function useSignals(options: UseSignalsOptions = {}) {
  const { limit = 10, offset = 0 } = options;

  return useQuery({
    queryKey: ["signals", { limit, offset }],
    queryFn: () => fetchSignalsApi({ limit, offset }),
    refetchInterval: 5000, // 5 seconds - same as pipelines
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export type { Signal, UseSignalsOptions };
