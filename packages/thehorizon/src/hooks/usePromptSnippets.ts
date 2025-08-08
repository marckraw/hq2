import { useState, useEffect } from "react";

export interface PromptSnippet {
  id: string;
  title: string;
  description?: string;
  insertText: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const API_TOKEN = process.env.NEXT_PUBLIC_GC_API_KEY || "";

export const usePromptSnippets = () => {
  const [snippets, setSnippets] = useState<PromptSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/snippets`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch snippets");
      const result = await response.json();
      if (result.success) {
        setSnippets(result.data);
      } else {
        throw new Error(result.error?.message || "Failed to fetch snippets");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createSnippet = async (data: {
    title: string;
    description?: string;
    insertText: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/snippets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create snippet");
    const result = await response.json();
    if (result.success) {
      await fetchSnippets();
      return result.data as PromptSnippet;
    }
    throw new Error(result.error?.message || "Failed to create snippet");
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  return { snippets, loading, error, createSnippet, refetch: fetchSnippets };
};
