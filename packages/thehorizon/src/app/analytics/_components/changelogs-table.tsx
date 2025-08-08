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
import { ChangelogDetails } from "./changelog-details";
import { FluidLoader } from "@/components/horizon/fluid-loader";
import { useModal } from "@/hooks/useModal";
import { useChangelogs, type Changelog } from "../_hooks/useChangelogs";

export function ChangelogsTable() {
  const [page, setPage] = useState(1);
  const [selectedChangelog, setSelectedChangelog] = useState<Changelog | null>(
    null
  );
  const modal = useModal();
  const limit = 10;

  // Calculate offset based on current page
  const offset = (page - 1) * limit;

  // Use the new hook
  const {
    data: changelogs = [],
    isLoading,
    error,
  } = useChangelogs({ limit, offset });

  // Check if we have more data to load (if we got exactly the limit, there might be more)
  const hasMore = changelogs.length === limit;

  const handleRowClick = (changelog: Changelog) => {
    setSelectedChangelog(changelog);
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
            <FluidLoader size="md" message="Loading changelogs..." />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead>PR</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changelogs.map((changelog) => (
                    <TableRow
                      key={changelog.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(changelog)}
                    >
                      <TableCell>
                        <Badge variant="outline">
                          {changelog.repoOwner}/{changelog.repoName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">#{changelog.prNumber}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {changelog.title}
                      </TableCell>
                      <TableCell>
                        {new Date(changelog.releaseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={changelog.published ? "default" : "outline"}
                        >
                          {changelog.published ? "Published" : "Draft"}
                        </Badge>
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

      {/* Changelog Details Modal */}
      {selectedChangelog && (
        <DetailModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          title={`Changelog: ${selectedChangelog.repoOwner}/${selectedChangelog.repoName} #${selectedChangelog.prNumber}`}
          width="wide"
        >
          <ChangelogDetails changelog={selectedChangelog} />
        </DetailModal>
      )}
    </Card>
  );
}
