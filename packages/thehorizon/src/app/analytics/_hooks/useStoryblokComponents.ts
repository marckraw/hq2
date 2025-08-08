import { useQuery } from "@tanstack/react-query";

export interface StoryblokComponent {
  id: string;
  name: string;
  jsonContent: any;
  markdownContent: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchStoryblokComponents(): Promise<StoryblokComponent[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/storyblok-components/components`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Storyblok components");
  }

  return response.json();
}

export function useStoryblokComponents() {
  return useQuery({
    queryKey: ["storyblok-components"],
    queryFn: fetchStoryblokComponents,
  });
}
