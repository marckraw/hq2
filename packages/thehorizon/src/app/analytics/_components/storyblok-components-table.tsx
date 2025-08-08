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
import { FluidLoader } from "@/components/horizon/fluid-loader";
import { JsonViewer } from "@/components/ui/json-viewer";
import { useModal } from "@/hooks/useModal";
import {
  useStoryblokComponents,
  type StoryblokComponent,
} from "../_hooks/useStoryblokComponents";

export function StoryblokComponentsTable() {
  const { data: components = [], isLoading, error } = useStoryblokComponents();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedComponent, setSelectedComponent] =
    useState<StoryblokComponent | null>(null);
  const modal = useModal();
  const limit = 10;

  const handleRowClick = (component: StoryblokComponent) => {
    setSelectedComponent(component);
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
            <FluidLoader size="md" message="Loading components..." />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>JSON Content</TableHead>
                    <TableHead>Markdown Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component) => (
                    <TableRow
                      key={component.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(component)}
                    >
                      <TableCell>
                        <Badge variant="outline">{component.name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {new Date(component.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {new Date(component.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <code className="text-xs">
                          {JSON.stringify(component.jsonContent)}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <code className="text-xs">
                          {component.markdownContent}
                        </code>
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

      {/* Component Details Modal */}
      {selectedComponent && (
        <DetailModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          title={`Component Details: ${selectedComponent.name}`}
          width="wide"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">JSON Content</h3>
              <JsonViewer
                data={selectedComponent.jsonContent}
                collapsed={1}
                maxHeight="400px"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Markdown Content</h3>
              <div className="p-3 bg-muted rounded-md overflow-auto max-h-[400px]">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  {selectedComponent.markdownContent}
                </pre>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Created At</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedComponent.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Updated At</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedComponent.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </DetailModal>
      )}
    </Card>
  );
}
