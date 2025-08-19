"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Check, 
  X, 
  Edit3, 
  Clock,
  MessageSquare,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onRequestChanges?: (changes: string) => void;
  onDefer?: (until?: Date) => void;
  variant?: "full" | "minimal" | "compact";
  className?: string;
}

export function ApprovalActions({
  onApprove,
  onReject,
  onRequestChanges,
  onDefer,
  variant = "full",
  className,
}: ApprovalActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestedChanges, setRequestedChanges] = useState("");

  const handleReject = () => {
    onReject(rejectReason);
    setShowRejectDialog(false);
    setRejectReason("");
  };

  const handleRequestChanges = () => {
    if (onRequestChanges) {
      onRequestChanges(requestedChanges);
      setShowChangesDialog(false);
      setRequestedChanges("");
    }
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          variant="default"
          onClick={onApprove}
          className="h-7 text-xs"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject()}
          className="h-7 text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const buttonVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  return (
    <>
      <div className={cn(
        "flex items-center gap-2",
        variant === "compact" ? "justify-end" : "justify-between flex-wrap",
        className
      )}>
        <div className="flex items-center gap-2">
          <motion.div
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              size="sm"
              variant="default"
              onClick={onApprove}
              className="h-8 text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: 0.05 }}
          >
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              className="h-8 text-xs gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          </motion.div>
        </div>

        {variant === "full" && (
          <div className="flex items-center gap-2">
            {onRequestChanges && (
              <motion.div
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.1 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChangesDialog(true)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Request Changes
                </Button>
              </motion.div>
            )}

            {onDefer && (
              <motion.div
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.15 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDefer()}
                  className="h-8 text-xs gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Defer
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Approval</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this action (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes you'd like the agent to make.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the changes needed..."
              value={requestedChanges}
              onChange={(e) => setRequestedChanges(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangesDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!requestedChanges.trim()}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}