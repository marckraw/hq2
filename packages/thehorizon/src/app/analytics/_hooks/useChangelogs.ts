import { useQuery } from "@tanstack/react-query";

interface Changelog {
  id: string;
  repoOwner: string;
  repoName: string;
  prNumber: string;
  title: string;
  summary: string;
  releaseDate: string;
  createdAt: string;
  published: boolean;
  commits: any[];
}

interface ChangelogsResponse {
  data: Changelog[];
}

interface UseChangelogsOptions {
  limit?: number;
  offset?: number;
}

export async function fetchChangelogsApi({
  limit = 10,
  offset = 0,
}: UseChangelogsOptions = {}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/changelogs?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch changelogs");
  }

  const data: ChangelogsResponse = await response.json();
  return data.data;
}

export function useChangelogs(options: UseChangelogsOptions = {}) {
  const { limit = 10, offset = 0 } = options;

  return useQuery({
    queryKey: ["changelogs", { limit, offset }],
    queryFn: () => fetchChangelogsApi({ limit, offset }),
    refetchInterval: 5000, // 5 seconds - same as other hooks
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export type { Changelog, UseChangelogsOptions };
