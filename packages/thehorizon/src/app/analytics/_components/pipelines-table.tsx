"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FluidLoader } from "@/components/horizon/fluid-loader";
import { DetailModal } from "@/components/ui/detail-modal";
import { PipelineDetails } from "./pipeline-details";
import { useModal } from "@/hooks/useModal";
import {
  usePipelines,
  usePipelineDetails,
  type Pipeline,
} from "@/hooks/usePipelines";

export function PipelinesTable() {
  const [page, setPage] = useState(1);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(
    null
  );
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null
  );
  const modal = useModal();
  const limit = 10;

  // Calculate offset based on current page
  const offset = (page - 1) * limit;

  // Use the new hooks
  const {
    data: pipelines = [],
    isLoading,
    error,
  } = usePipelines({ limit, offset });
  const { data: pipelineDetails } = usePipelineDetails(selectedPipelineId);

  // Check if we have more data to load (if we got exactly the limit, there might be more)
  const hasMore = pipelines.length === limit;

  const handleRowClick = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setSelectedPipelineId(pipeline.id);
    modal.open();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      completed: "default",
      failed: "destructive",
      cancelled: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "An error occurred"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FluidLoader size="md" message="Loading pipelines..." />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelines.map((pipeline) => (
                    <TableRow
                      key={pipeline.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(pipeline)}
                    >
                      <TableCell className="font-medium">
                        {pipeline.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pipeline.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pipeline.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(pipeline.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {new Date(pipeline.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {pipeline.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Pipeline Details Modal */}
      {selectedPipeline && (
        <DetailModal
          isOpen={modal.isOpen}
          onClose={() => {
            modal.close();
            setSelectedPipeline(null);
            setSelectedPipelineId(null);
          }}
          title={`Pipeline: ${selectedPipeline.name}`}
          width="wide"
        >
          <PipelineDetails pipeline={pipelineDetails || selectedPipeline} />
        </DetailModal>
      )}
    </Card>
  );
}
