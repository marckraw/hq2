import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreaming } from "../../_state/chat";
import { ModelStatusDisplay } from "./ModelStatusDisplay";
import { LoadingIndicator } from "./LoadingIndicator";
import { AttachmentCounter } from "./AttachmentCounter";
import { SubmitStatus } from "./SubmitStatus";

export function ChatHeader() {
  const { connectionStatus } = useStreaming();

  return (
    <div className="flex items-center justify-between p-2 sm:p-4 border-b bg-background flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <h1 className="font-semibold text-base sm:text-lg">Chat</h1>
        {connectionStatus !== "disconnected" && (
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                connectionStatus === "connected" &&
                  "bg-green-500 animate-pulse",
                connectionStatus === "connecting" &&
                  "bg-yellow-500 animate-spin",
                connectionStatus === "error" && "bg-red-500"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {connectionStatus === "connected" && "Connected"}
              {connectionStatus === "connecting" && "Connecting..."}
              {connectionStatus === "error" && "Connection Error"}
            </span>
          </div>
        )}

        {/* Jotai Demo: Components with no prop drilling! 🎉 */}
        <LoadingIndicator />
        <AttachmentCounter />
        <SubmitStatus />
      </div>

      {/* Floating ModelStatusDisplay - no height impact! 🎉 */}
      <div className="hidden sm:block">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs hover:bg-muted/50"
            >
              <Brain className="h-3 w-3 mr-1" />
              Model Info
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0"
            align="end"
            side="bottom"
            sideOffset={8}
          >
            <ModelStatusDisplay />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
