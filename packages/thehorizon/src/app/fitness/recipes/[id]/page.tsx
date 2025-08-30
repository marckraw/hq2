"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/components/ui/toast";
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

  type FormValues = {
    title: string;
    description?: string;
    heroImageUrl?: string;
    prepTimeMinutes?: number;
    difficulty?: string;
    servings?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    ingredients: { text: string }[];
    steps: { text: string }[];
    images: { url: string }[];
  };
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const ingredientsArray = useFieldArray({ control: form.control, name: "ingredients" });
  const stepsArray = useFieldArray({ control: form.control, name: "steps" });
  const imagesArray = useFieldArray({ control: form.control, name: "images" });
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

  const onSubmit = handleSubmit(async (values) => {
    const body = {
      ...values,
      tags: selectedTags,
      images: values.images.map((im, i) => ({ url: im.url, sortOrder: i })),
      ingredients: values.ingredients.map((it, i) => ({ text: it.text, sortOrder: i })),
      steps: values.steps.map((st, i) => ({ text: st.text, sortOrder: i })),
    };
    await update.mutateAsync({ id, body });
    toast({ title: "Saved", description: "Recipe updated" });
    router.push("/fitness/recipes");
  });

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
              <Input {...register("title", { required: true })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hero image URL</label>
              <Input {...register("heroImageUrl")} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Prep time (min)</label>
              <Input type="number" {...register("prepTimeMinutes", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <Input {...register("difficulty")} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Servings</label>
              <Input type="number" {...register("servings", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-4 gap-2 col-span-full">
              <div>
                <label className="text-xs text-muted-foreground">Calories</label>
                <Input type="number" {...register("calories", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Protein</label>
                <Input type="number" {...register("protein", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Carbs</label>
                <Input type="number" {...register("carbs", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fat</label>
                <Input type="number" {...register("fat", { valueAsNumber: true })} />
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
            <EditableList
              title="Ingredients"
              fields={ingredientsArray.fields}
              register={register}
              onRemove={(i) => ingredientsArray.remove(i)}
              onAdd={() => ingredientsArray.append({ text: "" })}
              namePrefix="ingredients"
            />
            <EditableList
              title="Steps"
              fields={stepsArray.fields}
              register={register}
              onRemove={(i) => stepsArray.remove(i)}
              onAdd={() => stepsArray.append({ text: "" })}
              namePrefix="steps"
            />
          </div>

          <EditableList
            title="Additional Images"
            fields={imagesArray.fields}
            register={register}
            onRemove={(i) => imagesArray.remove(i)}
            onAdd={() => imagesArray.append({ url: "" })}
            namePrefix="images"
            isImage
          />

          <div className="flex justify-end">
            <Button disabled={isSubmitting} onClick={onSubmit}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditableList({
  title,
  fields,
  register,
  onRemove,
  onAdd,
  namePrefix,
  isImage,
}: {
  title: string;
  fields: { id: string }[];
  register: any;
  onRemove: (i: number) => void;
  onAdd: () => void;
  namePrefix: string;
  isImage?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      {fields.map((f, i) => (
        <div key={f.id} className="flex gap-2">
          <Input {...register(`${namePrefix}.${i}.${isImage ? "url" : "text"}`)} />
          <Button variant="outline" onClick={() => onRemove(i)}>
            Remove
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd}>
        Add
      </Button>
    </div>
  );
}
