"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMealDetail } from "../../../_hooks/useWeeklyPlan";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function MealDetailPage() {
  const params = useParams<{ date: string; mealId: string }>();
  const date = params?.date as string;
  const mealId = params?.mealId as string;
  const { data, isLoading, error } = useMealDetail(date, mealId);

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive-foreground">
          Failed to load meal details.
        </CardContent>
      </Card>
    );
  }

  const { meal, weekday, date: d, totals } = data;

  return (
    <div className="px-6 py-6">
      <Breadcrumbs base={{ href: "/fitness", label: "fitness" }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:sticky lg:top-6 self-start">
          <div className="rounded-xl overflow-hidden shadow border border-border">
            <div className="relative group">
              <div className="aspect-[4/3] w-full bg-muted">
                <img
                  src={meal.imageUrl}
                  alt={meal.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                  loading="eager"
                />
              </div>
            </div>
          </div>
          {meal.additionalImages && meal.additionalImages.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {meal.additionalImages.map((src, i) => (
                <div key={i} className="aspect-[4/3] w-full overflow-hidden rounded-md border border-border">
                  <img src={src} alt={`${meal.title} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="rounded-md border border-border p-2 text-center">
              <div className="font-medium text-foreground">{meal.prepTimeMinutes} min</div>
              <div>Time</div>
            </div>
            <div className="rounded-md border border-border p-2 text-center">
              <div className="font-medium text-foreground">{meal.difficulty}</div>
              <div>Difficulty</div>
            </div>
            <div className="rounded-md border border-border p-2 text-center">
              <div className="font-medium text-foreground">{meal.servings}</div>
              <div>Servings</div>
            </div>
          </div>
        </div>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{meal.title}</span>
              <Badge variant="outline">{meal.time}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="text-muted-foreground">
              {weekday} • {d}
            </div>
            {meal.description && (
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{meal.description}</div>
            )}
            <div className="flex flex-wrap gap-4">
              <span>🟡 {meal.calories} kcal</span>
              <span>🟢 {meal.protein}p</span>
              <span>🔵 {meal.carbs}c</span>
              <span>🟣 {meal.fat}f</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Day totals: {totals.calories} kcal, {totals.protein}p / {totals.carbs}c / {totals.fat}f
            </div>
            <div>
              <h3 className="font-medium mb-2">Ingredients</h3>
              <ul className="list-disc pl-6 space-y-1">
                {meal.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Method</h3>
              <ol className="list-decimal pl-6 space-y-1">
                {meal.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
