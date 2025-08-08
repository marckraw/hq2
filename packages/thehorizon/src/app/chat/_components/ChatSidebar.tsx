"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MessageSquare,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "./ChatInterface.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onNewChat: () => void;
  onSelectConversation: (id: number) => void;
  onRefresh: () => void;
  onDeleteConversation: (id: number) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onRefresh,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {};

    conversations.forEach((conversation) => {
      const dateKey = formatDate(conversation.updatedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(conversation);
    });

    return groups;
  };

  const conversationGroups = groupConversationsByDate(conversations);

  return (
    <div className="h-full bg-background border-r flex flex-col animate-in slide-in-from-left duration-400">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 scroll-smooth chat-sidebar-scroll-area">
        <div className="p-2">
          {Object.keys(conversationGroups).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-500">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Start a new chat to begin your conversation
              </p>
            </div>
          ) : (
            Object.entries(conversationGroups).map(
              ([dateGroup, groupConversations]) => (
                <div key={dateGroup} className="mb-6">
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {dateGroup}
                    </h3>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-1">
                    {groupConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "group relative rounded-lg transition-all duration-200 hover:bg-accent/50 hover:translate-x-1 flex w-full",
                          activeConversationId === conversation.id &&
                            "bg-accent"
                        )}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex-1 justify-start p-3 h-auto font-normal text-left hover:bg-transparent pr-8 min-w-0",
                            activeConversationId === conversation.id &&
                              "bg-transparent"
                          )}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          <div className="flex items-start gap-3 w-full min-w-0">
                            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate leading-5">
                                {conversation.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {formatDate(conversation.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </Button>

                        {/* Conversation Actions */}
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-accent transition-all duration-200 hover:-translate-y-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  onDeleteConversation(conversation.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{conversations.length} conversations</span>
          <Badge variant="secondary" className="text-xs animate-pulse">
            Chat v2.0
          </Badge>
        </div>
      </div>
    </div>
  );
}
