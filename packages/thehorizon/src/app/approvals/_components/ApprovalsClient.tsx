"use client";

import { useApprovalsWithPagination } from "../_hooks/useApprovals";
import { ApprovalItem } from "@/components/horizon/approval-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  ArrowUpDown,
} from "lucide-react";
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
import { useState, useMemo, useEffect } from "react";

type ApprovalStatus = "pending" | "approved" | "rejected";
type ApprovalRisk = "low" | "medium" | "high";
type SortField = "createdAt" | "status" | "risk" | "approvedAt" | "rejectedAt";
type SortDirection = "asc" | "desc";

interface ApprovalData {
  id: string;
  status: ApprovalStatus;
  risk: ApprovalRisk;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  pipeline?: {
    name?: string;
    type?: string;
  };
  step?: {
    name?: string;
  };
  summary?: string;
}

interface FilterState {
  status: string[];
  risk: string[];
  origin: string[];
  search: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

function ApprovalFilters({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}) {
  const statusOptions = ["pending", "approved", "rejected"];
  const riskOptions = ["low", "medium", "high"];
  const originOptions = [
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

  const toggleFilter = (
    category: "status" | "risk" | "origin",
    value: string
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
      risk: [],
      origin: [],
      search: "",
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.risk.length > 0 ||
    filters.origin.length > 0 ||
    filters.search;

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search approvals..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="w-full sm:w-64"
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
                  filters.risk.length +
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

            <Separator />
            <div>
              <h4 className="font-medium mb-2">Risk Level</h4>
              <div className="flex flex-wrap gap-2">
                {riskOptions.map((risk) => (
                  <Button
                    key={risk}
                    variant={
                      filters.risk.includes(risk) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleFilter("risk", risk)}
                  >
                    {risk}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />
            <div>
              <h4 className="font-medium mb-2">Origin</h4>
              <div className="flex flex-wrap gap-2">
                {originOptions.map((origin) => (
                  <Button
                    key={origin}
                    variant={
                      filters.origin.includes(origin) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleFilter("origin", origin)}
                  >
                    {origin}
                  </Button>
                ))}
              </div>
            </div>

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
    { field: "status", label: "Status" },
    { field: "risk", label: "Risk Level" },
    { field: "approvedAt", label: "Approved Date" },
    { field: "rejectedAt", label: "Rejected Date" },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "desc");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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
        Showing {startItem}-{endItem} of {totalItems} approvals
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
        <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex flex-wrap items-center gap-1 justify-center">
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

export function ApprovalsClient() {
  const queryClient = useQueryClient();

  // State for filtering, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    risk: [],
    origin: [],
    search: "",
  });

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
  });

  // Use server-side pagination with current filters
  const { data, isLoading, error } = useApprovalsWithPagination({
    limit: pagination.pageSize,
    offset: (pagination.page - 1) * pagination.pageSize,
    status:
      filters.status.length === 1
        ? (filters.status[0] as "pending" | "approved" | "rejected")
        : undefined,
    risk:
      filters.risk.length === 1
        ? (filters.risk[0] as "low" | "medium" | "high")
        : undefined,
    search: filters.search || undefined,
    origin: filters.origin.length > 0 ? filters.origin : undefined,
  });

  const approvalsData = data?.data || [];
  const totalCount = data?.pagination?.total || 0;

  // Since we're using server-side pagination, we don't need client-side processing
  const displayedApprovals = approvalsData;

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const approveMutation = useMutation({
    mutationFn: async ({
      id,
      editedData,
    }: {
      id: string;
      editedData?: {
        title?: string;
        summary?: string;
        storyblokContent?: string;
      };
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/approvals/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
          body: JSON.stringify({
            editedData,
            origin: "thehorizon", // 🎯 Send origin from frontend
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/approvals/${id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
          body: JSON.stringify({
            origin: "thehorizon", // 🎯 Send origin from frontend
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });

  const onSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  if (isLoading) {
    return <div className="container py-6">Loading approvals...</div>;
  }
  if (error) {
    return (
      <div className="container py-6 text-red-500">
        Error loading approvals.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <ApprovalFilters filters={filters} onFiltersChange={setFilters} />

      {/* Sorting Controls */}
      <SortControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
      />

      {/* Pagination Top */}
      <PaginationControls
        pagination={pagination}
        totalItems={totalCount}
        onPaginationChange={setPagination}
      />

      {/* Approvals List */}
      <div className="space-y-4">
        {displayedApprovals.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {totalCount === 0
                ? "No approvals found."
                : "No approvals match your current filters."}
            </AlertDescription>
          </Alert>
        ) : (
          displayedApprovals.map((item: any, index: number) => (
            <ApprovalItem
              key={item.id}
              item={item}
              onApprove={(
                id: string,
                editedData?: { title?: string; summary?: string }
              ) => approveMutation.mutate({ id, editedData })}
              onReject={() => rejectMutation.mutate(item.id)}
              isExpanded={index === 0 && item.status === "pending"}
            />
          ))
        )}
      </div>

      {/* Pagination Bottom */}
      {totalCount > 0 && (
        <PaginationControls
          pagination={pagination}
          totalItems={totalCount}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
}
