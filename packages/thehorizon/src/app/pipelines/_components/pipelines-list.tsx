"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  ArrowUpDown,
} from "lucide-react";
import {
  usePipelines,
  type Pipeline,
  type PipelineStep,
} from "@/hooks/usePipelines";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Using Pipeline and PipelineStep types from usePipelines hook

type SortField = "name" | "status" | "createdAt" | "type";
type SortDirection = "asc" | "desc";

interface FilterState {
  status: string[];
  type: string[];
  origin: string[];
  search: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

function TaskTimeline({ task }: { task: PipelineStep }) {
  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center">
        {getStatusIcon()}
        <div className="w-0.5 h-full bg-border mt-2" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{task.name}</h3>
          <span className="text-sm text-muted-foreground">
            {task.duration || ""}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  pipelineName,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  pipelineName: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Delete Pipeline</h2>
        <p className="mb-4">
          Are you sure you want to delete the pipeline{" "}
          <span className="font-bold">{pipelineName}</span>? This will also
          delete all its steps. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Pipeline["status"] }) {
  const variants = {
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  return <Badge className={variants[status]}>{status}</Badge>;
}

function PipelineFilters({
  filters,
  onFiltersChange,
  allTypes,
  allOrigins,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  allTypes: string[];
  allOrigins: string[];
}) {
  const statusOptions = ["running", "completed", "failed"];

  const toggleFilter = (
    category: "status" | "type" | "origin",
    value: string,
  ) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    onFiltersChange({
      ...filters,
      [category]: updated,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      type: [],
      origin: [],
      search: "",
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.origin.length > 0 ||
    filters.search;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pipelines..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="w-64"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">
                {filters.status.length +
                  filters.type.length +
                  filters.origin.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={
                      filters.status.includes(status) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleFilter("status", status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {allTypes.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTypes.map((type) => (
                      <Button
                        key={type}
                        variant={
                          filters.type.includes(type) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter("type", type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {allOrigins.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Origin</h4>
                  <div className="flex flex-wrap gap-2">
                    {allOrigins.map((origin) => (
                      <Button
                        key={origin}
                        variant={
                          filters.origin.includes(origin)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter("origin", origin)}
                      >
                        {origin}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {hasActiveFilters && (
              <>
                <Separator />
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SortControls({
  sortField,
  sortDirection,
  onSortChange,
}: {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}) {
  const sortOptions: { field: SortField; label: string }[] = [
    { field: "createdAt", label: "Created Date" },
    { field: "name", label: "Name" },
    { field: "status", label: "Status" },
    { field: "type", label: "Type" },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "desc");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      {sortOptions.map(({ field, label }) => (
        <Button
          key={field}
          variant={sortField === field ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSort(field)}
        >
          {label}
          {sortField === field &&
            (sortDirection === "asc" ? (
              <SortAsc className="h-4 w-4 ml-1" />
            ) : (
              <SortDesc className="h-4 w-4 ml-1" />
            ))}
          {sortField !== field && (
            <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
          )}
        </Button>
      ))}
    </div>
  );
}

function PaginationControls({
  pagination,
  totalItems,
  onPaginationChange,
}: {
  pagination: PaginationState;
  totalItems: number;
  onPaginationChange: (pagination: PaginationState) => void;
}) {
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, totalItems);

  const pageSizeOptions = [10, 25, 50, 100];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems} pipelines
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Items per page:</span>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) =>
              onPaginationChange({
                ...pagination,
                pageSize: parseInt(value),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange({ ...pagination, page: 1 })}
            disabled={pagination.page === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPaginationChange({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm px-3">
            Page {pagination.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPaginationChange({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPaginationChange({ ...pagination, page: totalPages })
            }
            disabled={pagination.page === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PipelinesList() {
  const { data: pipelines = [], isLoading, error } = usePipelines();
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const queryClient = useQueryClient();

  // State for filtering, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    type: [],
    origin: [],
    search: "",
  });

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
  });

  // Extract unique types and origins for filtering
  const allTypes = useMemo((): string[] => {
    const types = new Set(
      (pipelines as Pipeline[])
        .map((p: Pipeline) => p.type || "")
        .filter(Boolean),
    );
    return Array.from(types) as string[];
  }, [pipelines]);

  const allOrigins = useMemo((): string[] => {
    const origins = new Set(
      (pipelines as Pipeline[])
        .map((p: Pipeline) => p.origin || "")
        .filter(Boolean),
    );
    return Array.from(origins) as string[];
  }, [pipelines]);

  // Apply filters, sorting, and pagination
  const processedPipelines = useMemo(() => {
    let filtered = [...pipelines];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (pipeline: Pipeline) =>
          pipeline.name.toLowerCase().includes(searchLower) ||
          pipeline.description?.toLowerCase().includes(searchLower) ||
          pipeline.type?.toLowerCase().includes(searchLower),
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((pipeline: Pipeline) =>
        filters.status.includes(pipeline.status),
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter((pipeline: Pipeline) =>
        filters.type.includes(pipeline.type || ""),
      );
    }

    // Apply origin filter
    if (filters.origin.length > 0) {
      filtered = filtered.filter((pipeline: Pipeline) =>
        filters.origin.includes(pipeline.origin || ""),
      );
    }

    // Apply sorting
    filtered.sort((a: Pipeline, b: Pipeline) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "type":
          aValue = a.type || "";
          bValue = b.type || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [pipelines, filters, sortField, sortDirection]);

  // Apply pagination
  const paginatedPipelines = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return processedPipelines.slice(startIndex, endIndex);
  }, [processedPipelines, pagination]);

  // Auto-expand first pipeline when data changes
  useEffect(() => {
    if (paginatedPipelines.length > 0 && openIndexes.length === 0) {
      setOpenIndexes([0]);
    }
  }, [paginatedPipelines.length, openIndexes.length]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters, sortField, sortDirection]);

  const togglePipeline = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [idx],
    );
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/pipelines/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to delete pipeline");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      setDeleteId(null);
      setDeleteName("");
    },
  });

  const onSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64 text-red-500">
          Error loading pipelines.
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!deleteId}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setDeleteId(null);
          setDeleteName("");
        }}
        pipelineName={deleteName}
      />

      <div className="space-y-4 mt-4">
        {/* Filters and Search */}
        <PipelineFilters
          filters={filters}
          onFiltersChange={setFilters}
          allTypes={allTypes}
          allOrigins={allOrigins}
        />

        {/* Sorting Controls */}
        <SortControls
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
        />

        {/* Pagination Top */}
        <PaginationControls
          pagination={pagination}
          totalItems={processedPipelines.length}
          onPaginationChange={setPagination}
        />

        {/* Pipeline Cards */}
        <div className="grid gap-6">
          {paginatedPipelines.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {processedPipelines.length === 0 && pipelines.length > 0
                  ? "No pipelines match your current filters."
                  : "No pipelines found."}
              </AlertDescription>
            </Alert>
          ) : (
            paginatedPipelines.map((pipeline: Pipeline, idx: number) => {
              const isOpen = openIndexes.includes(idx);
              return (
                <Card key={pipeline.id}>
                  <CardHeader
                    className="cursor-pointer select-none group"
                    onClick={() => togglePipeline(idx)}
                  >
                    <CardTitle className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <h2 className="text-xl font-semibold">
                            {pipeline.name}{" "}
                            <span className="text-sm text-muted-foreground font-normal">
                              #{pipeline.id.slice(0, 8)}
                            </span>
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pipeline.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={pipeline.status} />
                            {pipeline.type && (
                              <Badge variant="outline">{pipeline.type}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                pipeline.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 p-1 text-red-600 opacity-70 hover:bg-red-100 hover:opacity-100"
                        title="Delete pipeline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(pipeline.id);
                          setDeleteName(pipeline.name);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {isOpen && (
                    <CardContent>
                      <div className="space-y-4">
                        {pipeline.steps?.map((task: PipelineStep) => (
                          <TaskTimeline key={task.id} task={task} />
                        )) || (
                          <p className="text-muted-foreground">
                            No steps available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination Bottom */}
        {processedPipelines.length > 0 && (
          <PaginationControls
            pagination={pagination}
            totalItems={processedPipelines.length}
            onPaginationChange={setPagination}
          />
        )}
      </div>
    </>
  );
}
