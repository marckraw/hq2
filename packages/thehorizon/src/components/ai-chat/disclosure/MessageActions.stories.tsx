import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MessageActions } from "./MessageActions";
import { ChatMessage } from "@/components/ai-chat/primitives/ChatMessage/ChatMessage";

const meta = {
  title: "AI Chat/B. Core ⭐/Disclosure/MessageActions",
  component: MessageActions,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "**SUPER IMPORTANT** - Elegant hover actions for messages. Provides copy, retry, details, and other actions with smooth animations."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    visible: {
      control: "boolean",
      description: "Show/hide actions"
    },
    animation: {
      control: "select",
      options: ["fade", "slide", "scale"],
      description: "Animation type"
    },
    direction: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Layout direction"
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Button size"
    }
  }
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default actions
export const Default: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      retry: true,
      details: true
    },
    animation: "fade"
  }
};

// Slide animation (recommended)
export const SlideAnimation: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      retry: true,
      details: true
    },
    animation: "slide",
    size: "sm"
  }
};

// Scale animation
export const ScaleAnimation: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      retry: false,
      details: true
    },
    animation: "scale"
  }
};

// With feedback actions
export const WithFeedback: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      feedback: true
    },
    animation: "slide"
  }
};

// With edit and delete
export const WithEditDelete: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      edit: true,
      delete: true
    },
    animation: "slide"
  }
};

// Vertical layout
export const VerticalLayout: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      retry: true,
      details: true,
      share: true
    },
    direction: "vertical",
    animation: "slide"
  }
};

// Custom actions
export const CustomActions: Story = {
  args: {
    visible: true,
    customActions: [
      {
        id: "translate",
        label: "Translate",
        icon: () => "🌐",
        onClick: () => alert("Translating...")
      },
      {
        id: "bookmark",
        label: "Bookmark", 
        icon: () => "🔖",
        onClick: () => alert("Bookmarked!")
      }
    ],
    showActions: {
      copy: true
    },
    animation: "slide"
  }
};

// Interactive with message (hover to show)
export const WithMessage: Story = {
  render: () => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div 
        className="relative max-w-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ChatMessage
          role="assistant"
          content="Hover over this message to see the action buttons appear. This is how they look in real usage - clean and unobtrusive."
          timestamp={new Date()}
        />
        <div className="absolute top-2 right-2">
          <MessageActions
            visible={isHovered}
            onCopy={() => alert("Copied!")}
            onRetry={() => alert("Retrying...")}
            onShowDetails={() => alert("Showing details...")}
            showActions={{
              copy: true,
              retry: true,
              details: true
            }}
            animation="slide"
            size="sm"
          />
        </div>
      </div>
    );
  }
};

// User vs Assistant positioning
export const PositioningDemo: Story = {
  render: () => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    
    return (
      <div className="space-y-4 max-w-3xl">
        <div 
          className="relative"
          onMouseEnter={() => setHoveredId("user")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <ChatMessage
            role="user"
            content="User messages have actions on the left side"
            timestamp={new Date()}
          />
          <div className="absolute top-2 left-2">
            <MessageActions
              visible={hoveredId === "user"}
              onCopy={() => alert("Copied!")}
              onEdit={() => alert("Edit")}
              onDelete={() => alert("Delete")}
              showActions={{
                copy: true,
                edit: true,
                delete: true
              }}
              animation="slide"
              size="sm"
            />
          </div>
        </div>
        
        <div 
          className="relative"
          onMouseEnter={() => setHoveredId("assistant")}
          onMouseLeave={() => setHoveredId(null)}
        >
          <ChatMessage
            role="assistant"
            content="Assistant messages have actions on the right side"
            timestamp={new Date()}
          />
          <div className="absolute top-2 right-2">
            <MessageActions
              visible={hoveredId === "assistant"}
              onCopy={() => alert("Copied!")}
              onRetry={() => alert("Retry")}
              onShowDetails={() => alert("Details")}
              showActions={{
                copy: true,
                retry: true,
                details: true
              }}
              animation="slide"
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  }
};

// All action types
export const AllActions: Story = {
  args: {
    visible: true,
    showActions: {
      copy: true,
      retry: true,
      feedback: true,
      details: true,
      share: true,
      edit: true,
      delete: true,
      flag: true,
      more: true
    },
    animation: "slide"
  }
};