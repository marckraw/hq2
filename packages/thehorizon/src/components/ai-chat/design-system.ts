/**
 * AI Chat Design System
 * 
 * Centralized design tokens for consistent styling across all AI chat components
 */

/**
 * Typography Scale
 * Based on a modular scale for consistent hierarchy
 */
export const fontSize = {
  // Base text sizes
  "2xs": "text-[10px]",   // Smallest - timestamps, minor labels
  xs: "text-xs",           // Small - secondary text, labels (12px)
  sm: "text-sm",           // Default - body text (14px)
  base: "text-base",       // Larger body text (16px)
  lg: "text-lg",           // Section headers (18px)
  xl: "text-xl",           // Page headers (20px)
  
  // Specific use cases
  label: "text-xs",        // Form labels, meta info
  body: "text-sm",         // Main content
  caption: "text-[10px]",  // Captions, timestamps
  mono: "text-xs font-mono", // Code, technical content
} as const;

/**
 * Component Size Scale
 * Consistent sizing for interactive elements
 */
export const componentSize = {
  // Icons
  icon: {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  },
  
  // Badges
  badge: {
    sm: "h-4 px-1 text-[10px]",
    md: "h-5 px-2 text-xs",
    lg: "h-6 px-3 text-sm",
  },
  
  // Buttons
  button: {
    xs: "h-6 px-2 text-xs",
    sm: "h-7 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  },
  
  // Avatars/Circles
  circle: {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  },
} as const;

/**
 * Spacing Scale
 * Consistent spacing throughout components
 */
export const spacing = {
  // Padding
  padding: {
    xs: "p-1",
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  },
  
  // Gaps
  gap: {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  },
  
  // Specific component spacing
  card: "p-2",
  section: "p-3",
  compact: "p-1.5",
} as const;

/**
 * Border & Radius
 */
export const borders = {
  // Border widths
  width: {
    thin: "border",
    medium: "border-2",
  },
  
  // Border opacity for subtle borders
  opacity: {
    subtle: "border-muted-foreground/5",
    light: "border-muted-foreground/10",
    medium: "border-muted-foreground/20",
    strong: "border-muted-foreground/30",
  },
  
  // Border radius
  radius: {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
} as const;

/**
 * Colors & Effects
 */
export const effects = {
  // Background opacity
  background: {
    subtle: "bg-muted/20",
    light: "bg-muted/30",
    medium: "bg-muted/50",
    strong: "bg-muted/70",
  },
  
  // Hover states
  hover: {
    subtle: "hover:bg-muted/30",
    medium: "hover:bg-muted/50",
    strong: "hover:bg-muted/70",
  },
  
  // Status colors
  status: {
    active: "text-primary",
    success: "text-green-500",
    warning: "text-amber-500",
    error: "text-destructive",
    muted: "text-muted-foreground",
  },
} as const;

/**
 * Animation Timings
 */
export const animation = {
  // Durations
  duration: {
    instant: "duration-75",
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
  },
  
  // Easing
  easing: {
    smooth: "ease-in-out",
    bounce: "ease-out",
    linear: "ease-linear",
  },
} as const;

/**
 * Composite Styles
 * Pre-composed styles for common patterns
 */
export const compositeStyles = {
  // Compact component header
  compactHeader: `${fontSize.sm} ${spacing.padding.sm} ${borders.radius.md}`,
  
  // Expanded component header
  expandedHeader: `${fontSize.sm} ${spacing.padding.sm} ${effects.hover.subtle}`,
  
  // Content area
  content: `${fontSize.xs} ${spacing.padding.sm}`,
  
  // Inline code/technical
  inlineCode: `${fontSize.mono} ${effects.background.subtle} ${spacing.padding.xs} ${borders.radius.sm}`,
  
  // Status indicator
  statusIndicator: `${fontSize.xs} ${spacing.gap.xs} ${animation.duration.normal}`,
} as const;

/**
 * Type exports for TypeScript support
 */
export type FontSize = keyof typeof fontSize;
export type ComponentSize = keyof typeof componentSize.icon;
export type SpacingSize = keyof typeof spacing.padding;
export type BorderOpacity = keyof typeof borders.opacity;
export type EffectBackground = keyof typeof effects.background;