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
import { SignalDetails } from "./signal-details";
import { FluidLoader } from "@/components/horizon/fluid-loader";
import { useModal } from "@/hooks/useModal";
import { useSignals, type Signal } from "../_hooks/useSignals";

export function SignalsTable() {
  const [page, setPage] = useState(1);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const modal = useModal();
  const limit = 10;

  // Calculate offset based on current page
  const offset = (page - 1) * limit;

  // Use the new hook
  const {
    data: signals = [],
    isLoading,
    error,
  } = useSignals({ limit, offset });

  // Check if we have more data to load (if we got exactly the limit, there might be more)
  const hasMore = signals.length === limit;

  const handleRowClick = (signal: Signal) => {
    setSelectedSignal(signal);
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
            <FluidLoader size="md" message="Loading signals..." />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Metadata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.map((signal) => (
                    <TableRow
                      key={signal.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(signal)}
                    >
                      <TableCell className="font-mono">
                        {new Date(signal.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{signal.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{signal.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <code className="text-xs">
                          {JSON.stringify(signal.payload)}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <code className="text-xs">
                          {JSON.stringify(signal.metadata)}
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

      {/* Signal Details Modal */}
      {selectedSignal && (
        <DetailModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          title={`Signal Details: ${selectedSignal.source}.${selectedSignal.type}`}
          width="wide"
        >
          <SignalDetails signal={selectedSignal} />
        </DetailModal>
      )}
    </Card>
  );
}
