import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle2, XCircle, Edit3, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RenderMarkdown } from "@/components/RenderMarkdown/RenderMarkdown";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { EnhancedStoryblokDiffViewer } from "./enhanced-storyblok-diff-viewer";

export interface ApprovalItem {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  risk: "low" | "medium" | "high";
  reason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  step?: {
    id: string;
    name?: string;
    description?: string;
    status?: string;
    metadata?: any;
  };
  pipeline?: {
    id: string;
    name?: string;
    description?: string;
    type?: string;
    metadata?: any;
  };
  summary?: string;
}

interface ApprovalItemProps {
  item: ApprovalItem;
  onApprove: (id: string, editedData?: ChangelogEditData) => void;
  onReject: (id: string) => void;
  isExpanded?: boolean;
}

interface ChangelogEditData {
  title?: string;
  summary?: string;
  storyblokContent?: string;
}

export function ApprovalItem({
  item,
  onApprove,
  onReject,
  isExpanded = false,
}: ApprovalItemProps) {
  console.log("[ApprovalItem] item", item);

  // Debug Storyblok editor approvals specifically
  if (item.pipeline?.type === "cms-publication") {
    console.log("[ApprovalItem] CMS Publication approval:", {
      source: item.pipeline?.metadata?.source,
      stepMetadata: item.step?.metadata,
      pipelineMetadata: item.pipeline?.metadata,
      hasDiff: !!item.step?.metadata?.diff,
    });
  }
  const [open, setOpen] = useState(isExpanded);
  const [jsonViewMode, setJsonViewMode] = useState<"viewer" | "raw">("viewer");
  const [isEditing, setIsEditing] = useState(false);
  const [editedStoryblokContent, setEditedStoryblokContent] = useState<string | null>(null);

  // Extract data for changelog editing
  const isChangelogApproval = item.pipeline?.type === "changelog";

  // Detect Storyblok editor approvals
  const isStoryblokEditorApproval =
    item.pipeline?.type === "cms-publication" ||
    item.pipeline?.metadata?.source === "storyblok-editor" ||
    item.step?.metadata?.source === "storyblok-editor";

  // For changelog, we want to edit the AI-generated content, not the original PR
  const aiGeneratedSummary =
    item.step?.metadata?.summary &&
    typeof item.step.metadata.summary === "string"
      ? item.step.metadata.summary.replace(/^"|"$/g, "").replace(/\\n/g, "\n")
      : typeof item.summary === "string"
      ? item.summary.replace(/^"|"$/g, "").replace(/\\n/g, "\n")
      : "";

  // For changelog title, we can derive from PR title or use a default
  const originalPrTitle = item.pipeline?.metadata?.prDetails?.title || "";
  const originalTitle = originalPrTitle
    ? `Release: ${originalPrTitle}`
    : `Release for ${item.pipeline?.metadata?.repoOwner}/${item.pipeline?.metadata?.repoName} PR #${item.pipeline?.metadata?.prNumber}`;

  const originalSummary = aiGeneratedSummary;

  const [editedTitle, setEditedTitle] = useState(originalTitle);
  const [editedSummary, setEditedSummary] = useState(originalSummary);

  const getRiskBadge = (risk: ApprovalItem["risk"]) => {
    const variants = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={cn("ml-2", variants[risk])}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </Badge>
    );
  };

  const getStatusIcon = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // Update the displayed content with edited values
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    setEditedTitle(originalTitle);
    setEditedSummary(originalSummary);
  };

  const handleApprove = () => {
    const hasChangelogEdits = isChangelogApproval && 
      (editedTitle !== originalTitle || editedSummary !== originalSummary);
    const hasStoryblokEdits = isStoryblokEditorApproval && editedStoryblokContent;
    
    if (hasChangelogEdits || hasStoryblokEdits) {
      // Pass edited data to the approval handler
      const editData: ChangelogEditData = {};
      
      if (hasChangelogEdits) {
        editData.title = editedTitle;
        editData.summary = editedSummary;
      }
      
      if (hasStoryblokEdits) {
        editData.storyblokContent = editedStoryblokContent;
      }
      
      onApprove(item.id, editData);
    } else {
      onApprove(item.id);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex flex-wrap items-start sm:items-center">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform",
                      open ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CardTitle className="break-words mr-2">
                {item.pipeline?.name || "Unknown Pipeline"}{" "}
                <span className="text-sm text-muted-foreground font-normal">
                  #{item.id.slice(0, 8)}
                </span>
                {item.pipeline?.type ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    [{item.pipeline.type}]
                  </span>
                ) : null}
              </CardTitle>
              {getRiskBadge(item.risk)}
            </div>
            <div className="flex items-center gap-2">
              {isChangelogApproval && item.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      handleCancelEdit();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  {isEditing ? "Cancel Edit" : "Edit Content"}
                </Button>
              )}
              {getStatusIcon(item.status)}
            </div>
          </div>
          <CardDescription>
            Step: {item.step?.name || "Unknown Step"}
            {item.step?.description ? (
              <span className="ml-2 text-xs text-muted-foreground">
                {item.step.description}
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {/* Changelog Content Section */}
            {isChangelogApproval && (
              <div className="space-y-4 mb-4">
                <div className="font-semibold text-sm mb-2">
                  Changelog Content:
                </div>

                {/* PR Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Changelog Title:
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Enter changelog title..."
                      className="mb-2"
                    />
                  ) : (
                    <div className="bg-muted p-2 rounded text-sm mb-2">
                      {editedTitle || "No title available"}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Changelog Summary:
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      placeholder="Enter changelog summary..."
                      rows={6}
                      className="mb-2"
                    />
                  ) : (
                    <div className="bg-muted p-3 rounded text-sm">
                      {editedSummary ? (
                        <RenderMarkdown>{editedSummary}</RenderMarkdown>
                      ) : (
                        <span className="text-muted-foreground">
                          No summary available
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Repository Info */}
                <div className="text-xs text-muted-foreground">
                  <strong>Repository:</strong>{" "}
                  {item.pipeline?.metadata?.repoOwner}/
                  {item.pipeline?.metadata?.repoName}
                  <br />
                  <strong>PR Number:</strong> #
                  {item.pipeline?.metadata?.prNumber}
                </div>

                {/* Save/Cancel buttons for editing */}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Preview of what will be sent to Slack */}
                {!isEditing && (
                  <div className="border-t pt-4">
                    <div className="font-semibold text-sm mb-2">
                      Slack Notification Preview:
                    </div>
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <div className="font-semibold">
                        🚀 *New Release Changelog*
                      </div>
                      <div className="mt-1">
                        <strong>Repository:</strong>{" "}
                        {item.pipeline?.metadata?.repoOwner}/
                        {item.pipeline?.metadata?.repoName}
                        <br />
                        <strong>PR:</strong> #
                        {item.pipeline?.metadata?.prNumber}
                        <br />
                        <strong>Title:</strong> {editedTitle}
                        <br />
                        <br />
                        <strong>Summary:</strong>
                        <br />
                        {editedSummary}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Storyblok Editor Diff Section */}
            {isStoryblokEditorApproval && item.step?.metadata?.diff && (
              <div className="mb-4">
                <EnhancedStoryblokDiffViewer
                  diff={item.step.metadata.diff}
                  diffSummary={item.step.metadata.diffSummary}
                  defaultExpanded={false}
                  allowEditing={item.status === "pending"}
                  onSaveEdits={(editedJson) => {
                    console.log("User edited content:", editedJson);
                    setEditedStoryblokContent(editedJson);
                    // TODO: Save edited content back to approval metadata
                    // This would require an API call to update the approval
                  }}
                />
              </div>
            )}

            {/* Non-changelog content (original logic) */}
            {!isChangelogApproval && item?.summary && (
              <div className="mb-4">
                <div className="font-semibold text-sm">Summary:</div>
                <div className="bg-muted p-2 rounded text-xs">
                  <RenderMarkdown>
                    {typeof item.summary === "string"
                      ? item.summary.replace(/^"|"$/g, "").replace(/\\n/g, "\n")
                      : JSON.stringify(item.summary)}
                  </RenderMarkdown>
                </div>
              </div>
            )}

            {/* Display Storyblok Story Content for Figma to Storyblok approvals */}
            {(item.step?.metadata?.finalStoryblokStory ||
              item.pipeline?.metadata?.finalStoryblokStory) && (
              <div className="mb-4">
                <div className="font-semibold text-sm mb-2">
                  Storyblok Story{" "}
                  {item.status === "approved" ? "Published" : "to be Published"}
                  :
                </div>
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
                <div className="p-2 bg-muted rounded-md overflow-auto max-h-96">
                  {jsonViewMode === "viewer" ? (
                    <JsonView
                      src={{
                        irfResult: item.pipeline?.metadata?.irfResult,
                        storyblokFinalStory:
                          item.step?.metadata?.finalStoryblokStory ||
                          item.pipeline?.metadata?.finalStoryblokStory,
                      }}
                      collapsed={2}
                      enableClipboard
                    />
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(
                        item.step?.metadata?.finalStoryblokStory ||
                          item.pipeline?.metadata?.finalStoryblokStory,
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Story Name:</strong>{" "}
                  {
                    (
                      item.step?.metadata?.finalStoryblokStory ||
                      item.pipeline?.metadata?.finalStoryblokStory
                    )?.name
                  }
                  <br />
                  <strong>Slug:</strong>{" "}
                  {
                    (
                      item.step?.metadata?.finalStoryblokStory ||
                      item.pipeline?.metadata?.finalStoryblokStory
                    )?.slug
                  }
                  <br />
                  <strong>Full Slug:</strong>{" "}
                  {
                    (
                      item.step?.metadata?.finalStoryblokStory ||
                      item.pipeline?.metadata?.finalStoryblokStory
                    )?.full_slug
                  }
                </div>
              </div>
            )}

            {item.reason && (
              <p className="text-sm text-muted-foreground mb-2">
                Reason: {item.reason}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Created at: {new Date(item.createdAt).toLocaleString()}
            </p>
          </CardContent>
          {item.status === "pending" && (
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onReject(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600"
              >
                Approve
                {((isChangelogApproval &&
                  (editedTitle !== originalTitle ||
                    editedSummary !== originalSummary)) ||
                  (isStoryblokEditorApproval && editedStoryblokContent)) &&
                  " with Changes"}
              </Button>
            </CardFooter>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
