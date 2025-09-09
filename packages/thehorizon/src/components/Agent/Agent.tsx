"use client";
import { Button } from "@/components/ui/button";
import { useFileHandler, type FileAttachment } from "@/hooks/useFileHandler";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Info, Paperclip, PlayCircle, Upload } from "lucide-react";
import type { KeyboardEventHandler } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { z } from "zod";
import { FluidLoader } from "../horizon/fluid-loader";
import { RenderMarkdown } from "../RenderMarkdown/RenderMarkdown";
import { AttachmentPreview } from "../ui/attachment-preview";
import { Card } from "../ui/card";
import { MessageInputToolbar, ToolbarDivider, ToolbarSection } from "../ui/message-input-toolbar";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ContextSelectorPopover, type ContextData } from "./ContextSelectorPopover";

// Zod schema for ProgressMessage
export const ProgressMessageSchema = z.object({
  type: z.string(),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Inferred TypeScript type from Zod schema
export type ProgressMessage = z.infer<typeof ProgressMessageSchema>;

// Validation helper
export const validateProgressMessage = (
  data: unknown
): { success: true; data: ProgressMessage } | { success: false; error: string } => {
  const result = ProgressMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
};

import { AgentSelectorPopover, type AgentOption } from "./AgentSelectorPopover";

export interface AgentProps {
  content: string;
  onClick?: () => void;
}

interface FormInputs {
  message: string;
  agentType:
    | "general"
    | "test-openrouter"
    | "rephraser"
    | "figma-analyzer"
    | "figma-to-storyblok"
    | "storyblok-editor"
    | "site-builder"
    | "orchestrator"
    | "irf-architect";
  attachments: FileAttachment[];
}

const getMessageColor = (type: ProgressMessage["type"]) => {
  switch (type) {
    case "unknown":
      return "bg-primary/10 dark:bg-primary/5";
    case "user_message":
      return "bg-primary/10 dark:bg-primary/5";
    case "thinking":
      return "bg-muted/50 dark:bg-muted/30";
    case "llm_response":
      return "bg-accent/10 dark:bg-accent/5";
    case "tool_execution":
      return "bg-primary/5 dark:bg-primary/10";
    case "tool_response":
      return "bg-accent/5 dark:bg-accent/10";
    case "finished":
      return "bg-muted dark:bg-muted/50";
    case "uploaded_attachments":
      return "bg-primary/10 dark:bg-primary/5";
    case "agent_thought":
      return "bg-primary/10 dark:bg-primary/5";
    default:
      return "bg-background dark:bg-background";
  }
};

const MetadataDisplay = ({ metadata }: { metadata?: Record<string, any> }) => {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  const parseValue = (value: any): any => {
    if (typeof value === "string") {
      try {
        // Attempt to parse if it's a JSON string
        return JSON.parse(value);
      } catch {
        // If it's not valid JSON, return the original string
        return value;
      }
    }
    return value;
  };

  const renderValue = (value: any) => {
    if (typeof value === "object" && value !== null) {
      // Use JsonView for objects/arrays
      return (
        <div className="bg-muted/30 dark:bg-muted/10 p-1 rounded">
          <JsonView src={value} collapsed={1} enableClipboard />
        </div>
      );
    }
    return (
      <pre className="text-foreground/90 whitespace-pre-wrap font-mono bg-muted/30 dark:bg-muted/10 p-1 rounded">
        {String(value)}
      </pre>
    );
  };

  return (
    <div className="grid gap-2">
      {Object.entries(metadata).map(([key, rawValue]) => {
        const parsedValue = parseValue(rawValue);
        return (
          <div key={key} className="grid grid-cols-[120px,1fr] text-xs">
            <span className="text-muted-foreground font-medium">{key}:</span>
            {renderValue(parsedValue)}
          </div>
        );
      })}
    </div>
  );
};

// Component to render content with JSON detection and JsonView
const JsonContentRenderer = ({ content }: { content: string }) => {
  const [jsonViewMode, setJsonViewMode] = useState<"viewer" | "raw">("viewer");

  // Try to detect if the content is JSON
  const trimmedContent = content.trim();

  // Check if it looks like JSON (starts with { or [ and ends with } or ])
  const isFullJson =
    (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) ||
    (trimmedContent.startsWith("[") && trimmedContent.endsWith("]"));

  if (isFullJson) {
    try {
      const parsed = JSON.parse(trimmedContent);
      return (
        <div className="space-y-2">
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
          <div className="p-2 bg-muted rounded-md overflow-auto">
            {jsonViewMode === "viewer" ? (
              <JsonView src={parsed} collapsed={2} enableClipboard />
            ) : (
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>
            )}
          </div>
        </div>
      );
    } catch (error) {
      // If parsing fails, fall through to regular content rendering
    }
  }

  // Check if content contains JSON-like patterns and render them with JsonView
  const jsonPattern = /(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\])/g;
  const parts: Array<{ type: "text" | "json"; content: string; parsed?: any }> = [];
  let lastIndex = 0;
  let match;

  while ((match = jsonPattern.exec(content)) !== null) {
    // Add text before the JSON
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Try to parse the JSON
    try {
      const parsed = JSON.parse(match[0]);
      parts.push({
        type: "json",
        content: match[0],
        parsed,
      });
    } catch (error) {
      // If parsing fails, treat as text
      parts.push({
        type: "text",
        content: match[0],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  // If we found JSON parts, render them specially
  if (parts.some((part) => part.type === "json")) {
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.type === "json" && part.parsed) {
            return (
              <div key={index} className="space-y-2">
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
                <div className="p-2 bg-muted rounded-md overflow-auto">
                  {jsonViewMode === "viewer" ? (
                    <JsonView src={part.parsed} collapsed={2} enableClipboard />
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(part.parsed, null, 2)}</pre>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div key={index}>
                <RenderMarkdown>{part.content}</RenderMarkdown>
              </div>
            );
          }
        })}
      </div>
    );
  }

  // No JSON found, render as regular markdown
  return <RenderMarkdown>{content}</RenderMarkdown>;
};

const MessageCard = ({ message, isWorking }: { message: ProgressMessage; isWorking: boolean }) => {
  const [isMetadataVisible, setIsMetadataVisible] = useState(false);
  const hasMetadata = message.metadata && Object.keys(message.metadata).length > 0;

  return (
    <Card className={cn("p-4 md:p-5 text-sm border-border/50", getMessageColor(message.type))}>
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 px-2 py-1 bg-background/50 dark:bg-background/20 rounded-md">
            <span className="text-xs text-muted-foreground">{message.type}</span>
            {(message.type === "tool_execution" || message.type === "thinking") && isWorking && (
              <FluidLoader size="xs" className="translate-y-[1px]" />
            )}
          </div>
          {hasMetadata && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsMetadataVisible(!isMetadataVisible)}
            >
              <Info
                className={`h-4 w-4 transition-colors ${
                  isMetadataVisible ? "text-primary" : "text-muted-foreground/60"
                }`}
              />
            </Button>
          )}
        </div>
        <div className="mt-3 prose prose-sm max-w-none dark:prose-invert">
          <JsonContentRenderer content={message.content} />
        </div>
        {isMetadataVisible && (
          <div className="mt-3 p-3 bg-background/50 dark:bg-background/20 rounded-md border border-border/50">
            <div className="text-xs text-muted-foreground mb-2">Metadata</div>
            <MetadataDisplay metadata={message.metadata} />
          </div>
        )}
      </div>
    </Card>
  );
};

