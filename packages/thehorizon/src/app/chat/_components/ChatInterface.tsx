"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "./ChatArea";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatProvider } from "../_state/chat";
import {
  useConversations,
  useDeleteConversation,
} from "../_hooks/useConversations";
import { useMessages, useTimeline } from "../_hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "./ChatInterface.types";

export function ChatInterface() {
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // React Query hooks
  const queryClient = useQueryClient();
  const { data: conversations = [], refetch: refetchConversations } =
    useConversations();
  const deleteConversationMutation = useDeleteConversation();
  const { data: timeline, refetch: refetchTimeline } =
    useTimeline(activeConversationId);
  const { data: messages = [] } = useMessages(activeConversationId);

  useEffect(() => {
    console.log("timeline", timeline);
  }, [timeline]);

  // Derive messages from timeline if available, otherwise use direct messages
  const currentMessages = useMemo(() => {
    if (timeline?.messages) {
      return timeline.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.createdAt,
      }));
    }
    return messages;
  }, [timeline, messages]);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clear optimistic messages when conversation changes
  useEffect(() => {
    // This hook is now empty, but kept in case we need to clear other
    // state on conversation change in the future.
  }, [activeConversationId]);

  const createNewConversation = () => {
    setActiveConversationId(null);
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  };

  const selectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);

      // If deleted conversation was active, reset to new chat
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-full bg-background relative overflow-hidden w-full">
      {/* Mobile backdrop */}
      {isMobileView && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out w-80",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={createNewConversation}
          onSelectConversation={selectConversation}
          onRefresh={refetchConversations}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden w-full",
          // On mobile, take full width regardless of sidebar state
          // On desktop, adjust based on sidebar state
          isMobileView ? "w-full" : !isSidebarOpen ? "w-full" : ""
        )}
      >
        {/* Mobile header */}
        {isMobileView && (
          <div className="flex items-center justify-between p-4 border-b bg-background border-border flex-shrink-0 w-full">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Chat</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        )}

        <ChatProvider>
          <ChatArea
            conversationId={activeConversationId}
            messages={currentMessages}
            timeline={timeline}
            onMessagesUpdate={(newMessages: Message[]) => {
              // This now only serves to receive error messages, not for optimistic updates.
              // The logic for filtering and setting optimistic messages is removed.
            }}
            onConversationCreate={(conversationId: number) => {
              setActiveConversationId(conversationId);
              refetchConversations(); // Refresh conversation list
            }}
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onRefreshMessages={async (conversationId?: number) => {
              // Use the provided conversationId or fall back to activeConversationId
              const targetId = conversationId || activeConversationId;
              console.log("Refreshing messages for conversation:", targetId);
              if (targetId) {
                // Invalidate and refetch the specific conversation's timeline and messages
                await queryClient.invalidateQueries({
                  queryKey: ["timeline", targetId],
                });
                await queryClient.invalidateQueries({
                  queryKey: ["messages", targetId],
                });

                // If this is for the currently active conversation, also trigger direct refetch
                if (targetId === activeConversationId) {
                  await refetchTimeline();
                }
              }
            }}
          />
        </ChatProvider>
      </div>
    </div>
  );
}
