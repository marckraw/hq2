"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTags } from "../../_hooks/useRecipes";
import { useForm, useFieldArray } from "react-hook-form";
type RecipeFormValues = {
  title: string;
  description?: string;
  heroImageUrl: string;
  prepTimeMinutes?: number;
  difficulty?: string;
  servings?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tags: string[];
  ingredients: { text: string }[];
  steps: { text: string }[];
  images: { url: string }[];
};
import { useToast } from "@/components/ui/toast";

export default function NewRecipePage() {
  const router = useRouter();
  const { data: tags } = useTags();
  const { toast } = useToast();
  const form = useForm<RecipeFormValues>({
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
      tags: [],
      ingredients: [],
      steps: [],
      images: [],
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
    watch,
    formState: { errors },
    trigger,
  } = form;
  const ingredientsArray = useFieldArray({ control: form.control, name: "ingredients" });
  const stepsArray = useFieldArray({ control: form.control, name: "steps" });
  const imagesArray = useFieldArray({ control: form.control, name: "images" });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const onSubmit = handleSubmit(async (values) => {
    const ok = await trigger();
    if (!ok) return;
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
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input {...register("title", { required: "Title is required" })} />
              {errors.title && <div className="text-xs text-destructive mt-1">{String(errors.title.message)}</div>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hero image URL</label>
              <Input
                {...register("heroImageUrl", {
                  required: "Hero image is required",
                  validate: (v) => isValidUrl(v) || "Must be a valid URL",
                })}
              />
              {errors.heroImageUrl && (
                <div className="text-xs text-destructive mt-1">{String(errors.heroImageUrl.message)}</div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Prep time (min)</label>
              <Input
                type="number"
                {...register("prepTimeMinutes", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
              />
              {errors.prepTimeMinutes && (
                <div className="text-xs text-destructive mt-1">{String(errors.prepTimeMinutes.message)}</div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <Input {...register("difficulty")} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Servings</label>
              <Input
                type="number"
                {...register("servings", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
              />
              {errors.servings && (
                <div className="text-xs text-destructive mt-1">{String(errors.servings.message)}</div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 col-span-full">
              <div>
                <label className="text-xs text-muted-foreground">Calories</label>
                <Input
                  type="number"
                  {...register("calories", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Protein</label>
                <Input
                  type="number"
                  {...register("protein", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Carbs</label>
                <Input
                  type="number"
                  {...register("carbs", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fat</label>
                <Input
                  type="number"
                  {...register("fat", { valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea rows={6} {...register("description")} />
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
            <div className="space-y-2">
              <div className="text-sm font-medium">Ingredients</div>
              {ingredientsArray.fields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    {...register(`ingredients.${i}.text` as const, { minLength: { value: 1, message: "Required" } })}
                  />
                  <Button variant="outline" onClick={() => ingredientsArray.remove(i)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => ingredientsArray.append({ text: "" })}>
                Add ingredient
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Steps</div>
              {stepsArray.fields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input {...register(`steps.${i}.text` as const, { minLength: { value: 1, message: "Required" } })} />
                  <Button variant="outline" onClick={() => stepsArray.remove(i)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => stepsArray.append({ text: "" })}>
                Add step
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Additional Images</div>
            {imagesArray.fields.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  {...register(`images.${i}.url` as const, {
                    validate: (v) => isValidUrl(v) || "Must be a valid URL",
                  })}
                />
                <Button variant="outline" onClick={() => imagesArray.remove(i)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => imagesArray.append({ url: "" })}>
              Add image
            </Button>
          </div>

          <div className="flex justify-end">
            <Button disabled={isSubmitting} onClick={onSubmit}>
              {isSubmitting ? "Saving..." : "Save recipe"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function isValidUrl(v: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(v);
    return true;
  } catch {
    return false;
  }
}
