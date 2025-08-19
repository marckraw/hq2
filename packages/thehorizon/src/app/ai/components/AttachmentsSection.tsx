"use client";

import React from "react";
import { AttachmentList } from "@/components/ai-chat/attachments/AttachmentList";
import type { DocumentAttachmentProps } from "@/components/ai-chat/attachments/DocumentAttachment";

interface AttachmentsSectionProps {
  attachments: DocumentAttachmentProps[];
  onRemove: (id: string) => void;
}

export function AttachmentsSection({ attachments, onRemove }: AttachmentsSectionProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      <AttachmentList
        attachments={attachments}
        onRemove={onRemove}
        compact
        direction="horizontal"
        showCount
      />
    </div>
  );
}