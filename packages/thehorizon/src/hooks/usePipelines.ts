import { useQuery } from "@tanstack/react-query";

interface PipelineStep {
  id: string;
  name: string;
  description?: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "failed"
    | "waiting_approval";
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  metadata?: any;
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  source: string;
  type: string;
  origin:
    | "thehorizon"
    | "slack"
    | "storyblok-ui"
    | "storyblok-plugin"
    | "email"
    | "api"
    | "webhook"
    | "system"
    | "unknown";
  status: "active" | "completed" | "failed" | "cancelled";
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  steps?: PipelineStep[];
}

interface PipelinesResponse {
  data: Pipeline[];
  pagination: {
    limit: number;
    offset: number;
    total?: number;
  };
}

interface UsePipelinesOptions {
  limit?: number;
  offset?: number;
  origin?: string[];
}

export async function fetchPipelinesApi({
  limit = 1000,
  offset = 0,
  origin = [],
}: UsePipelinesOptions = {}) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  // Add origin filters if provided
  if (origin.length > 0) {
    origin.forEach((o) => params.append("origin", o));
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pipelines?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pipelines");
  }

  const data: PipelinesResponse = await response.json();
  return data;
}

export function usePipelines(options: UsePipelinesOptions = {}) {
  const { limit = 1000, offset = 0, origin = [] } = options;

  return useQuery({
    queryKey: ["pipelines", { limit, offset, origin }],
    queryFn: () => fetchPipelinesApi({ limit, offset, origin }),
    refetchInterval: 5000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (data) => data.data,
  });
}

// New hook for getting pipelines with pagination metadata
export function usePipelinesWithPagination(options: UsePipelinesOptions = {}) {
  const { limit = 1000, offset = 0, origin = [] } = options;

  return useQuery({
    queryKey: ["pipelines-with-pagination", { limit, offset, origin }],
    queryFn: () => fetchPipelinesApi({ limit, offset, origin }),
    refetchInterval: 5000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Hook for fetching individual pipeline details
export async function fetchPipelineDetailsApi(pipelineId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pipelines/${pipelineId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pipeline details");
  }

  const data = await response.json();
  return data.data;
}

export function usePipelineDetails(pipelineId: string | null) {
  return useQuery({
    queryKey: ["pipeline-details", pipelineId],
    queryFn: () => fetchPipelineDetailsApi(pipelineId!),
    enabled: !!pipelineId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export type { Pipeline, PipelineStep, UsePipelinesOptions, PipelinesResponse };
