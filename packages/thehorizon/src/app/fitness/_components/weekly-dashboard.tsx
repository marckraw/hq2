"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useWeeklyPlan } from "../_hooks/useWeeklyPlan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePlanMeal, useRecipes, useTags } from "../_hooks/useRecipes";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

function MealCard({
  title,
  time,
  calories,
  protein,
  carbs,
  fat,
  href,
  onDelete,
}: {
  title: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  href: string;
  onDelete?: () => void;
}) {
  return (
    <div className="group">
      <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <Link href={href} className="truncate mr-2 hover:underline cursor-pointer">
              {title}
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {time}
              </Badge>
              {onDelete && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button title="Remove from day" className="text-xs text-destructive hover:underline">
                      Delete
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Remove meal</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground">
                      This will remove this meal from the day. The recipe stays in your library.
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => (document.activeElement as HTMLElement)?.click()}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={onDelete}>
                        Remove
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 text-xs text-muted-foreground">
          <div className="flex gap-3">
            <span>🟡 {calories} kcal</span>
            <span>🟢 {protein}p</span>
            <span>🔵 {carbs}c</span>
            <span>🟣 {fat}f</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WeeklyDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getMonday = (d: Date) => {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = (copy.getDay() + 6) % 7;
    copy.setDate(copy.getDate() - diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const parseLocalDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map((x) => Number(x));
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const initialOffset = useMemo(() => {
    const qsDate = searchParams.get("date");
    if (!qsDate) return 0;
    const paramMonday = getMonday(parseLocalDate(qsDate));
    const todayMonday = getMonday(new Date());
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.round((paramMonday.getTime() - todayMonday.getTime()) / msPerWeek);
  }, [searchParams]);

  const [weekOffset, setWeekOffset] = useState(initialOffset);
  const { data, isLoading, error } = useWeeklyPlan(weekOffset);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const qc = useQueryClient();
  const { toast } = useToast();
  const deleteMeal = useMutation({
    mutationFn: async (mealId: string) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/meals/${mealId}`);
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}` },
      });
      if (!res.ok) throw new Error("Failed to delete meal");
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-plan"] });
      toast({ title: "Removed", description: "Meal removed from day" });
    },
    onError: () => toast({ title: "Remove failed", variant: "destructive" }),
  });

  const selectedDay = useMemo(() => data?.days?.[selectedIndex], [data, selectedIndex]);
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const updateUrlDate = (isoDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", isoDate);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Auto-select based on ?date= if present, otherwise today's day for current week
  useEffect(() => {
    if (!data) return;
    const qsDate = searchParams.get("date");
    const target = qsDate || new Date().toISOString().slice(0, 10);
    const idx = data.days.findIndex((d) => d.date === target);
    setSelectedIndex(idx >= 0 ? idx : 0);
  }, [data, searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive-foreground">
          Failed to load. Ensure NEXT_PUBLIC_BASE_URL and NEXT_PUBLIC_GC_API_KEY are set.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">This Week</h2>
          <p className="text-sm text-muted-foreground">
            {data.weekStart} – {data.weekEnd}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = weekOffset - 1;
              setWeekOffset(next);
              // set to Monday of new week
              const monday = getMonday(new Date(new Date().setDate(new Date().getDate() + next * 7)));
              const mondayIso = formatLocalDate(monday);
              setSelectedIndex(0);
              updateUrlDate(mondayIso);
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setWeekOffset(0);
              // explicitly select today's index after reload
              if (data) {
                const idx = data.days.findIndex((d) => d.date === todayStr);
                setSelectedIndex(idx >= 0 ? idx : 0);
              } else {
                setSelectedIndex(0);
              }
              updateUrlDate(todayStr);
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = weekOffset + 1;
              setWeekOffset(next);
              const monday = getMonday(new Date(new Date().setDate(new Date().getDate() + next * 7)));
              const mondayIso = formatLocalDate(monday);
              setSelectedIndex(0);
              updateUrlDate(mondayIso);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <Tabs value={`day-${selectedIndex}`} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {data.days.map((d, idx) => (
            <TabsTrigger
              key={d.date}
              value={`day-${idx}`}
              onClick={() => {
                setSelectedIndex(idx);
                updateUrlDate(d.date);
              }}
              className={cn("relative flex flex-col gap-1", d.date === todayStr && "data-[state=inactive]:opacity-100")}
            >
              <span className="text-xs text-muted-foreground">{d.weekday}</span>
              <span className="text-sm">{new Date(d.date).getDate()}</span>
              {d.date === todayStr && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500" />}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">{selectedDay?.weekday} Plan</span>
            <div className="flex gap-3 text-sm text-muted-foreground md:hidden">
              <span>🟡 {selectedDay?.calories} kcal</span>
              <span>🟢 {selectedDay?.protein}p</span>
              <span>🔵 {selectedDay?.carbs}c</span>
              <span>🟣 {selectedDay?.fat}f</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Macro targets & progress */}
          <div className="mb-6 space-y-3">
            {(() => {
              // Mock targets for now; can be user-configured later
              const targets = { calories: 2200, protein: 160, carbs: 220, fat: 70 };
              const totals = {
                calories: selectedDay?.calories ?? 0,
                protein: selectedDay?.protein ?? 0,
                carbs: selectedDay?.carbs ?? 0,
                fat: selectedDay?.fat ?? 0,
              };
              const pct = (val: number, max: number) => Math.round((val / max) * 100);
              const Bar = ({ label, val, max, color }: { label: string; val: number; max: number; color: string }) => {
                const valuePct = Math.min(100, pct(val, max));
                const isOver = val > max;
                return (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn(isOver && "text-destructive")}>
                        {val}/{max}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={valuePct} className={`h-2 ${color}`} />
                      {isOver && <div className="absolute inset-0 rounded bg-red-500/20 animate-pulse" />}
                    </div>
                  </div>
                );
              };
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Bar label="Calories" val={totals.calories} max={targets.calories} color="[&>div]:bg-yellow-500" />
                  <Bar label="Protein" val={totals.protein} max={targets.protein} color="[&>div]:bg-green-500" />
                  <Bar label="Carbs" val={totals.carbs} max={targets.carbs} color="[&>div]:bg-blue-500" />
                  <Bar label="Fat" val={totals.fat} max={targets.fat} color="[&>div]:bg-purple-500" />
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDay?.meals.map((m) => (
              <MealCard
                key={m.id}
                title={m.title}
                time={m.time}
                calories={m.calories}
                protein={m.protein}
                carbs={m.carbs}
                fat={m.fat}
                href={`/fitness/meal/${selectedDay?.date}/${m.id}`}
                onDelete={() => deleteMeal.mutate(m.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Add meal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Plan a meal for {selectedDay?.date}</DialogTitle>
            </DialogHeader>
            <PlanMealForm
              defaultDate={selectedDay?.date || ""}
              onPlanned={() => {
                /* invalidate in hook */
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function PlanMealForm({ defaultDate, onPlanned }: { defaultDate: string; onPlanned: () => void }) {
  const [time, setTime] = useState("12:00");
  const [date, setDate] = useState(defaultDate);
  const [query, setQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const { data: recipes } = useRecipes();
  const { data: tags } = useTags();
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const plan = usePlanMeal();

  const filtered = useMemo(() => {
    const base = recipes ?? [];
    const q = query.trim().toLowerCase();
    return base.filter((r) => {
      const textMatch = !q || r.title.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q);
      const tagMatch = !tagFilter || (r.tags ?? []).some((t) => t.slug === tagFilter);
      return textMatch && tagMatch;
    });
  }, [recipes, query, tagFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Time</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-xs text-muted-foreground">Find recipe</label>
        <Input placeholder="Search recipes..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex gap-2 items-center text-xs">
          <span className="text-muted-foreground">Tags:</span>
          <button
            onClick={() => setTagFilter(null)}
            className={`px-2 py-1 rounded border ${tagFilter === null ? "bg-secondary" : "bg-background"}`}
          >
            All
          </button>
          {(tags ?? []).map((t) => (
            <button
              key={t.id}
              onClick={() => setTagFilter(t.slug)}
              className={`px-2 py-1 rounded border ${tagFilter === t.slug ? "bg-secondary" : "bg-background"}`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="max-h-64 overflow-auto border rounded-md divide-y">
          {filtered.map((r) => (
            <label key={r.id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent/40">
              <input
                type="radio"
                name="recipe"
                value={r.id}
                checked={selectedRecipe === r.id}
                onChange={() => setSelectedRecipe(r.id)}
              />
              <div className="flex-1">
                <div className="text-sm">{r.title}</div>
                {r.description && <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{r.calories} kcal</div>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedRecipe(null);
            setQuery("");
          }}
        >
          Clear
        </Button>
        <Button
          disabled={!selectedRecipe || !date || !time || plan.isPending}
          onClick={async () => {
            if (!selectedRecipe) return;
            await plan.mutateAsync({ recipeId: selectedRecipe, date, time });
            onPlanned();
          }}
        >
          {plan.isPending ? "Planning..." : "Plan meal"}
        </Button>
      </div>
    </div>
  );
}
