import { useState } from "react";
import { Button } from "./button";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

interface JsonViewerProps {
  data: any;
  collapsed?: number;
  maxHeight?: string;
}

export function JsonViewer({
  data,
  collapsed = 2,
  maxHeight = "300px",
}: JsonViewerProps) {
  const [jsonViewMode, setJsonViewMode] = useState<"viewer" | "raw">("viewer");

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          variant={jsonViewMode === "viewer" ? "default" : "outline"}
          onClick={() => setJsonViewMode("viewer")}
        >
          JSON Viewer
        </Button>
        <Button
          size="sm"
          variant={jsonViewMode === "raw" ? "default" : "outline"}
          onClick={() => setJsonViewMode("raw")}
        >
          Raw JSON
        </Button>
      </div>
      <div className="w-full max-w-full">
        <div
          className="json-view-container p-3 bg-muted rounded-md overflow-x-auto overflow-y-auto w-full"
          style={{ maxHeight }}
        >
          {jsonViewMode === "viewer" ? (
            <JsonView src={data} collapsed={collapsed} enableClipboard />
          ) : (
            <pre className="text-xs whitespace-pre-wrap break-words w-full">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
