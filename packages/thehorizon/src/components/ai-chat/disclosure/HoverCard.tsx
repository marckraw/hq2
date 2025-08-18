import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export interface HoverCardProps {
  /** The trigger element that shows the card on hover */
  children: React.ReactNode;
  /** Content to show in the hover card */
  content: React.ReactNode;
  /** Delay before showing (ms) */
  openDelay?: number;
  /** Delay before hiding (ms) */
  closeDelay?: number;
  /** Side to show the card */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the card */
  align?: "start" | "center" | "end";
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Custom className for the card */
  className?: string;
  /** Whether to show arrow pointing to trigger */
  showArrow?: boolean;
  /** Custom offset from trigger */
  offset?: number;
  /** Viewport padding to maintain from edges */
  viewportPadding?: number;
  /** Whether to auto-flip when near viewport edge */
  autoFlip?: boolean;
}

/**
 * HoverCard - Shows content on hover with smart positioning
 * 
 * Pure presentational component for hover reveals with viewport boundary detection
 */
export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  content,
  openDelay = 200,
  closeDelay = 100,
  side = "top",
  align = "center",
  disabled = false,
  className,
  showArrow = true,
  offset = 8,
  viewportPadding = 8,
  autoFlip = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualSide, setActualSide] = useState(side);
  const [actualAlign, setActualAlign] = useState(align);
  const openTimeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate position with viewport boundary detection
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !cardRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const card = cardRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    
    let x = 0;
    let y = 0;
    let finalSide = side;
    let finalAlign = align;

    // Helper function to check if position fits in viewport
    const fitsInViewport = (posX: number, posY: number, cardWidth: number, cardHeight: number) => {
      const absoluteX = trigger.left + posX;
      const absoluteY = trigger.top + posY;
      
      return (
        absoluteX >= viewportPadding &&
        absoluteX + cardWidth <= viewport.width - viewportPadding &&
        absoluteY >= viewportPadding &&
        absoluteY + cardHeight <= viewport.height - viewportPadding
      );
    };

    // Try preferred side first
    const tryPosition = (testSide: typeof side, testAlign: typeof align) => {
      let testX = 0;
      let testY = 0;

      // Calculate position for the test side
      switch (testSide) {
        case "top":
          testY = -(card.height + offset);
          break;
        case "bottom":
          testY = trigger.height + offset;
          break;
        case "left":
          testX = -(card.width + offset);
          testY = trigger.height / 2 - card.height / 2;
          break;
        case "right":
          testX = trigger.width + offset;
          testY = trigger.height / 2 - card.height / 2;
          break;
      }

      // Calculate alignment for vertical sides
      if (testSide === "top" || testSide === "bottom") {
        switch (testAlign) {
          case "start":
            testX = 0;
            break;
          case "center":
            testX = trigger.width / 2 - card.width / 2;
            break;
          case "end":
            testX = trigger.width - card.width;
            break;
        }
      }

      // Calculate alignment for horizontal sides
      if (testSide === "left" || testSide === "right") {
        switch (testAlign) {
          case "start":
            testY = 0;
            break;
          case "center":
            testY = trigger.height / 2 - card.height / 2;
            break;
          case "end":
            testY = trigger.height - card.height;
            break;
        }
      }

      return { x: testX, y: testY, fits: fitsInViewport(testX, testY, card.width, card.height) };
    };

    // Try the preferred position
    let result = tryPosition(side, align);
    
    if (result.fits || !autoFlip) {
      x = result.x;
      y = result.y;
    } else {
      // Try flipping to opposite side
      const oppositeSide = {
        top: "bottom" as const,
        bottom: "top" as const,
        left: "right" as const,
        right: "left" as const,
      }[side];
      
      result = tryPosition(oppositeSide, align);
      
      if (result.fits) {
        x = result.x;
        y = result.y;
        finalSide = oppositeSide;
      } else {
        // Try different alignments on preferred side
        const alignments: Array<typeof align> = ["center", "start", "end"];
        for (const testAlign of alignments) {
          if (testAlign === align) continue;
          
          result = tryPosition(side, testAlign);
          if (result.fits) {
            x = result.x;
            y = result.y;
            finalAlign = testAlign;
            break;
          }
        }
        
        // If still doesn't fit, try opposite side with different alignments
        if (!result.fits) {
          for (const testAlign of alignments) {
            result = tryPosition(oppositeSide, testAlign);
            if (result.fits) {
              x = result.x;
              y = result.y;
              finalSide = oppositeSide;
              finalAlign = testAlign;
              break;
            }
          }
        }
        
        // Last resort: use original position but adjust to stay within viewport
        if (!result.fits) {
          result = tryPosition(side, align);
          x = result.x;
          y = result.y;
          
          // Adjust position to stay within viewport
          const absoluteX = trigger.left + x;
          const absoluteY = trigger.top + y;
          
          if (absoluteX < viewportPadding) {
            x = viewportPadding - trigger.left;
          } else if (absoluteX + card.width > viewport.width - viewportPadding) {
            x = viewport.width - viewportPadding - card.width - trigger.left;
          }
          
          if (absoluteY < viewportPadding) {
            y = viewportPadding - trigger.top;
          } else if (absoluteY + card.height > viewport.height - viewportPadding) {
            y = viewport.height - viewportPadding - card.height - trigger.top;
          }
        }
      }
    }

    setPosition({ x, y });
    setActualSide(finalSide);
    setActualAlign(finalAlign);
  }, [isOpen, side, align, offset, viewportPadding, autoFlip]);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(openTimeoutRef.current);
      clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={triggerRef}>{children}</div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 rounded-lg border bg-popover p-2 text-popover-foreground shadow-md",
              className
            )}
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {content}
            
            {showArrow && (
              <div
                className={cn(
                  "absolute w-2 h-2 bg-popover border rotate-45",
                  actualSide === "top" && "bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0",
                  actualSide === "bottom" && "top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0",
                  actualSide === "left" && "right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0",
                  actualSide === "right" && "left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0"
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};