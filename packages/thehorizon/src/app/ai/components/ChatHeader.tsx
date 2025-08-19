"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({ sidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="border-b bg-card/50 backdrop-blur">
      <div className="px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">AI Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}