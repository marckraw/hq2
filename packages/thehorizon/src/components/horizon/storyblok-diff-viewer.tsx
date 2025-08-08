import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Info,
  FileText,
  Code,
} from "lucide-react";
import JsonView from "react18-json-view";

// Types based on our DiffService
interface StoryblokDiffSummary {
  componentsAdded: number;
  componentsRemoved: number;
  componentsModified: number;
  propertiesChanged: number;
  totalChanges: number;
}

interface PropertyChange {
  property: string;
  path: string;
  oldValue: any;
  newValue: any;
  changeType: "added" | "removed" | "modified";
}

interface ComponentChange {
  type: "added" | "removed" | "modified";
  path: string;
  componentType: string;
  componentId?: string;
  componentName?: string;
  oldComponent?: any;
  newComponent?: any;
  propertyChanges?: PropertyChange[];
}

interface StoryblokDiff {
  summary: StoryblokDiffSummary;
  changes: ComponentChange[];
  visualDiff?: string;
  markdownDiff?: string;
  generatedAt: string;
}

interface StoryblokDiffViewerProps {
  diff: StoryblokDiff;
  diffSummary?: string;
  className?: string;
  defaultExpanded?: boolean;
}

const getChangeColor = (changeType: string) => {
  switch (changeType) {
    case "added":
      return "bg-green-50 border-green-200 text-green-800";
    case "removed":
      return "bg-red-50 border-red-200 text-red-800";
    case "modified":
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
};

const getChangeIcon = (changeType: string) => {
  switch (changeType) {
    case "added":
      return <Plus className="h-4 w-4" />;
    case "removed":
      return <Minus className="h-4 w-4" />;
    case "modified":
      return <Edit className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const ComponentChangeItem: React.FC<{ change: ComponentChange }> = ({
  change,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasPropertyChanges = change.propertyChanges && change.propertyChanges.length > 0;

  return (
    <Card className={`${getChangeColor(change.type)} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChangeIcon(change.type)}
            <div>
              <CardTitle className="text-sm font-medium">
                {change.type.toUpperCase()}: {change.path}
              </CardTitle>
              <CardDescription className="text-xs">
                Component: {change.componentType}
                {change.componentName && ` • Name: ${change.componentName}`}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {change.type}
          </Badge>
        </div>
      </CardHeader>

      {hasPropertyChanges && (
        <CardContent className="pt-0">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between p-2">
                <span className="text-xs">
                  {change.propertyChanges!.length} property change(s)
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {change.propertyChanges!.map((prop, idx) => (
                <div
                  key={idx}
                  className={`rounded-md p-2 text-xs ${getChangeColor(prop.changeType)}`}
                >
                  <div className="font-medium mb-1">{prop.property}</div>
                  <div className="space-y-1">
                    {prop.changeType === "removed" && (
                      <div className="text-red-600">
                        <span className="font-medium">Removed:</span>{" "}
                        <code className="bg-red-100 px-1 rounded">
                          {JSON.stringify(prop.oldValue)}
                        </code>
                      </div>
                    )}
                    {prop.changeType === "added" && (
                      <div className="text-green-600">
                        <span className="font-medium">Added:</span>{" "}
                        <code className="bg-green-100 px-1 rounded">
                          {JSON.stringify(prop.newValue)}
                        </code>
                      </div>
                    )}
                    {prop.changeType === "modified" && (
                      <div className="space-y-1">
                        <div className="text-red-600">
                          <span className="font-medium">From:</span>{" "}
                          <code className="bg-red-100 px-1 rounded">
                            {JSON.stringify(prop.oldValue)}
                          </code>
                        </div>
                        <div className="text-green-600">
                          <span className="font-medium">To:</span>{" "}
                          <code className="bg-green-100 px-1 rounded">
                            {JSON.stringify(prop.newValue)}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
};

export const StoryblokDiffViewer: React.FC<StoryblokDiffViewerProps> = ({
  diff,
  diffSummary,
  className = "",
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { summary, changes } = diff;

  // Group changes by type
  const addedChanges = changes.filter(c => c.type === "added");
  const removedChanges = changes.filter(c => c.type === "removed");
  const modifiedChanges = changes.filter(c => c.type === "modified");

  if (summary.totalChanges === 0) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Info className="h-4 w-4" />
            <span className="text-sm">No changes detected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="text-left">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content Changes
                </CardTitle>
                <CardDescription className="text-xs">
                  {diffSummary || `${summary.totalChanges} total changes`}
                </CardDescription>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.componentsAdded > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-300">
                  <Plus className="h-3 w-3 mr-1" />
                  {summary.componentsAdded} added
                </Badge>
              )}
              {summary.componentsRemoved > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-300">
                  <Minus className="h-3 w-3 mr-1" />
                  {summary.componentsRemoved} removed
                </Badge>
              )}
              {summary.componentsModified > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  <Edit className="h-3 w-3 mr-1" />
                  {summary.componentsModified} modified
                </Badge>
              )}
              {summary.propertiesChanged > 0 && (
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {summary.propertiesChanged} properties changed
                </Badge>
              )}
            </div>

            <Tabs defaultValue="changes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="changes" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Changes
                </TabsTrigger>
                <TabsTrigger value="visual" className="text-xs">
                  <Code className="h-3 w-3 mr-1" />
                  Visual Diff
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  Raw Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="changes" className="space-y-3 mt-4">
                {addedChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2">
                      Added Components ({addedChanges.length})
                    </h4>
                    <div className="space-y-2">
                      {addedChanges.map((change, idx) => (
                        <ComponentChangeItem key={idx} change={change} />
                      ))}
                    </div>
                  </div>
                )}

                {removedChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2">
                      Removed Components ({removedChanges.length})
                    </h4>
                    <div className="space-y-2">
                      {removedChanges.map((change, idx) => (
                        <ComponentChangeItem key={idx} change={change} />
                      ))}
                    </div>
                  </div>
                )}

                {modifiedChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-600 mb-2">
                      Modified Components ({modifiedChanges.length})
                    </h4>
                    <div className="space-y-2">
                      {modifiedChanges.map((change, idx) => (
                        <ComponentChangeItem key={idx} change={change} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="visual" className="mt-4">
                {diff.visualDiff ? (
                  <div 
                    className="border rounded-md p-4 bg-gray-50 text-xs overflow-auto max-h-96"
                    dangerouslySetInnerHTML={{ __html: diff.visualDiff }}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Visual diff not available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <div className="border rounded-md bg-gray-50 max-h-96 overflow-auto">
                  <JsonView 
                    src={diff} 
                    theme="default"
                    collapsed={1}
                    enableClipboard={false}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};