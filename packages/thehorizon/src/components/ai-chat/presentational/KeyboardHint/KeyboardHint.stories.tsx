import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardHint } from "./KeyboardHint";
import { Card } from "@/components/ui/card";

const meta = {
  title: "AI Chat/C. Presentational/Content/KeyboardHint",
  component: KeyboardHint,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Displays keyboard shortcuts in a clean, accessible format. Pure presentational component."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["inline", "card", "minimal"],
      description: "Display variant"
    },
    platform: {
      control: "select",
      options: ["auto", "mac", "windows", "linux"],
      description: "Platform-specific shortcuts"
    },
    compact: {
      control: "boolean",
      description: "Compact display mode"
    },
    showIcon: {
      control: "boolean",
      description: "Show keyboard icon"
    }
  }
} satisfies Meta<typeof KeyboardHint>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultShortcuts = [
  { id: "new", keys: ["⌘", "N"], description: "New conversation" },
  { id: "toggle", keys: ["⌘", "B"], description: "Toggle sidebar" },
  { id: "pin", keys: ["⌃", "⇧", "B"], description: "Pin sidebar" },
  { id: "search", keys: ["⌘", "K"], description: "Search" },
  { id: "escape", keys: ["ESC"], description: "Close panel" }
];

// Inline variant
export const Inline: Story = {
  args: {
    shortcuts: defaultShortcuts,
    variant: "inline"
  }
};

// Card variant
export const CardVariant: Story = {
  args: {
    shortcuts: defaultShortcuts,
    variant: "card"
  }
};

// Minimal variant
export const Minimal: Story = {
  args: {
    shortcuts: defaultShortcuts.slice(0, 3),
    variant: "minimal"
  }
};

// Compact mode
export const Compact: Story = {
  args: {
    shortcuts: defaultShortcuts,
    variant: "inline",
    compact: true
  }
};

// Without icon
export const NoIcon: Story = {
  args: {
    shortcuts: defaultShortcuts,
    variant: "card",
    showIcon: false
  }
};

// Platform-specific (Mac)
export const MacShortcuts: Story = {
  args: {
    shortcuts: [
      { id: "copy", keys: ["⌘", "C"], description: "Copy" },
      { id: "paste", keys: ["⌘", "V"], description: "Paste" },
      { id: "undo", keys: ["⌘", "Z"], description: "Undo" },
      { id: "redo", keys: ["⌘", "⇧", "Z"], description: "Redo" }
    ],
    platform: "mac",
    variant: "card"
  }
};

// Platform-specific (Windows)
export const WindowsShortcuts: Story = {
  args: {
    shortcuts: [
      { id: "copy", keys: ["Ctrl", "C"], description: "Copy" },
      { id: "paste", keys: ["Ctrl", "V"], description: "Paste" },
      { id: "undo", keys: ["Ctrl", "Z"], description: "Undo" },
      { id: "redo", keys: ["Ctrl", "Y"], description: "Redo" }
    ],
    platform: "windows",
    variant: "card"
  }
};

// Complex shortcuts
export const ComplexShortcuts: Story = {
  args: {
    shortcuts: [
      { id: "format", keys: ["⌘", "⌥", "⇧", "F"], description: "Format document" },
      { id: "terminal", keys: ["⌃", "`"], description: "Toggle terminal" },
      { id: "command", keys: ["⌘", "⇧", "P"], description: "Command palette" },
      { id: "settings", keys: ["⌘", ","], description: "Open settings" }
    ],
    variant: "card"
  }
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-sm font-medium mb-2">Inline Variant</h3>
        <KeyboardHint
          shortcuts={defaultShortcuts.slice(0, 3)}
          variant="inline"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Card Variant</h3>
        <KeyboardHint
          shortcuts={defaultShortcuts}
          variant="card"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Minimal Variant</h3>
        <KeyboardHint
          shortcuts={defaultShortcuts.slice(0, 2)}
          variant="minimal"
          compact
        />
      </div>
    </div>
  )
};