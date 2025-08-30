"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

export interface RecipeListItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  heroImageUrl?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags?: TagItem[];
}

async function fetchRecipes(): Promise<RecipeListItem[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/recipes`);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load recipes");
  const json = await res.json();
  return json.data ?? [];
}

async function fetchTags(): Promise<TagItem[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/tags`);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load tags");
  const json = await res.json();
  return json.data ?? [];
}

export function useRecipes() {
  return useQuery({ queryKey: ["recipes"], queryFn: fetchRecipes, refetchOnMount: "always" });
}

export function useTags() {
  return useQuery({ queryKey: ["fitness-tags"], queryFn: fetchTags });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/recipes/${id}`);
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
      toast({ title: "Deleted", description: "Recipe removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ["recipe", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/recipes/${id}`);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load recipe");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/recipes/${id}`);
      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update recipe");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
      qc.invalidateQueries({ queryKey: ["recipe", variables.id] });
      toast({ title: "Saved", description: "Recipe updated" });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (body: any) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/recipes`);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create recipe");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
      toast({ title: "Created", description: "Recipe saved" });
    },
    onError: () => toast({ title: "Create failed", variant: "destructive" }),
  });
}

export function useToggleMealCooked() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, isCooked }: { id: string; isCooked: boolean }) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/meals/${id}`);
      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCooked }),
      });
      if (!res.ok) throw new Error("Failed to update meal");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-plan"] });
      toast({ title: "Updated", description: "Meal status updated" });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });
}

export function usePlanMeal() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { recipeId: string; date: string; time: string }) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/meals`);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to plan meal");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-plan"] });
      toast({ title: "Planned", description: "Meal added to day" });
    },
    onError: () => toast({ title: "Plan failed", variant: "destructive" }),
  });
}

export interface FitnessActivity {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  meta?: unknown;
}

export function useFitnessActivities(limit: number = 50) {
  return useQuery<FitnessActivity[]>({
    queryKey: ["fitness-activities", limit],
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/activities`);
      if (limit) url.searchParams.set("limit", String(limit));
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load activities");
      const json = await res.json();
      return json.data ?? [];
    },
  });
}
