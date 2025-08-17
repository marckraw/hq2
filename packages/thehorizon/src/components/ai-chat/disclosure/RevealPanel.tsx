import React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RevealPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Panel title */
  title?: string;
  /** Panel content */
  children: React.ReactNode;
  /** Side from which panel slides */
  side?: "left" | "right";
  /** Panel width */
  width?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to show overlay */
  showOverlay?: boolean;
  /** Whether to close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Custom className */
  className?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom header content */
  header?: React.ReactNode;
  /** Custom footer content */
  footer?: React.ReactNode;
}

/**
 * RevealPanel - Slide-out panel for detailed information
 * 
 * Pure presentational component for progressive disclosure
 */
export const RevealPanel: React.FC<RevealPanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  width = "md",
  showOverlay = true,
  closeOnOverlayClick = true,
  className,
  showCloseButton = true,
  header,
  footer,
}) => {
  const widthClasses = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[32rem]",
    xl: "w-[40rem]",
    full: "w-full",
  };

  const slideVariants = {
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    },
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
          )}

          {/* Panel */}
          <motion.div
            initial={slideVariants[side].initial}
            animate={slideVariants[side].animate}
            exit={slideVariants[side].exit}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "fixed top-0 h-full bg-background border shadow-xl z-50",
              widthClasses[width],
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className
            )}
          >
            {/* Header */}
            {(title || header || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b">
                {header || (
                  <h2 className="text-lg font-semibold">{title}</h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t p-4">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * RevealDrawer - Collapsible drawer that can be minimized
 */
export interface RevealDrawerProps extends RevealPanelProps {
  /** Whether the drawer is minimized */
  isMinimized?: boolean;
  /** Callback when minimize state changes */
  onMinimizeChange?: (minimized: boolean) => void;
  /** Content to show when minimized */
  minimizedContent?: React.ReactNode;
}

export const RevealDrawer: React.FC<RevealDrawerProps> = ({
  isMinimized = false,
  onMinimizeChange,
  minimizedContent,
  side = "right",
  ...panelProps
}) => {
  const ChevronIcon = side === "left" 
    ? (isMinimized ? ChevronRight : ChevronLeft)
    : (isMinimized ? ChevronLeft : ChevronRight);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50",
          side === "left" ? "left-0" : "right-0"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMinimizeChange?.(false)}
          className={cn(
            "h-20 w-8 rounded-none",
            side === "left" ? "rounded-r-lg border-l-0" : "rounded-l-lg border-r-0"
          )}
        >
          <ChevronIcon className="h-4 w-4" />
        </Button>
        {minimizedContent && (
          <div className="absolute top-full mt-2 p-2">
            {minimizedContent}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <RevealPanel
      {...panelProps}
      side={side}
      header={
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold">{panelProps.title}</h2>
          <div className="flex items-center gap-2">
            {onMinimizeChange && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMinimizeChange(true)}
                className="h-8 w-8"
              >
                <ChevronIcon className="h-4 w-4" />
              </Button>
            )}
            {panelProps.showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={panelProps.onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      }
      showCloseButton={false}
    />
  );
};