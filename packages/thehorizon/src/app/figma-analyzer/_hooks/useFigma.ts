import { useQuery } from "@tanstack/react-query";

// TODO: fix this, right now i have this typing in the grid
// we should have some way of sharing this types between thegrid and thehorizon
type FigmaNode = any;

export type FigmaFile = {
  document: {
    children: FigmaNode[];
  };
  name: string;
  lastModified: string;
  version: string;
  schemaVersion: number;
};

export async function fetchFigmaFileApi(url: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/figma?url=${encodeURIComponent(
      url
    )}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch Figma file");
  const data = await response.json();
  return data.data.file as FigmaFile;
}

export function useFigmaFile(url: string | null) {
  return useQuery({
    queryKey: ["figma-file", url],
    queryFn: () => fetchFigmaFileApi(url!),
    enabled: !!url,
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
