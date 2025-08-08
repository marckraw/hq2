"use client";

import { PipelinesList } from "./_components/pipelines-list";
import { usePipelinesWithPagination } from "@/hooks/usePipelines";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PipelinesPage() {
  // Origin filter state
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  const { data, isLoading } = usePipelinesWithPagination({
    origin: selectedOrigins,
  });

  const pipelines = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  const queryClient = useQueryClient();

  const runningCount = useMemo(() => {
    return pipelines.filter((p: any) => p.status === "active").length;
  }, [pipelines]);

  // Available origins for filter
  const availableOrigins = [
    "thehorizon",
    "slack",
    "storyblok-ui",
    "storyblok-plugin",
    "email",
    "api",
    "webhook",
    "system",
    "unknown",
  ];

  const handleOriginFilterChange = (value: string) => {
    if (value === "all") {
      setSelectedOrigins([]);
    } else {
      setSelectedOrigins([value]);
    }
  };

  return (
    <div className="md:container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Pipelines</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Origin Filter */}
          <Select
            value={selectedOrigins[0] || "all"}
            onValueChange={handleOriginFilterChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              {availableOrigins.map((origin) => (
                <SelectItem key={origin} value={origin}>
                  {origin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            {runningCount} active, {totalCount} total pipelines
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["pipelines"] });
              queryClient.invalidateQueries({
                queryKey: ["pipelines-with-pagination"],
              });
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <PipelinesList />
    </div>
  );
}
