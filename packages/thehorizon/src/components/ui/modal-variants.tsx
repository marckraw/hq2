import * as React from "react";
import { DetailModal } from "./detail-modal";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Standard modal for general content
export function StandardModal({
  isOpen,
  onClose,
  title,
  children,
}: BaseModalProps) {
  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="default"
    >
      {children}
    </DetailModal>
  );
}

// Wide modal for data tables and detailed content
export function WideModal({
  isOpen,
  onClose,
  title,
  children,
}: BaseModalProps) {
  return (
    <DetailModal isOpen={isOpen} onClose={onClose} title={title} width="wide">
      {children}
    </DetailModal>
  );
}

// Full-screen modal for complex interfaces
export function FullScreenModal({
  isOpen,
  onClose,
  title,
  children,
}: BaseModalProps) {
  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="fullscreen"
    >
      {children}
    </DetailModal>
  );
}
