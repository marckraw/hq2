"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTags } from "../../_hooks/useRecipes";
import type { RecipeFormValues } from "../../_components/recipe-form";
import { RecipeForm } from "../../_components/recipe-form";
import { useToast } from "@/components/ui/toast";

export default function NewRecipePage() {
  const router = useRouter();
  const { data: tags } = useTags();
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const onSubmit = async (values: RecipeFormValues) => {
    const body = {
      ...values,
      tags: selectedTags,
      images: values.images.map((im: { url: string }, i: number) => ({ url: im.url, sortOrder: i })),
      ingredients: values.ingredients.map((it: { text: string }, i: number) => ({ text: it.text, sortOrder: i })),
      steps: values.steps.map((st: { text: string }, i: number) => ({ text: st.text, sortOrder: i })),
    };
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
    toast({ title: "Created", description: "Recipe saved" });
    router.push("/fitness/recipes");
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Recipe</h1>
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
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
          <RecipeForm
            initial={{
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
              tags: [],
              ingredients: [],
              steps: [],
              images: [],
            }}
            onSubmit={onSubmit}
            actionLabel="Save recipe"
          />
        </CardContent>
      </Card>
    </div>
  );
}
