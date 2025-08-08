import React, { useState, useMemo, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailModal } from "@/components/ui/detail-modal";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Info,
  FileText,
  Code,
  Save,
  X,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import JsonView from "react18-json-view";

// Side-by-side diff viewer component
interface SideBySideDiffViewerProps {
  originalContent: string;
  editedContent: string;
  jsonDiff: any;
  isModal?: boolean;
}

const SideBySideDiffViewer: React.FC<SideBySideDiffViewerProps> = ({
  originalContent,
  editedContent,
  jsonDiff,
  isModal = false,
}) => {
  // Create aligned diff by analyzing property-level changes
  const createAlignedDiff = () => {
    try {
      const originalObj = JSON.parse(originalContent);
      const editedObj = JSON.parse(editedContent);

      // Create a smart comparison that aligns similar content
      const alignedLines: Array<{
        originalLine: string;
        editedLine: string;
        isChanged: boolean;
      }> = [];

      // Function to generate lines for an object with property alignment
      const generateAlignedObjectLines = (
        origObj: any,
        editObj: any,
        indent: string = ""
      ) => {
        const allKeys = new Set([
          ...Object.keys(origObj || {}),
          ...Object.keys(editObj || {}),
        ]);

        for (const key of Array.from(allKeys).sort()) {
          const origValue = origObj?.[key];
          const editValue = editObj?.[key];
          const hasOriginal = origObj && key in origObj;
          const hasEdited = editObj && key in editObj;

          if (hasOriginal && hasEdited) {
            // Property exists in both - compare values
            const origStr = JSON.stringify(origValue);
            const editStr = JSON.stringify(editValue);
            const isChanged = origStr !== editStr;

            if (
              typeof origValue === "object" &&
              typeof editValue === "object" &&
              !Array.isArray(origValue) &&
              !Array.isArray(editValue) &&
              origValue !== null &&
              editValue !== null
            ) {
              // Both are objects - show opening brace
              alignedLines.push({
                originalLine: `${indent}"${key}": {`,
                editedLine: `${indent}"${key}": {`,
                isChanged: false,
              });

              // Recurse into object
              generateAlignedObjectLines(origValue, editValue, indent + "  ");

              // Closing brace
              alignedLines.push({
                originalLine: `${indent}},`,
                editedLine: `${indent}},`,
                isChanged: false,
              });
            } else if (Array.isArray(origValue) && Array.isArray(editValue)) {
              // Both are arrays - show opening bracket and recurse
              alignedLines.push({
                originalLine: `${indent}"${key}": [`,
                editedLine: `${indent}"${key}": [`,
                isChanged: false,
              });

              // Compare array elements
              const maxLength = Math.max(origValue.length, editValue.length);
              for (let i = 0; i < maxLength; i++) {
                const origItem = origValue[i];
                const editItem = editValue[i];
                const hasOrigItem = i < origValue.length;
                const hasEditItem = i < editValue.length;

                if (hasOrigItem && hasEditItem) {
                  if (
                    typeof origItem === "object" &&
                    typeof editItem === "object" &&
                    origItem !== null &&
                    editItem !== null
                  ) {
                    // Both are objects - show opening brace and recurse
                    const itemChanged =
                      JSON.stringify(origItem) !== JSON.stringify(editItem);
                    alignedLines.push({
                      originalLine: `${indent}  {`,
                      editedLine: `${indent}  {`,
                      isChanged: false,
                    });

                    generateAlignedObjectLines(
                      origItem,
                      editItem,
                      indent + "    "
                    );

                    alignedLines.push({
                      originalLine: `${indent}  },`,
                      editedLine: `${indent}  },`,
                      isChanged: false,
                    });
                  } else {
                    // Simple array items
                    const origItemStr = JSON.stringify(origItem);
                    const editItemStr = JSON.stringify(editItem);
                    const itemChanged = origItemStr !== editItemStr;

                    alignedLines.push({
                      originalLine: `${indent}  ${origItemStr},`,
                      editedLine: `${indent}  ${editItemStr},`,
                      isChanged: itemChanged,
                    });
                  }
                } else if (hasOrigItem && !hasEditItem) {
                  // Item removed from array
                  if (typeof origItem === "object" && origItem !== null) {
                    // Object removed - show full expansion
                    alignedLines.push({
                      originalLine: `${indent}  {`,
                      editedLine: `${indent}  // Item removed`,
                      isChanged: true,
                    });

                    generateAlignedObjectLines(origItem, {}, indent + "    ");

                    alignedLines.push({
                      originalLine: `${indent}  },`,
                      editedLine: `${indent}  // (continued)`,
                      isChanged: true,
                    });
                  } else {
                    // Simple value removed
                    const origItemStr = JSON.stringify(origItem);
                    alignedLines.push({
                      originalLine: `${indent}  ${origItemStr},`,
                      editedLine: `${indent}  // Item removed`,
                      isChanged: true,
                    });
                  }
                } else if (!hasOrigItem && hasEditItem) {
                  // Item added to array
                  if (typeof editItem === "object" && editItem !== null) {
                    // Object added - show full expansion
                    alignedLines.push({
                      originalLine: `${indent}  // Item added`,
                      editedLine: `${indent}  {`,
                      isChanged: true,
                    });

                    generateAlignedObjectLines({}, editItem, indent + "    ");

                    alignedLines.push({
                      originalLine: `${indent}  // (continued)`,
                      editedLine: `${indent}  },`,
                      isChanged: true,
                    });
                  } else {
                    // Simple value added
                    const editItemStr = JSON.stringify(editItem);
                    alignedLines.push({
                      originalLine: `${indent}  // Item added`,
                      editedLine: `${indent}  ${editItemStr},`,
                      isChanged: true,
                    });
                  }
                }
              }

              // Closing bracket
              alignedLines.push({
                originalLine: `${indent}],`,
                editedLine: `${indent}],`,
                isChanged: false,
              });
            } else {
              // Simple value comparison or type mismatch
              const origLine = `${indent}"${key}": ${origStr},`;
              const editLine = `${indent}"${key}": ${editStr},`;

              alignedLines.push({
                originalLine: origLine,
                editedLine: editLine,
                isChanged,
              });
            }
          } else if (hasOriginal && !hasEdited) {
            // Property removed
            if (typeof origValue === "object" && origValue !== null) {
              if (Array.isArray(origValue)) {
                alignedLines.push({
                  originalLine: `${indent}"${key}": [ ... ],`,
                  editedLine: `${indent}// Property removed`,
                  isChanged: true,
                });
              } else {
                alignedLines.push({
                  originalLine: `${indent}"${key}": { ... },`,
                  editedLine: `${indent}// Property removed`,
                  isChanged: true,
                });
              }
            } else {
              const origStr = JSON.stringify(origValue);
              const origLine = `${indent}"${key}": ${origStr},`;

              alignedLines.push({
                originalLine: origLine,
                editedLine: `${indent}// Property removed`,
                isChanged: true,
              });
            }
          } else if (!hasOriginal && hasEdited) {
            // Property added - show full expansion
            if (typeof editValue === "object" && editValue !== null) {
              if (Array.isArray(editValue)) {
                // Array added
                alignedLines.push({
                  originalLine: `${indent}// Property added`,
                  editedLine: `${indent}"${key}": [`,
                  isChanged: true,
                });

                // Show array contents
                editValue.forEach((item, i) => {
                  if (typeof item === "object" && item !== null) {
                    alignedLines.push({
                      originalLine: `${indent}  // (array item)`,
                      editedLine: `${indent}  {`,
                      isChanged: true,
                    });

                    generateAlignedObjectLines({}, item, indent + "    ");

                    alignedLines.push({
                      originalLine: `${indent}  // (continued)`,
                      editedLine: `${indent}  },`,
                      isChanged: true,
                    });
                  } else {
                    alignedLines.push({
                      originalLine: `${indent}  // (array item)`,
                      editedLine: `${indent}  ${JSON.stringify(item)},`,
                      isChanged: true,
                    });
                  }
                });

                alignedLines.push({
                  originalLine: `${indent}// (continued)`,
                  editedLine: `${indent}],`,
                  isChanged: true,
                });
              } else {
                // Object added
                alignedLines.push({
                  originalLine: `${indent}// Property added`,
                  editedLine: `${indent}"${key}": {`,
                  isChanged: true,
                });

                generateAlignedObjectLines({}, editValue, indent + "  ");

                alignedLines.push({
                  originalLine: `${indent}// (continued)`,
                  editedLine: `${indent}},`,
                  isChanged: true,
                });
              }
            } else {
              const editStr = JSON.stringify(editValue);
              const editLine = `${indent}"${key}": ${editStr},`;

              alignedLines.push({
                originalLine: `${indent}// Property added`,
                editedLine: editLine,
                isChanged: true,
              });
            }
          }
        }
      };

      // Start with opening brace
      alignedLines.push({
        originalLine: "{",
        editedLine: "{",
        isChanged: false,
      });

      // Generate aligned content
      generateAlignedObjectLines(originalObj, editedObj, "  ");

      // End with closing brace
      alignedLines.push({
        originalLine: "}",
        editedLine: "}",
        isChanged: false,
      });

      return alignedLines;
    } catch (error) {
      // Fallback to simple line-by-line comparison
      const originalLines = originalContent.split("\n");
      const editedLines = editedContent.split("\n");
      const maxLines = Math.max(originalLines.length, editedLines.length);

      const fallbackLines = [];
      for (let i = 0; i < maxLines; i++) {
        fallbackLines.push({
          originalLine: originalLines[i] || "",
          editedLine: editedLines[i] || "",
          isChanged: (originalLines[i] || "") !== (editedLines[i] || ""),
        });
      }

      return fallbackLines;
    }
  };

  const alignedLines = createAlignedDiff();

  const getLineStyle = (
    isChanged: boolean,
    side: "left" | "right",
    isComment: boolean = false
  ) => {
    const baseStyle = "px-3 py-1 font-mono text-xs leading-relaxed border-r";

    if (isComment) {
      return `${baseStyle} bg-gray-100 text-gray-500 border-gray-200 italic`;
    }

    if (isChanged) {
      return side === "left"
        ? `${baseStyle} bg-red-50 text-red-900 border-red-200`
        : `${baseStyle} bg-green-50 text-green-900 border-green-200`;
    }

    return `${baseStyle} bg-white text-gray-700 border-gray-200`;
  };

  const getLineNumberStyle = (
    isChanged: boolean,
    side: "left" | "right",
    isComment: boolean = false
  ) => {
    const baseStyle =
      "px-2 py-1 text-xs text-center border-r min-w-[3rem] select-none";

    if (isComment) {
      return `${baseStyle} bg-gray-100 text-gray-400 border-gray-200`;
    }

    if (isChanged) {
      return side === "left"
        ? `${baseStyle} bg-red-100 text-red-700 border-red-200`
        : `${baseStyle} bg-green-100 text-green-700 border-green-200`;
    }

    return `${baseStyle} bg-gray-50 text-gray-500 border-gray-200`;
  };

  return (
    <div
      className={`border rounded-md overflow-hidden bg-white ${
        isModal ? "flex flex-col h-full" : ""
      }`}
    >
      {/* Header */}
      <div
        className={`grid grid-cols-2 bg-gray-100 border-b ${
          isModal ? "shrink-0" : ""
        }`}
      >
        <div className="px-3 py-2 text-sm font-medium text-gray-700 border-r">
          Original
        </div>
        <div className="px-3 py-2 text-sm font-medium text-gray-700">
          Modified
        </div>
      </div>

      {/* Diff content */}
      <div
        className={`overflow-auto ${isModal ? "flex-1" : ""}`}
        style={isModal ? {} : { maxHeight: "calc(100vh - 200px)" }}
      >
        {alignedLines.map((line, index) => {
          const isOriginalComment = line.originalLine.includes("// Property");
          const isEditedComment = line.editedLine.includes("// Property");

          return (
            <div
              key={index}
              className="grid grid-cols-2 border-b border-gray-100 last:border-b-0"
            >
              {/* Left side (original) */}
              <div className="flex border-r">
                <div
                  className={getLineNumberStyle(
                    line.isChanged,
                    "left",
                    isOriginalComment
                  )}
                >
                  {index + 1}
                </div>
                <div
                  className={getLineStyle(
                    line.isChanged,
                    "left",
                    isOriginalComment
                  )}
                >
                  <pre className="whitespace-pre-wrap break-all">
                    {line.originalLine}
                  </pre>
                </div>
              </div>

              {/* Right side (edited) */}
              <div className="flex">
                <div
                  className={getLineNumberStyle(
                    line.isChanged,
                    "right",
                    isEditedComment
                  )}
                >
                  {index + 1}
                </div>
                <div
                  className={getLineStyle(
                    line.isChanged,
                    "right",
                    isEditedComment
                  )}
                >
                  <pre className="whitespace-pre-wrap break-all">
                    {line.editedLine}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Types based on our enhanced DiffService
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
  enhancedDiff?: {
    originalJson: string;
    editedJson: string;
    jsonDiff: any;
  };
}

interface EnhancedStoryblokDiffViewerProps {
  diff: StoryblokDiff;
  diffSummary?: string;
  className?: string;
  defaultExpanded?: boolean;
  onSaveEdits?: (editedJson: string) => void;
  allowEditing?: boolean;
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
  const hasPropertyChanges =
    change.propertyChanges && change.propertyChanges.length > 0;

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
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-2"
              >
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
                  className={`rounded-md p-2 text-xs ${getChangeColor(
                    prop.changeType
                  )}`}
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

export const EnhancedStoryblokDiffViewer: React.FC<
  EnhancedStoryblokDiffViewerProps
> = ({
  diff,
  diffSummary,
  className = "",
  defaultExpanded = false,
  onSaveEdits,
  allowEditing = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const [savedJson, setSavedJson] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("changes");
  const [diffKey, setDiffKey] = useState(0); // Force re-render of diff components
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentJsonRef = useRef<string>("");

  const { summary, changes, enhancedDiff } = diff;

  // Initialize edited JSON when entering edit mode
  const handleEditMode = (enable: boolean) => {
    if (enable && enhancedDiff) {
      // Use saved version if available, otherwise use original
      const initialJson = savedJson || enhancedDiff.editedJson;
      setEditedJson(initialJson);
      currentJsonRef.current = initialJson;
      setJsonError(null);
      // Switch to side-by-side tab when entering edit mode
      setActiveTab("side-by-side");
    }
    setIsEditing(enable);
  };

  // Handle JSON change without state updates (just update the ref)
  const handleJsonChange = useCallback(
    (value: string) => {
      // Only update the ref, don't trigger re-renders
      currentJsonRef.current = value;
      // Clear any existing errors since we're editing
      if (jsonError) {
        setJsonError(null);
      }
    },
    [jsonError]
  );

  // Save edited content with validation
  const handleSaveEdits = () => {
    // Validate JSON before saving using the ref value
    const currentJson = currentJsonRef.current;
    try {
      JSON.parse(currentJson);
      setJsonError(null);

      // Update the enhancedDiff object so Visual Diff tab shows changes
      if (enhancedDiff) {
        enhancedDiff.editedJson = currentJson;
      }
      setSavedJson(currentJson); // Save the edited version
      setEditedJson(currentJson); // Update state with final value
      setDiffKey((prev) => prev + 1); // Force re-render of diff components
      setIsEditing(false);

      // Call the callback with the final edited content
      if (onSaveEdits) {
        onSaveEdits(currentJson);
      }
    } catch (error) {
      setJsonError((error as Error).message);
    }
  };

  // Group changes by type
  const addedChanges = changes.filter((c) => c.type === "added");
  const removedChanges = changes.filter((c) => c.type === "removed");
  const modifiedChanges = changes.filter((c) => c.type === "modified");

  // Create a reusable content component - memoized to prevent re-renders
  const DiffContent = useMemo(() => {
    const Component = ({ isModal = false }: { isModal?: boolean }) => (
      <div className={`${isModal ? "flex flex-col h-full min-h-0" : ""}`}>
        {/* Summary badges */}
        <div
          className={`flex flex-wrap gap-2 ${
            isModal ? "mb-2 shrink-0" : "mb-4"
          }`}
        >
          {summary.componentsAdded > 0 && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-300"
            >
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
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-300"
            >
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

        {/* Edit controls */}
        {allowEditing && !isEditing && (
          <div className={`${isModal ? "mb-2 shrink-0" : "mb-4"}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditMode(true)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit Result
            </Button>
          </div>
        )}

        {isEditing && (
          <div className={`space-y-2 ${isModal ? "mb-2 shrink-0" : "mb-4"}`}>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdits}
                disabled={!!jsonError}
              >
                <Save className="h-3 w-3 mr-1" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditMode(false)}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
            {jsonError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                JSON Error: {jsonError}
              </div>
            )}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className={`w-full ${isModal ? "flex flex-col flex-1 min-h-0" : ""}`}
        >
          <TabsList
            className={`grid w-full grid-cols-4 ${isModal ? "shrink-0" : ""}`}
          >
            <TabsTrigger value="changes" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Changes
            </TabsTrigger>
            <TabsTrigger value="side-by-side" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Side-by-Side
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Visual Diff
            </TabsTrigger>
            <TabsTrigger value="raw" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="changes"
            className={`space-y-3 mt-4 ${
              isModal ? "flex-1 overflow-auto min-h-0" : ""
            }`}
          >
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

          <TabsContent
            value="side-by-side"
            className={`mt-4 ${isModal ? "flex-1 min-h-0" : ""}`}
          >
            {enhancedDiff ? (
              <div
                className={`border rounded-md overflow-hidden ${
                  isModal ? "h-full flex flex-col" : "h-96"
                }`}
              >
                {/* Headers */}
                <div className="grid grid-cols-2 bg-gray-100 border-b shrink-0">
                  <div className="px-3 py-2 text-sm font-medium border-r">
                    Original
                  </div>
                  <div className="px-3 py-2 text-sm font-medium">
                    {isEditing ? "Edited (Live)" : "Edited"}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`grid grid-cols-2 ${
                    isModal ? "flex-1 min-h-0" : "flex-1"
                  }`}
                >
                  {/* Original */}
                  <div className="border-r overflow-auto bg-gray-50">
                    <div className="p-3">
                      <pre className="text-xs whitespace-pre-wrap">
                        {enhancedDiff.originalJson}
                      </pre>
                    </div>
                  </div>
                  {/* Edited */}
                  <div
                    className={`${
                      isEditing ? "flex flex-col" : "overflow-auto"
                    }`}
                  >
                    {isEditing ? (
                      <div className="p-3 flex-1 flex flex-col">
                        <textarea
                          ref={textareaRef}
                          defaultValue={editedJson}
                          onChange={(e) => handleJsonChange(e.target.value)}
                          className="w-full flex-1 font-mono text-xs resize-none border-0 p-0 min-h-0 bg-transparent outline-none"
                          placeholder="Edit JSON here..."
                        />
                      </div>
                    ) : (
                      <div className="p-3">
                        <pre className="text-xs whitespace-pre-wrap">
                          {savedJson || enhancedDiff.editedJson}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Enhanced diff data not available
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="visual"
            className={`mt-4 ${isModal ? "flex-1 min-h-0" : ""}`}
          >
            {enhancedDiff ? (
              <div className={isModal ? "h-full" : ""}>
                <SideBySideDiffViewer
                  key={diffKey}
                  originalContent={enhancedDiff.originalJson}
                  editedContent={savedJson || enhancedDiff.editedJson}
                  jsonDiff={enhancedDiff.jsonDiff}
                  isModal={isModal}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Visual diff not available
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="raw"
            className={`mt-4 ${isModal ? "flex-1 min-h-0" : ""}`}
          >
            <div
              className={`border rounded-md bg-gray-50 overflow-auto ${
                isModal ? "h-full" : "max-h-96"
              }`}
            >
              <JsonView
                src={diff}
                theme="default"
                collapsed={1}
                enableClipboard={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );

    Component.displayName = "DiffContent";
    return Component;
  }, [
    summary,
    allowEditing,
    isEditing,
    editedJson,
    jsonError,
    enhancedDiff,
    activeTab,
    handleEditMode,
    handleJsonChange,
    handleSaveEdits,
    addedChanges,
    removedChanges,
    modifiedChanges,
  ]);

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
    <>
      <Card className={`border-blue-200 ${className}`}>
        <CardHeader className="pb-3">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="text-left">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content Changes
                    {isEditing && (
                      <Badge variant="outline" className="ml-2">
                        Editing
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {diffSummary || `${summary.totalChanges} total changes`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreen(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </CardHeader>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0 px-6 pb-4">
              <DiffContent />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Fullscreen Modal */}
      <DetailModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={`Content Changes - Full View ${isEditing ? "(Editing)" : ""}`}
        width="fullscreen"
      >
        <div className="text-xs text-muted-foreground mb-4">
          {diffSummary || `${summary.totalChanges} total changes`}
        </div>
        <DiffContent isModal={true} />
      </DetailModal>
    </>
  );
};
