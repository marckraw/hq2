"use client";

import { useFigmaFile } from "../_hooks/useFigma";
import { useModal } from "@/hooks/useModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DetailModal } from "@/components/ui/detail-modal";
import { JsonViewer } from "@/components/ui/json-viewer";

const countNodesByType = (nodes: any[]): Record<string, number> => {
  const counts: Record<string, number> = {};

  const traverse = (node: any) => {
    counts[node.type] = (counts[node.type] || 0) + 1;
    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  nodes.forEach(traverse);
  return counts;
};

const NodeTree = ({
  node,
  onSelect,
  selectedNodeId,
}: {
  node: any;
  onSelect: (node: any) => void;
  selectedNodeId: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex items-center gap-2 w-full p-2 hover:bg-accent rounded-md",
          isSelected && "bg-accent"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
        <span className="font-medium">{node.name}</span>
        <span className="text-sm text-muted-foreground">({node.type})</span>
        {node.absoluteBoundingBox && (
          <span className="text-xs text-muted-foreground">
            {Math.round(node.absoluteBoundingBox.width)}x
            {Math.round(node.absoluteBoundingBox.height)}
          </span>
        )}
      </CollapsibleTrigger>
      {hasChildren && (
        <CollapsibleContent className="pl-6 mt-1">
          {node.children.map((child: any) => (
            <NodeTree
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default function FigmaAnalyzer() {
  const [url, setUrl] = useState<string>("");
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const modal = useModal();
  const { data: figmaFile, isLoading, error } = useFigmaFile(submittedUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedUrl(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste Figma URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Analyze</Button>
        </form>
        <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
          <h2 className="text-destructive font-semibold">
            Error loading Figma data
          </h2>
          <p className="text-sm text-destructive/80">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste Figma URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Analyze</Button>
      </form>

      {figmaFile && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Figma File Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium">File Name</h3>
                  <p className="text-sm text-muted-foreground">
                    {figmaFile.name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Last Modified</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(figmaFile.lastModified).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Version</h3>
                  <p className="text-sm text-muted-foreground">
                    {figmaFile.version}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Node Statistics</h3>
                  <div className="text-sm text-muted-foreground">
                    {Object.entries(
                      countNodesByType(figmaFile.document.children)
                    ).map(([type, count]) => (
                      <div key={type}>
                        {type}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  <div className="space-y-2">
                    {figmaFile.document.children.map((node) => (
                      <NodeTree
                        key={node.id}
                        node={node}
                        onSelect={setSelectedNode}
                        selectedNodeId={selectedNode?.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Node Details</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={modal.open}
                  disabled={!selectedNode}
                  aria-label="Maximize Node Details"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {selectedNode ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Name</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedNode.name}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Type</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedNode.type}
                        </p>
                      </div>
                      {selectedNode.absoluteBoundingBox && (
                        <div>
                          <h3 className="font-medium">Dimensions</h3>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(selectedNode.absoluteBoundingBox.width)}
                            x
                            {Math.round(
                              selectedNode.absoluteBoundingBox.height
                            )}
                          </p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">Raw Data</h3>
                        <JsonViewer data={selectedNode} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a node to view its details
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Modal for maximized node details */}
      <DetailModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Node Details"
        width="fullscreen"
      >
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Name</h3>
              <p className="text-sm text-muted-foreground">
                {selectedNode.name}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Type</h3>
              <p className="text-sm text-muted-foreground">
                {selectedNode.type}
              </p>
            </div>
            {selectedNode.absoluteBoundingBox && (
              <div>
                <h3 className="font-medium">Dimensions</h3>
                <p className="text-sm text-muted-foreground">
                  {Math.round(selectedNode.absoluteBoundingBox.width)}x
                  {Math.round(selectedNode.absoluteBoundingBox.height)}
                </p>
              </div>
            )}
            <div>
              <h3 className="font-medium">Raw Data</h3>
              <JsonViewer data={selectedNode} maxHeight="60vh" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a node to view its details
          </p>
        )}
      </DetailModal>
    </div>
  );
}
