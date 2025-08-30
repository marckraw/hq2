"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { RecipeFormValues } from "../../_components/recipe-form";
import { RecipeForm } from "../../_components/recipe-form";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecipe, useTags, useUpdateRecipe } from "../../_hooks/useRecipes";

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data } = useRecipe(id);
  const { data: tags } = useTags();
  const update = useUpdateRecipe();
  const router = useRouter();

  type FormValues = RecipeFormValues;
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      heroImageUrl: "",
      prepTimeMinutes: 0,
      difficulty: "Easy",
      servings: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: [],
      steps: [],
      images: [],
    },
  });
  const { reset } = form;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    reset({
      title: data.title ?? "",
      description: data.description ?? "",
      heroImageUrl: data.heroImageUrl ?? "",
      prepTimeMinutes: data.prepTimeMinutes ?? 0,
      difficulty: data.difficulty ?? "Easy",
      servings: data.servings ?? 1,
      calories: data.calories ?? 0,
      protein: data.protein ?? 0,
      carbs: data.carbs ?? 0,
      fat: data.fat ?? 0,
      ingredients: (data.ingredients ?? []).map((i: any) => ({ text: i.text })),
      steps: (data.steps ?? []).map((s: any) => ({ text: s.text })),
      images: (data.images ?? []).map((im: any) => ({ url: im.url })),
    });
    setSelectedTags((data.tags ?? []).map((t: any) => t.slug));
  }, [data, reset]);

  const onSubmit = async (values: RecipeFormValues) => {
    const body = {
      ...values,
      tags: selectedTags,
      images: values.images.map((im: { url: string }, i: number) => ({ url: im.url, sortOrder: i })),
      ingredients: values.ingredients.map((it: { text: string }, i: number) => ({ text: it.text, sortOrder: i })),
      steps: values.steps.map((st: { text: string }, i: number) => ({ text: st.text, sortOrder: i })),
    };
    await update.mutateAsync({ id, body });
    toast({ title: "Saved", description: "Recipe updated" });
    router.push("/fitness/recipes");
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Recipe</h1>
        <Link href="/fitness/recipes">
          <Button variant="outline" size="sm">
            Back to Library
          </Button>
        </Link>
      </div>
      <Breadcrumbs base={{ href: "/fitness", label: "fitness" }} />
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <div className="text-sm font-medium">Tags</div>
            <div className="flex flex-wrap gap-2">
              {(tags ?? []).map((t) => {
                const active = selectedTags.includes(t.slug);
                return (
                  <button
                    key={t.id}
                    onClick={() =>
                      setSelectedTags((prev) => (active ? prev.filter((s) => s !== t.slug) : [...prev, t.slug]))
                    }
                    className={`text-xs px-2 py-1 rounded border ${active ? "bg-secondary" : "bg-background"}`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {data && (
            <RecipeForm
              initial={{
                title: data.title,
                description: data.description ?? "",
                heroImageUrl: data.heroImageUrl ?? "",
                prepTimeMinutes: data.prepTimeMinutes ?? 0,
                difficulty: data.difficulty ?? "Easy",
                servings: data.servings ?? 1,
                calories: data.calories ?? 0,
                protein: data.protein ?? 0,
                carbs: data.carbs ?? 0,
                fat: data.fat ?? 0,
                tags: selectedTags,
                ingredients: (data.ingredients ?? []).map((i: any) => ({ text: i.text })),
                steps: (data.steps ?? []).map((s: any) => ({ text: s.text })),
                images: (data.images ?? []).map((im: any) => ({ url: im.url })),
              }}
              onSubmit={onSubmit}
              actionLabel="Save changes"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Shared RecipeForm handles all inputs and validation
