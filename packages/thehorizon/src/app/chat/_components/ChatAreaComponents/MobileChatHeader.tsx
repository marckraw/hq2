import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brain } from "lucide-react";
import { ModelStatusDisplay } from "./ModelStatusDisplay";

export function MobileChatHeader() {
  return (
    <div className="sm:hidden">
      <Popover>
        <PopoverTrigger asChild>
          <div className="p-2 border-b bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Tap for model info
              </span>
              <Brain className="h-3 w-3" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] p-0"
          align="center"
          side="bottom"
          sideOffset={4}
        >
          <ModelStatusDisplay />
        </PopoverContent>
      </Popover>
    </div>
  );
}
