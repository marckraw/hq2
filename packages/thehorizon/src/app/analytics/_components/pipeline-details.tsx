import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonViewer } from "@/components/ui/json-viewer";
import { CheckCircle, Clock, XCircle, AlertCircle, Play } from "lucide-react";

interface PipelineStep {
  id: string;
  name: string;
  description?: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "failed"
    | "waiting_approval";
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  metadata?: any;
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  source: string;
  type: string;
  status: "active" | "completed" | "failed" | "cancelled";
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  steps?: PipelineStep[];
}

interface PipelineDetailsProps {
  pipeline: Pipeline;
}

export function PipelineDetails({ pipeline }: PipelineDetailsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
      case "active":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "waiting_approval":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      in_progress: "default",
      completed: "default",
      failed: "destructive",
      waiting_approval: "outline",
      active: "default",
      cancelled: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Pipeline Overview */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Pipeline Overview</h3>
          <p className="text-sm text-muted-foreground">
            {pipeline.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Source
            </label>
            <p className="text-sm break-words">{pipeline.source}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Type
            </label>
            <p className="text-sm break-words">{pipeline.type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <div className="mt-1">{getStatusBadge(pipeline.status)}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Created
            </label>
            <p className="text-sm font-mono break-words">
              {new Date(pipeline.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {pipeline.metadata && (
          <div className="w-full">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Metadata
            </label>
            <JsonViewer
              data={pipeline.metadata}
              collapsed={1}
              maxHeight="400px"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Pipeline Steps */}
      <div className="space-y-4 w-full">
        <h3 className="text-lg font-semibold">Pipeline Steps</h3>

        {pipeline.steps && pipeline.steps.length > 0 ? (
          <div className="space-y-3">
            {pipeline.steps.map((step, index) => (
              <Card
                key={step.id}
                className="border-l-4 border-l-muted w-full overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIcon(step.status)}
                      <CardTitle className="text-base break-words">
                        {step.name}
                      </CardTitle>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>
                  {step.description && (
                    <p className="text-sm text-muted-foreground break-words">
                      {step.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Started
                      </label>
                      <p className="font-mono text-xs break-words">
                        {step.startedAt
                          ? new Date(step.startedAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Completed
                      </label>
                      <p className="font-mono text-xs break-words">
                        {step.completedAt
                          ? new Date(step.completedAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Duration
                      </label>
                      <p className="break-words">{step.duration || "—"}</p>
                    </div>
                  </div>

                  {step.metadata && (
                    <div className="mt-3 w-full">
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Step Metadata
                      </label>
                      <JsonViewer
                        data={step.metadata}
                        collapsed={1}
                        maxHeight="250px"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No steps found for this pipeline.
          </p>
        )}
      </div>
    </div>
  );
}
