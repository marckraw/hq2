import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Approval = {
  id: string;
  pipelineStepId: string;
  status: "pending" | "approved" | "rejected";
  risk: "low" | "medium" | "high";
  reason?: string;
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
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  pipeline?: {
    name?: string;
    type?: string;
  };
  step?: {
    name?: string;
  };
  summary?: string;
};

interface ApprovalsResponse {
  data: Approval[];
  pagination: {
    limit: number;
    offset: number;
    total?: number;
  };
}

export interface UseApprovalsOptions {
  origin?: string[];
  limit?: number;
  offset?: number;
  status?: "pending" | "approved" | "rejected";
  risk?: "low" | "medium" | "high";
  search?: string;
}

export async function fetchApprovalsApi(options: UseApprovalsOptions = {}) {
  const { origin = [], limit = 50, offset = 0, status, risk, search } = options;

  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());
  if (status) params.append("status", status);
  if (risk) params.append("risk", risk);
  if (search) params.append("search", search);

  // Add origin filters if provided
  if (origin.length > 0) {
    origin.forEach((o) => params.append("origin", o));
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approvals${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch approvals");
  const data: ApprovalsResponse = await response.json();
  return data;
}

export function useApprovals(options: UseApprovalsOptions = {}) {
  const { origin = [] } = options;

  return useQuery({
    queryKey: ["approvals", { origin }],
    queryFn: () => fetchApprovalsApi({ origin }),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (data) => data.data,
  });
}

// New hook for getting approvals with pagination metadata
export function useApprovalsWithPagination(options: UseApprovalsOptions = {}) {
  return useQuery({
    queryKey: ["approvals-with-pagination", options],
    queryFn: () => fetchApprovalsApi(options),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export type { ApprovalsResponse };
