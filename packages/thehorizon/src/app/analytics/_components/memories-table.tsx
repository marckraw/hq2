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
import { DetailModal } from "@/components/ui/detail-modal";
import { MemoryDetails } from "./memory-details";
import { FluidLoader } from "@/components/horizon/fluid-loader";
import { useModal } from "@/hooks/useModal";
import { useMemories, type Memory } from "../_hooks/useMemories";

export function MemoriesTable() {
  const [page, setPage] = useState(1);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const modal = useModal();
  const limit = 10;

  // Calculate offset based on current page
  const offset = (page - 1) * limit;

  // Use the new hook
  const {
    data: memories = [],
    isLoading,
    error,
  } = useMemories({ limit, offset });

  // Check if we have more data to load (if we got exactly the limit, there might be more)
  const hasMore = memories.length === limit;

  const handleRowClick = (memory: Memory) => {
    setSelectedMemory(memory);
    modal.open();
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
            <FluidLoader size="md" message="Loading memories..." />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memories.map((memory) => (
                    <TableRow
                      key={memory.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(memory)}
                    >
                      <TableCell className="font-mono">{memory.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{memory.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {memory.content}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {memory.tags?.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(memory.createdAt).toLocaleString()}
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

      {/* Memory Details Modal */}
      {selectedMemory && (
        <DetailModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          title={`Memory Details: ${selectedMemory.type}`}
          width="wide"
        >
          <MemoryDetails memory={selectedMemory} />
        </DetailModal>
      )}
    </Card>
  );
}
