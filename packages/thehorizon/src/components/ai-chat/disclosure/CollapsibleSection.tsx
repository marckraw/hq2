import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CollapsibleSectionProps {
  /** Section title */
  title: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Whether section is initially open */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Icon to show when closed */
  closedIcon?: React.ElementType;
  /** Icon to show when open */
  openIcon?: React.ElementType;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Icon position */
  iconPosition?: "left" | "right";
  /** Custom className */
  className?: string;
  /** Header className */
  headerClassName?: string;
  /** Content className */
  contentClassName?: string;
  /** Whether to indent content */
  indentContent?: boolean;
  /** Animation duration */
  duration?: number;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Badge or additional info to show in header */
  badge?: React.ReactNode;
  /** Whether the section is disabled */
  disabled?: boolean;
}

/**
 * CollapsibleSection - Expandable/collapsible content section
 * 
 * Pure presentational component for progressive disclosure
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  closedIcon: ClosedIcon = ChevronRight,
  openIcon: OpenIcon = ChevronDown,
  showIcon = true,
  iconPosition = "left",
  className,
  headerClassName,
  contentClassName,
  indentContent = true,
  duration = 0.2,
  trigger,
  badge,
  disabled = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (disabled) return;
    
    const newState = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const Icon = isOpen ? OpenIcon : ClosedIcon;

  return (
    <div className={cn("w-full", className)}>
      {/* Header/Trigger */}
      {trigger ? (
        <div onClick={handleToggle} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "w-full flex items-center gap-2 p-2 text-left transition-colors",
            "hover:bg-muted/50 rounded-lg",
            disabled && "opacity-50 cursor-not-allowed",
            headerClassName
          )}
        >
          {showIcon && iconPosition === "left" && (
            <motion.div
              animate={{ rotate: isOpen ? 0 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
            </motion.div>
          )}
          
          <div className="flex-1">{title}</div>
          
          {badge}
          
          {showIcon && iconPosition === "right" && (
            <motion.div
              animate={{ rotate: isOpen ? 0 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
            </motion.div>
          )}
        </button>
      )}

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "pt-2",
                indentContent && showIcon && iconPosition === "left" && "pl-6",
                contentClassName
              )}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * AccordionGroup - Group of collapsible sections with single selection
 */
export interface AccordionGroupProps {
  /** Array of sections */
  sections: {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    badge?: React.ReactNode;
    disabled?: boolean;
  }[];
  /** Currently open section ID */
  value?: string;
  /** Callback when section changes */
  onValueChange?: (value: string) => void;
  /** Whether multiple sections can be open */
  multiple?: boolean;
  /** Custom className */
  className?: string;
}

export const AccordionGroup: React.FC<AccordionGroupProps> = ({
  sections,
  value,
  onValueChange,
  multiple = false,
  className,
}) => {
  const [openSections, setOpenSections] = useState<string[]>(value ? [value] : []);

  const handleSectionToggle = (sectionId: string) => {
    if (multiple) {
      const newSections = openSections.includes(sectionId)
        ? openSections.filter(id => id !== sectionId)
        : [...openSections, sectionId];
      setOpenSections(newSections);
      onValueChange?.(newSections[0] || "");
    } else {
      const newSection = openSections.includes(sectionId) ? "" : sectionId;
      setOpenSections(newSection ? [newSection] : []);
      onValueChange?.(newSection);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {sections.map((section) => (
        <CollapsibleSection
          key={section.id}
          title={section.title}
          badge={section.badge}
          disabled={section.disabled}
          open={openSections.includes(section.id)}
          onOpenChange={() => handleSectionToggle(section.id)}
          className="border rounded-lg"
          headerClassName="p-3"
          contentClassName="px-3 pb-3"
        >
          {section.content}
        </CollapsibleSection>
      ))}
    </div>
  );
};

/**
 * ExpandButton - Simple expand/collapse button
 */
export interface ExpandButtonProps {
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  expandText?: string;
  collapseText?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({
  expanded = false,
  onExpandChange,
  expandText = "Show more",
  collapseText = "Show less",
  className,
  size = "md",
}) => {
  const Icon = expanded ? Minus : Plus;
  const text = expanded ? collapseText : expandText;

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "sm" : size === "lg" ? "default" : "sm"}
      onClick={() => onExpandChange?.(!expanded)}
      className={cn("gap-1", className)}
    >
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </Button>
  );
};