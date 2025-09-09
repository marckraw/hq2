"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDeleteRecipe, useRecipes, useTags } from "../_hooks/useRecipes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function RecipesLibraryPage() {
  const { data: recipes, isLoading, error } = useRecipes();
  const { data: tags } = useTags();
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const del = useDeleteRecipe();

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
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recipes Library</h1>
        <Link href="/fitness/recipes/new">
          <Button size="sm" variant="default">
            New Recipe
          </Button>
        </Link>
      </div>
      <Breadcrumbs base={{ href: "/fitness", label: "fitness" }} />
      <div className="flex flex-wrap gap-2 items-center">
        <div className="w-64">
          <Input placeholder="Search recipes..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 text-sm items-center">
          <span className="text-muted-foreground">Tags:</span>
          <button
            onClick={() => setTagFilter(null)}
            className={`text-xs px-2 py-1 rounded border ${tagFilter === null ? "bg-secondary" : "bg-background"}`}
          >
            All
          </button>
          {(tags ?? []).map((t) => (
            <button
              key={t.id}
              onClick={() => setTagFilter(t.slug)}
              className={`text-xs px-2 py-1 rounded border ${tagFilter === t.slug ? "bg-secondary" : "bg-background"}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load recipes.</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(filtered ?? []).map((r) => (
          <Card key={r.id} className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="truncate mr-2">{r.title}</span>
                <div className="flex gap-2">
                  <Link href={`/fitness/recipes/${r.id}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <ConfirmDelete onConfirm={() => del.mutate(r.id)} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              {r.description && <div className="line-clamp-3">{r.description}</div>}
              <div className="flex flex-wrap gap-1">
                {(r.tags ?? []).map((t) => (
                  <Badge key={t.id} variant="outline">
                    {t.name}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-3">
                <span>🟡 {r.calories} kcal</span>
                <span>🟢 {r.protein}p</span>
                <span>🔵 {r.carbs}c</span>
                <span>🟣 {r.fat}f</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete recipe</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Are you sure you want to delete this recipe? This action cannot be undone.
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => (document.activeElement as HTMLElement)?.click()}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
