import type { Meta, StoryObj } from "@storybook/react";
import { ChatHeader } from "./ChatHeader";
import { Button } from "@/components/ui/button";
import { Settings, Share, Download } from "lucide-react";

const meta = {
  title: "AI Chat/C. Presentational/Layout/ChatHeader",
  component: ChatHeader,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "A header component for chat interfaces. Pure presentational with no router dependencies."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "minimal", "detailed"],
      description: "Visual variant of the header"
    },
    status: {
      control: "select", 
      options: ["online", "offline", "typing", "thinking"],
      description: "Status indicator"
    }
  }
} satisfies Meta<typeof ChatHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default header
export const Default: Story = {
  args: {
    title: "AI Assistant",
    subtitle: "Ready to help",
    variant: "default"
  }
};

// With status
export const WithStatus: Story = {
  args: {
    title: "AI Assistant",
    subtitle: "Ready to help",
    status: "online",
    variant: "default"
  }
};

// With badge
export const WithBadge: Story = {
  args: {
    title: "AI Assistant",
    subtitle: "Advanced mode",
    badge: "Pro",
    variant: "default"
  }
};

// Minimal variant
export const Minimal: Story = {
  args: {
    title: "Chat",
    variant: "minimal"
  }
};

// Detailed variant
export const Detailed: Story = {
  args: {
    title: "Research Assistant",
    subtitle: "Specialized in academic research",
    badge: "GPT-4",
    status: "online",
    variant: "detailed"
  }
};

// With icon
export const WithIcon: Story = {
  args: {
    title: "Code Assistant",
    subtitle: "Python specialist",
    icon: "🐍",
    variant: "default"
  }
};

// With back button
export const WithBackButton: Story = {
  args: {
    title: "Conversation #42",
    subtitle: "Project discussion",
    onBack: () => alert("Going back"),
    variant: "default"
  }
};

// With actions
export const WithActions: Story = {
  args: {
    title: "AI Assistant",
    subtitle: "Ready to help",
    actions: [
      <Button key="settings" size="icon" variant="ghost">
        <Settings className="h-4 w-4" />
      </Button>,
      <Button key="share" size="icon" variant="ghost">
        <Share className="h-4 w-4" />
      </Button>,
      <Button key="download" size="icon" variant="ghost">
        <Download className="h-4 w-4" />
      </Button>
    ],
    variant: "default"
  }
};

// Full example
export const FullExample: Story = {
  args: {
    title: "Claude 3",
    subtitle: "Anthropic's AI Assistant",
    icon: "🤖",
    badge: "Opus",
    status: "online",
    onBack: () => alert("Going back"),
    actions: [
      <Button key="settings" size="icon" variant="ghost">
        <Settings className="h-4 w-4" />
      </Button>
    ],
    variant: "detailed"
  }
};

// Different statuses
export const StatusShowcase: Story = {
  render: () => (
    <div className="space-y-4">
      <ChatHeader 
        title="Online"
        status="online"
        variant="default"
      />
      <ChatHeader 
        title="Offline"
        status="offline"
        variant="default"
      />
      <ChatHeader 
        title="Typing"
        status="typing"
        variant="default"
      />
      <ChatHeader 
        title="Thinking"
        status="thinking"
        variant="default"
      />
    </div>
  )
};