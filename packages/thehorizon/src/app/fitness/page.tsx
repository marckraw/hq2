import { Suspense } from "react";
import { WeeklyDashboard } from "./_components/weekly-dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function FitnessPage() {
  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fitness</h1>
        <div className="flex gap-2">
          <Link href="/fitness/activities">
            <Button variant="outline" size="sm">
              Activity
            </Button>
          </Link>
          <Link href="/fitness/recipes">
            <Button variant="outline" size="sm">
              Open Recipes Library
            </Button>
          </Link>
        </div>
      </div>
      <Breadcrumbs base={{ href: "/fitness", label: "fitness" }} />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <WeeklyDashboard />
      </Suspense>
    </div>
  );
}
