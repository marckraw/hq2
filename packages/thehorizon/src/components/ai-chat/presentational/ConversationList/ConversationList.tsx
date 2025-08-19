"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem, type ConversationItemProps } from "../ConversationItem/ConversationItem";
import { Loader2, MessageSquareOff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export interface Conversation {
  id: string | number;
  title: string;
  preview?: string;
  timestamp?: Date | string;
  isUnread?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  messageCount?: number;
}

export interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string | number | null;
  onSelect?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onPin?: (id: string | number) => void;
  onArchive?: (id: string | number) => void;
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
  isLoading?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  animated?: boolean;
  variant?: "default" | "compact" | "detailed";
  groupBy?: "none" | "date" | "pinned";
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onPin,
  onArchive,
  emptyMessage = "No conversations yet",
  emptyIcon: EmptyIcon = MessageSquareOff,
  isLoading = false,
  showSearch = false,
  searchPlaceholder = "Search conversations...",
  className,
  animated = true,
  variant = "default",
  groupBy = "none",
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;
    
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const groupedConversations = React.useMemo(() => {
    if (groupBy === "none") {
      return [{ label: null, items: filteredConversations }];
    }

    if (groupBy === "pinned") {
      const pinned = filteredConversations.filter(c => c.isPinned);
      const unpinned = filteredConversations.filter(c => !c.isPinned);
      
      const groups = [];
      if (pinned.length > 0) groups.push({ label: "Pinned", items: pinned });
      if (unpinned.length > 0) groups.push({ label: "All Conversations", items: unpinned });
      return groups;
    }

    if (groupBy === "date") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const groups: Record<string, Conversation[]> = {
        Today: [],
        Yesterday: [],
        "This Week": [],
        Older: [],
      };

      filteredConversations.forEach(conv => {
        if (!conv.timestamp) {
          groups.Older.push(conv);
          return;
        }
        
        const date = new Date(conv.timestamp);
        if (date >= today) groups.Today.push(conv);
        else if (date >= yesterday) groups.Yesterday.push(conv);
        else if (date >= weekAgo) groups["This Week"].push(conv);
        else groups.Older.push(conv);
      });

      return Object.entries(groups)
        .filter(([_, items]) => items.length > 0)
        .map(([label, items]) => ({ label, items }));
    }

    return [{ label: null, items: filteredConversations }];
  }, [filteredConversations, groupBy]);

  const Container = animated ? motion.div : "div";

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center py-8",
        className
      )}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {showSearch && (
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <Container
              className="flex flex-col items-center justify-center py-8 text-center"
              {...(animated ? {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
              } : {})}
            >
              <EmptyIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </Container>
          ) : (
            <AnimatePresence mode="popLayout">
              {groupedConversations.map((group, groupIndex) => (
                <div key={group.label || "default"} className="space-y-1">
                  {group.label && (
                    <div className="px-2 py-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {group.label}
                      </span>
                    </div>
                  )}
                  {group.items.map((conversation, index) => (
                    <ConversationItem
                      key={conversation.id}
                      {...conversation}
                      isActive={activeId === conversation.id}
                      onSelect={() => onSelect?.(conversation.id)}
                      onDelete={() => onDelete?.(conversation.id)}
                      onPin={() => onPin?.(conversation.id)}
                      onArchive={() => onArchive?.(conversation.id)}
                      variant={variant}
                      animated={animated}
                      showActions={!isLoading}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}