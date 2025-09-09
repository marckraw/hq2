"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ChevronRight,
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  Pin,
  PinOff,
  Command,
} from "lucide-react";

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationSidebarWithHintProps {
  conversations: Conversation[];
  conversationsLoading: boolean;
  currentConversationId: number | null;
  onNewConversation: () => void;
  onSelectConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
}

export function ConversationSidebarWithHint({
  conversations,
  conversationsLoading,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
}: ConversationSidebarWithHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai-sidebar-pinned") === "true";
    }
    return false;
  });
  const [isHoveringHint, setIsHoveringHint] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle pin state persistence
  useEffect(() => {
    localStorage.setItem("ai-sidebar-pinned", isPinned.toString());
  }, [isPinned]);

  // Handle hover intent
  useEffect(() => {
    if (isPinned) {
      setIsOpen(true);
      return;
    }

    // Clear any existing timeouts
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    if (isHoveringHint || isHoveringSidebar) {
      // Clear close timeout if hovering
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      
      // Open after delay when hovering hint
      if (isHoveringHint && !isOpen) {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsOpen(true);
        }, 300);
      }
    } else {
      // Close after delay when not hovering
      if (isOpen && !isPinned) {
        closeTimeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 500);
      }
    }

    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isHoveringHint, isHoveringSidebar, isOpen, isPinned]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + B: Toggle pin (check this first)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsPinned(prev => {
          const newPinned = !prev;
          // If pinning, also open the sidebar
          if (newPinned) {
            setIsOpen(true);
          }
          return newPinned;
        });
        return; // Important: return early so we don't also trigger the toggle
      }
      
      // Cmd/Ctrl + B: Toggle sidebar (only if not shift)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isPinned) {
          // If pinned, unpin and close
          setIsPinned(false);
          setIsOpen(false);
        } else {
          // If not pinned, just toggle visibility
          setIsOpen(prev => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPinned]);

  const handleSelectConversation = (id: number) => {
    onSelectConversation(id);
    // Auto-close sidebar after selection if not pinned
    if (!isPinned) {
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  return (
    <>
      {/* Hint Pill - Always visible */}
      <motion.div
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-40",
          "transition-all duration-200",
          isOpen && "opacity-0 pointer-events-none"
        )}
        onMouseEnter={() => setIsHoveringHint(true)}
        onMouseLeave={() => setIsHoveringHint(false)}
      >
        <motion.div
          className={cn(
            "flex items-center gap-2 px-2 py-3 rounded-r-full",
            "bg-card/80 backdrop-blur border border-l-0",
            "cursor-pointer transition-all duration-200",
            "hover:px-4 hover:gap-3 group"
          )}
          whileHover={{ x: 2 }}
          animate={{
            x: isHoveringHint ? 2 : 0,
          }}
        >
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-sm font-medium text-muted-foreground",
            "transition-all duration-200",
            "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100"
          )}>
            {conversations.length} chats
          </span>
          {conversations.length > 0 && !isHoveringHint && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
            >
              {conversations.length}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || isPinned) && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed left-0 top-0 h-full w-80 z-50",
              "border-r bg-card/95 backdrop-blur-md flex flex-col",
              "shadow-xl"
            )}
            onMouseEnter={() => setIsHoveringSidebar(true)}
            onMouseLeave={() => setIsHoveringSidebar(false)}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">Conversations</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant={isPinned ? "default" : "ghost"}
                    onClick={() => setIsPinned(!isPinned)}
                    className="h-8 w-8"
                    title={isPinned ? "Unpin sidebar (⌃⇧B)" : "Pin sidebar (⌃⇧B)"}
                  >
                    {isPinned ? (
                      <Pin className="h-4 w-4" />
                    ) : (
                      <PinOff className="h-4 w-4" />
                    )}
                  </Button>
                  {!isPinned && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={onNewConversation}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>

            {/* Shortcuts hint */}
            <div className="px-4 py-2 text-xs text-muted-foreground border-b">
              <div className="flex items-center gap-2">
                <Command className="h-3 w-3" />
                <span>
                  {navigator.platform.includes("Mac") 
                    ? "⌘B toggle • ⌃⇧B pin" 
                    : "Ctrl+B toggle • Ctrl+Shift+B pin"}
                </span>
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group"
                    >
                      <Button
                        variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left group"
                        onClick={() => handleSelectConversation(conv.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate flex-1">{conv.title}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional backdrop when sidebar is open and not pinned */}
      <AnimatePresence>
        {isOpen && !isPinned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}