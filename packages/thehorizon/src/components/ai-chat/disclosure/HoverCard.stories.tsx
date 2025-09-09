import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard } from "./HoverCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Settings, Code, Database } from "lucide-react";

const meta = {
  title: "AI Chat/B. Core ⭐/Disclosure/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "**SUPER IMPORTANT** - Elegant hover cards for progressive disclosure of information. Shows additional content on hover with smooth animations."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Preferred side for the card"
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alignment relative to trigger"
    },
    delay: {
      control: "number",
      description: "Delay before showing (ms)"
    },
    autoFlip: {
      control: "boolean",
      description: "Auto-adjust position if not enough space"
    }
  }
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple text content
export const SimpleText: Story = {
  args: {
    content: "This is additional information that appears on hover",
    side: "top",
    children: <Button variant="outline">Hover me</Button>
  }
};

// Rich content
export const RichContent: Story = {
  args: {
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Information</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This hover card contains rich content including icons, badges, and formatted text.
        </p>
        <div className="flex gap-2">
          <Badge>Important</Badge>
          <Badge variant="secondary">v2.0</Badge>
        </div>
      </div>
    ),
    side: "right",
    children: <Button variant="outline" size="sm">Rich Content</Button>
  }
};

// With delay
export const WithDelay: Story = {
  args: {
    content: "This card appears after a 500ms delay",
    delay: 500,
    side: "top",
    children: <Button variant="ghost">Delayed hover</Button>
  }
};

// Different positions
export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <HoverCard
        content="Appears on top"
        side="top"
      >
        <Button variant="outline" size="sm">Top</Button>
      </HoverCard>
      
      <HoverCard
        content="Appears on right"
        side="right"
      >
        <Button variant="outline" size="sm">Right</Button>
      </HoverCard>
      
      <HoverCard
        content="Appears on bottom"
        side="bottom"
      >
        <Button variant="outline" size="sm">Bottom</Button>
      </HoverCard>
      
      <HoverCard
        content="Appears on left"
        side="left"
      >
        <Button variant="outline" size="sm">Left</Button>
      </HoverCard>
      
      <HoverCard
        content="Centered alignment"
        side="top"
        align="center"
      >
        <Button variant="outline" size="sm">Center</Button>
      </HoverCard>
      
      <HoverCard
        content="End alignment"
        side="top"
        align="end"
      >
        <Button variant="outline" size="sm">End</Button>
      </HoverCard>
    </div>
  )
};

// Auto-flip demonstration
export const AutoFlip: Story = {
  render: () => (
    <div className="flex justify-between items-center w-full max-w-3xl p-4">
      <HoverCard
        content={
          <div className="p-2 w-48">
            <p className="text-sm font-medium">Auto-flip enabled</p>
            <p className="text-xs text-muted-foreground">
              This card will flip to the opposite side if there's not enough space
            </p>
          </div>
        }
        side="left"
        autoFlip={true}
      >
        <Button variant="outline">Left edge (will flip)</Button>
      </HoverCard>
      
      <HoverCard
        content={
          <div className="p-2 w-48">
            <p className="text-sm font-medium">Auto-flip disabled</p>
            <p className="text-xs text-muted-foreground">
              This card will stay on the specified side regardless of space
            </p>
          </div>
        }
        side="right"
        autoFlip={false}
      >
        <Button variant="outline">Right edge (won't flip)</Button>
      </HoverCard>
    </div>
  )
};

// Code snippet example
export const CodeSnippet: Story = {
  args: {
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="text-sm font-mono">getUserData()</span>
        </div>
        <pre className="text-xs bg-muted p-2 rounded">
{`async function getUserData(id) {
  const user = await db.users.find(id);
  return user;
}`}
        </pre>
        <p className="text-xs text-muted-foreground">
          Returns: Promise&lt;User&gt;
        </p>
      </div>
    ),
    side: "right",
    children: (
      <Button variant="ghost" size="sm">
        <Code className="h-4 w-4 mr-2" />
        View implementation
      </Button>
    )
  }
};

// Metadata display
export const MetadataCard: Story = {
  args: {
    content: (
      <div className="space-y-3 p-1">
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-medium">Active</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="text-sm font-medium">2 hours ago</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Performance</p>
          <div className="flex gap-1 mt-1">
            <div className="h-1 w-16 bg-green-500 rounded" />
            <span className="text-xs">98%</span>
          </div>
        </div>
      </div>
    ),
    side: "bottom",
    children: (
      <Button variant="outline" size="sm">
        <Database className="h-4 w-4 mr-2" />
        Database Status
      </Button>
    )
  }
};

// Interactive elements
export const InteractiveContent: Story = {
  args: {
    content: (
      <div className="space-y-2">
        <p className="text-sm font-medium">Quick Actions</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="outline">Delete</Button>
          <Button size="sm" variant="default">Apply</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any action to proceed
        </p>
      </div>
    ),
    side: "bottom",
    children: (
      <Button>
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    )
  }
};