export const Agent = () => {
  const [messages, setMessages] = useState<ProgressMessage[]>([]);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(true);
  const [stateCurrentConversationId, setStateCurrentConversationId] = useState<number | null>(null);
  const [availableAgents, setAvailableAgents] = useState<AgentOption[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);
  const [contextData, setContextData] = useState<ContextData>({
    contextType: "",
  });

  // Memoize the context data change handler to prevent infinite loops
  const handleContextDataChange = useCallback((newData: ContextData) => {
    setContextData(newData);
  }, []);

  const { register, handleSubmit, setValue, getValues, watch, control } = useForm<FormInputs>({
    defaultValues: {
      attachments: [],
      agentType: "general",
    },
  });

  // Use the shared file handler hook
  const {
    attachments,
    handleFileSelect: fileHandlerSelect,
    handleFileDrop: fileHandlerDrop,
    removeAttachment: fileHandlerRemove,
    prepareFiles,
    clearAttachments,
  } = useFileHandler({
    onError: (error) => {
      console.error("File handling error:", error);
      // You could add a toast notification here
    },
  });

  // Sync attachments with form state
  useEffect(() => {
    console.log("📎 Attachments updated:", attachments.length, attachments);
    setValue("attachments", attachments);
  }, [attachments, setValue]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamTokenRef = useRef<string | null>(null);

  // Fetch available agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/available-agents`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAvailableAgents(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        // Fallback to default agents if API fails
        setAvailableAgents([
          {
            id: "general",
            type: "general",
            name: "General Assistant",
            description: "A versatile AI assistant with access to all available tools.",
            capabilities: ["Web search", "Image generation", "File analysis"],
            icon: "🤖",
          },
        ]);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // Console log context data changes
  const currentAgentType = watch("agentType");
  useEffect(() => {
    if (contextData.contextType) {
      console.log("📚 Context Data Updated:", {
        agentType: currentAgentType,
        ...contextData,
        timestamp: new Date().toISOString(),
      });
    }
  }, [contextData, currentAgentType]);

  const handleKeyDown: KeyboardEventHandler<HTMLFormElement> = (event) => {
    // Only handle Enter key if it's from the textarea
    const target = event.target as HTMLElement;
    const isTextarea = target.tagName === "TEXTAREA";

    if (event.key === "Enter" && !event.shiftKey && isTextarea) {
      event.preventDefault();
      handleSubmit(isWorking || !stateCurrentConversationId ? startStream : continueStream)();
    }
  };

  // Wrapper functions to integrate with the form
  const handleFilesDrop = async (files: File[]) => {
    console.log("📎 Files dropped:", files.length, files);
    await fileHandlerDrop(files);
  };

  const handleFileSelect = async (files: FileList | null) => {
    console.log("📎 Files selected:", files?.length, files);
    await fileHandlerSelect(files);
  };

  const stopGeneration = async () => {
    if (eventSourceRef.current) {
      try {
        if (streamTokenRef.current) {
          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/stop-stream?streamToken=${streamTokenRef.current}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
              },
            }
          );
        }
      } catch (error) {
        console.error("Error stopping stream:", error);
      } finally {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        streamTokenRef.current = null;
        setIsWorking(false);
      }
    }
  };

  const initStream = async (data: FormInputs, isNewConversation: boolean) => {
    console.log("🚀 initStream called with:", {
      isNewConversation,
      attachmentsLength: attachments.length,
      data,
    });
    setIsWorking(true);
    try {
      // If it's a new conversation, clear messages
      if (isNewConversation) {
        setMessages([]);
      }

      let currentConversationId = isNewConversation ? null : stateCurrentConversationId;

      // Prepare files first using the shared prepareFiles function
      console.log("📎 Form data attachments:", data.attachments);
      console.log("📎 Hook attachments before preparation:", attachments);

      // Check if we have attachments to prepare
      let uploadedFiles: {
        id?: string;
        name?: string;
        type?: string;
        dataUrl?: string;
      }[] = [];
      if (attachments.length > 0) {
        uploadedFiles = await prepareFiles(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/files/prepare`,
          currentConversationId
        );
      }

      console.log("📎 Prepared files result:", uploadedFiles);

      // Prepare the request data
      const requestData = {
        messages: [
          {
            role: "user",
            content: data.message,
          },
        ],
        attachments: uploadedFiles.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          dataUrl: file.dataUrl,
        })),
        conversationId: currentConversationId,
        autonomousMode: isAutonomousMode,
        agentType: data.agentType,
        contextData: contextData, // Use the component state directly
      };

      // Log the complete request data including contextData
      console.log("🚀 Sending request to /api/agent/init:", {
        ...requestData,
        attachments: `${requestData.attachments.length} attachments`,
      });

      // Step 1: Init session and get stream token
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
        },
        body: JSON.stringify(requestData),
      });

      const { streamToken, conversationId } = await res.json();

      currentConversationId = conversationId;

      // Clear attachments after successful preparation
      clearAttachments();

      // Store the conversation ID for future use
      if (currentConversationId) {
        setStateCurrentConversationId(currentConversationId);
      }

      // Step 2: Start SSE stream
      const evtSource = new EventSource(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/stream?streamToken=${streamToken}`
      );

      streamTokenRef.current = streamToken;

      // Store the EventSource instance
      eventSourceRef.current = evtSource;

      evtSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        setMessages((prev) => [...prev, payload]);

        if (payload.type === "finished") {
          evtSource.close();
          eventSourceRef.current = null;
          streamTokenRef.current = null;
          setIsWorking(false);
        }
      };

      evtSource.onerror = (error) => {
        console.error("SSE Error:", error);
        evtSource.close();
        eventSourceRef.current = null;
        streamTokenRef.current = null;
        setIsWorking(false);
      };

      // Clean up the connection when component unmounts
      return () => {
        evtSource.close();
        eventSourceRef.current = null;
        streamTokenRef.current = null;
        setIsWorking(false);
      };
    } catch (error) {
      console.error("Failed to start stream:", error);
      setIsWorking(false);
    }
  };

  const startStream = (data: FormInputs) => initStream(data, true);
  const continueStream = (data: FormInputs) => initStream(data, false);

  const lastMessage = messages[messages.length - 1];

  const toggleMode = () => {
    setIsAutonomousMode((prev) => !prev);
  };

  // Debug: Log attachments on each render
  console.log("📎 Current attachments in render:", attachments.length, attachments);

  return (
    <Card className="p-4 md:p-6 w-full max-w-full">
      <form onSubmit={handleSubmit(startStream)} onKeyDown={handleKeyDown} className="flex flex-col gap-4 mb-4">
        <div className="space-y-2">
          {/* Textarea */}
          <Textarea
            {...register("message", { required: true })}
            placeholder="Enter your message to AI... (You can also drag & drop or paste files here)"
            className="w-full min-h-[120px] md:min-h-[150px] p-3 border border-gray-300 rounded resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFilesDrop={handleFilesDrop}
          />

          {/* Message Input Toolbar */}
          <MessageInputToolbar className="border border-gray-300 rounded-lg">
            <ToolbarSection position="left">
              {/* Upload Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => document.getElementById("agent-file-input")?.click()}
                      disabled={isWorking}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Upload files (images, PDFs, markdown)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Dummy Attachment Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => console.log("Dummy button clicked!")}
                      disabled={isWorking}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Attach from library (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <ToolbarDivider />

              <ContextSelectorPopover
                contextData={contextData}
                onContextDataChange={handleContextDataChange}
                disabled={isWorking || isLoadingAgents}
              />

              {/* Agent Selector Button */}
              <AgentSelectorPopover
                value={watch("agentType")}
                onValueChange={(value) => setValue("agentType", value as FormInputs["agentType"])}
                agents={availableAgents}
                disabled={isLoadingAgents}
              />

              {/* Autonomous Mode Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isAutonomousMode ? "default" : "ghost"}
                      size="sm"
                      className={cn("h-8 w-8 p-0", isAutonomousMode && "bg-blue-500 hover:bg-blue-600 text-white")}
                      onClick={toggleMode}
                      disabled={isWorking}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      {isAutonomousMode
                        ? "Autonomous Mode: AI will complete tasks automatically"
                        : "Manual Mode: AI will perform one action at a time"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToolbarSection>
          </MessageInputToolbar>

          {/* Attachment preview area */}
          {attachments.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <AttachmentPreview
                attachments={attachments}
                onRemove={fileHandlerRemove}
                maxVisible={8}
                className="gap-2"
              />
            </div>
          )}

          {/* Hidden file input */}
          <input
            id="agent-file-input"
            type="file"
            multiple
            accept="image/*,application/pdf,.md,.markdown"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            type="submit"
            disabled={isWorking}
            className="sm:flex-1"
            onClick={handleSubmit(startStream)}
          >
            {isWorking ? "Processing..." : "New Conversation"}
          </Button>
          <Button
            variant="default"
            type="button"
            disabled={isWorking || !stateCurrentConversationId}
            className="sm:flex-1"
            onClick={handleSubmit(continueStream)}
          >
            Continue Conversation
          </Button>
          {isWorking && (
            <Button type="button" variant="destructive" onClick={stopGeneration} className="sm:flex-1">
              Stop Generation
            </Button>
          )}
        </div>
      </form>

      {/* Status and Toggle Section */}
      {(isWorking || messages.length > 0) && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center justify-between hover:bg-gray-50 rounded-md p-2 transition-colors cursor-pointer select-none"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 font-medium">{isWorking ? "GC Agent is working..." : "Finished"}</p>
                {stateCurrentConversationId && (
                  <span className="text-xs text-gray-400">Conversation #{stateCurrentConversationId}</span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                {isExpanded ? "Show Less" : "Show More"}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {/* Last message when collapsed - now using MessageCard */}
            {!isExpanded && lastMessage && <MessageCard message={lastMessage} isWorking={isWorking} />}

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-4 space-y-3 md:space-y-4">
                {messages.map((message, index) => (
                  <MessageCard key={index} message={message} isWorking={isWorking} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
