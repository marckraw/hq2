export type AgentType = string;

export async function fetchAvailableAgents(): Promise<AgentType[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/available-agents`, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.success && Array.isArray(data.data)) {
      return (
        data.data
          // Use stable agent id from backend, not underlying execution type
          .map((a: any) => a.id)
          .filter(Boolean)
          .filter((t: string) => t !== "storyblok-editor" && t !== "scribe")
      );
    }
    return [];
  } catch {
    return [];
  }
}
