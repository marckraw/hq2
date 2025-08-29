"use client";

import { useQuery } from "@tanstack/react-query";

export interface MealPlanItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags?: string[];
}

export interface DayPlan {
  date: string; // yyyy-mm-dd
  weekday: string; // Mon, Tue
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: MealPlanItem[];
}

export interface WeeklyPlanResponse {
  weekStart: string;
  weekEnd: string;
  days: DayPlan[];
}

export interface MealDetailResponse {
  date: string;
  weekday: string;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  meal: MealPlanItem & {
    imageUrl: string;
    prepTimeMinutes: number;
    difficulty: string;
    servings: number;
    additionalImages?: string[];
    ingredients: string[];
    instructions: string[];
  };
}

async function fetchWeeklyPlan(offset: number): Promise<WeeklyPlanResponse> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/weekly`);
  if (offset) url.searchParams.set("offset", String(offset));
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load weekly plan");
  return res.json();
}

export function useWeeklyPlan(offset: number = 0) {
  return useQuery({
    queryKey: ["weekly-plan", offset],
    queryFn: () => fetchWeeklyPlan(offset),
  });
}

export async function fetchMealDetailApi(date: string, mealId: string): Promise<MealDetailResponse> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fitness/meal`);
  url.searchParams.set("date", date);
  url.searchParams.set("mealId", mealId);
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load meal detail");
  return res.json();
}

export function useMealDetail(date: string, mealId: string) {
  return useQuery({
    queryKey: ["meal-detail", date, mealId],
    queryFn: () => fetchMealDetailApi(date, mealId),
    enabled: Boolean(date && mealId),
  });
}
