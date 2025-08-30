"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type RecipeFormValues = {
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

export function isValidUrl(v: string) {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export function RecipeForm({
  initial,
  onSubmit,
  actionLabel = "Save",
}: {
  initial: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => Promise<void> | void;
  actionLabel?: string;
}) {
  const form = useForm<RecipeFormValues>({ defaultValues: initial });
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    trigger,
    control,
  } = form;
  const ingredientsArray = useFieldArray({ control, name: "ingredients" });
  const stepsArray = useFieldArray({ control, name: "steps" });
  const imagesArray = useFieldArray({ control, name: "images" });

  const submit = handleSubmit(async (values) => {
    const ok = await trigger();
    if (!ok) return;
    await onSubmit(values);
  });

  return (
    <div className="space-y-4">
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
          {errors.servings && <div className="text-xs text-destructive mt-1">{String(errors.servings.message)}</div>}
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
              {...register(`images.${i}.url` as const, { validate: (v) => isValidUrl(v) || "Must be a valid URL" })}
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
        <Button disabled={isSubmitting} onClick={submit}>
          {isSubmitting ? "Saving..." : actionLabel}
        </Button>
      </div>
    </div>
  );
}
