"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRecipe, useTags, useUpdateRecipe } from "../../_hooks/useRecipes";

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data } = useRecipe(id);
  const { data: tags } = useTags();
  const update = useUpdateRecipe();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(0);
  const [difficulty, setDifficulty] = useState("Easy");
  const [servings, setServings] = useState(1);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!data) return;
    setTitle(data.title ?? "");
    setDescription(data.description ?? "");
    setHeroImageUrl(data.heroImageUrl ?? "");
    setPrepTimeMinutes(data.prepTimeMinutes ?? 0);
    setDifficulty(data.difficulty ?? "Easy");
    setServings(data.servings ?? 1);
    setCalories(data.calories ?? 0);
    setProtein(data.protein ?? 0);
    setCarbs(data.carbs ?? 0);
    setFat(data.fat ?? 0);
    setSelectedTags((data.tags ?? []).map((t: any) => t.slug));
    setIngredients((data.ingredients ?? []).map((i: any) => i.text));
    setSteps((data.steps ?? []).map((s: any) => s.text));
    setImages((data.images ?? []).map((im: any) => im.url));
  }, [data]);

  async function onSubmit() {
    setSubmitting(true);
    try {
      const body = {
        title,
        description,
        heroImageUrl: heroImageUrl || undefined,
        prepTimeMinutes,
        difficulty,
        servings,
        calories,
        protein,
        carbs,
        fat,
        images: images.filter(Boolean).map((url, i) => ({ url, sortOrder: i })),
        ingredients: ingredients.filter(Boolean).map((text, i) => ({ text, sortOrder: i })),
        steps: steps.filter(Boolean).map((text, i) => ({ text, sortOrder: i })),
        tags: selectedTags,
      };
      await update.mutateAsync({ id, body });
      router.push("/fitness/recipes");
    } finally {
      setSubmitting(false);
    }
  }

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hero image URL</label>
              <Input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Prep time (min)</label>
              <Input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <Input value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Servings</label>
              <Input type="number" value={servings} onChange={(e) => setServings(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-4 gap-2 col-span-full">
              <div>
                <label className="text-xs text-muted-foreground">Calories</label>
                <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Protein</label>
                <Input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Carbs</label>
                <Input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fat</label>
                <Input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableList title="Ingredients" values={ingredients} setValues={setIngredients} />
            <EditableList title="Steps" values={steps} setValues={setSteps} />
          </div>

          <EditableList title="Additional Images" values={images} setValues={setImages} />

          <div className="flex justify-end">
            <Button disabled={!title || submitting} onClick={onSubmit}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditableList({ title, values, setValues }: { title: string; values: string[]; setValues: (v: any) => void }) {
  const addRow = () => setValues((prev: string[]) => [...prev, ""]);
  const updateRow = (idx: number, value: string) =>
    setValues((prev: string[]) => prev.map((v, i) => (i === idx ? value : v)));
  const removeRow = (idx: number) => setValues((prev: string[]) => prev.filter((_, i) => i !== idx));
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      {values.map((val, i) => (
        <div key={i} className="flex gap-2">
          <Input value={val} onChange={(e) => updateRow(i, e.target.value)} />
          <Button variant="outline" onClick={() => removeRow(i)}>
            Remove
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow}>
        Add
      </Button>
    </div>
  );
}
