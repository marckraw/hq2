"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useFitnessActivities } from "../_hooks/useRecipes";

export default function FitnessActivitiesPage() {
  const { data, isLoading, error } = useFitnessActivities(100);
  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fitness Activity</h1>
      </div>
      <Breadcrumbs base={{ href: "/fitness", label: "fitness" }} />
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {error && <div className="text-sm text-destructive">Failed to load activity</div>}
          <div className="divide-y">
            {(data ?? []).map((a) => (
              <div key={a.id} className="py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground font-medium">{a.action.replaceAll("_", " ")}</span>
                    {renderBadge(a)}
                    <span className="text-muted-foreground"> · {a.entity}</span>
                    {a.entityId && (
                      <>
                        <span className="text-muted-foreground"> · {a.entityId.slice(0, 8)}</span>
                        {renderEntityLink(a)}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                {renderMeta(a.meta)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderBadge(a: { action: string; entity: string; meta?: unknown }) {
  const action = a.action;
  const meta = (a.meta as Record<string, unknown>) || {};
  if (action === "meal_planned") return <Badge className="bg-blue-600 text-white">Planned</Badge>;
  if (action === "meal_deleted") return <Badge variant="destructive">Deleted</Badge>;
  if (action === "recipe_created") return <Badge>Recipe</Badge>;
  if (action === "recipe_updated") return <Badge variant="outline">Recipe</Badge>;
  if (action === "recipe_deleted") return <Badge variant="destructive">Recipe</Badge>;

  if (action === "meal_updated") {
    const cooked = meta["isCooked"] as undefined | { from?: unknown; to?: unknown };
    if (cooked && typeof cooked === "object" && "to" in cooked) {
      const to = (cooked as any).to;
      if (to === true) return <Badge className="bg-green-600 text-white">Eaten</Badge>;
      if (to === false) return <Badge variant="outline">Unmarked</Badge>;
    }
    return <Badge variant="outline">Updated</Badge>;
  }
  return null;
}

function renderEntityLink(a: { entity: string; entityId?: string | null; meta?: unknown }) {
  if (!a.entityId) return null;
  if (a.entity === "recipe") {
    return (
      <Link href={`/fitness/recipes/${a.entityId}`} className="ml-2 underline">
        open
      </Link>
    );
  }
  if (a.entity === "meal") {
    const meta = (a.meta as Record<string, unknown>) || {};
    const date = typeof meta.date === "string" ? meta.date : undefined;
    const time = typeof meta.time === "string" ? meta.time : undefined;
    if (date) {
      return (
        <Link href={`/fitness/meal/${date}/${a.entityId}`} className="ml-2 underline">
          open
        </Link>
      );
    }
  }
  return null;
}

function renderMeta(meta: unknown) {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  const entries = Object.entries(m);
  if (!entries.length) return null;

  // If looks like a change-set: { key: { from, to } }
  const isChangeSet = entries.every(
    ([, v]) => typeof v === "object" && v !== null && "from" in (v as any) && "to" in (v as any)
  );
  if (isChangeSet) {
    return (
      <div className="mt-1 pl-4 text-xs text-muted-foreground space-y-0.5">
        {entries.map(([k, v]) => {
          const { from, to } = v as { from: unknown; to: unknown };
          return (
            <div key={k}>
              <span className="font-medium text-foreground">{k}</span>: {formatVal(from)} → {formatVal(to)}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: print shallow meta
  return (
    <div className="mt-1 pl-4 text-xs text-muted-foreground space-y-0.5">
      {entries.map(([k, v]) => (
        <div key={k}>
          <span className="font-medium text-foreground">{k}</span>: {formatVal(v)}
        </div>
      ))}
    </div>
  );
}

function formatVal(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v === null || v === undefined) return "–";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
