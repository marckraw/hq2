import type { Meta, StoryObj } from "@storybook/react";
import { WelcomePrompt } from "./WelcomePrompt";
import { Card } from "@/components/ui/card";

const meta = {
  title: "AI Chat/C. Presentational/Content/WelcomePrompt",
  component: WelcomePrompt,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A welcome prompt component that displays greeting messages and suggestions to users. Pure presentational component with no business logic."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["welcome", "empty", "error", "loading"],
      description: "Visual variant of the prompt"
    },
    compact: {
      control: "boolean",
      description: "Compact mode for smaller spaces"
    },
    showIcon: {
      control: "boolean",
      description: "Show/hide the icon"
    }
  }
} satisfies Meta<typeof WelcomePrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default welcome state
export const Welcome: Story = {
  args: {
    title: "Welcome to AI Assistant",
    subtitle: "How can I help you today?",
    variant: "welcome",
    suggestions: [
      { id: "1", text: "What can you help me with?", category: "general" },
      { id: "2", text: "Explain quantum computing", category: "education" },
      { id: "3", text: "Help me write Python code", category: "coding" },
      { id: "4", text: "Latest AI developments", category: "research" }
    ]
  }
};

// Empty state
export const Empty: Story = {
  args: {
    title: "No conversations yet",
    subtitle: "Start a new conversation to begin",
    variant: "empty"
  }
};

// Error state
export const Error: Story = {
  args: {
    title: "Something went wrong",
    subtitle: "Please try again or refresh the page",
    variant: "error"
  }
};

// Loading state
export const Loading: Story = {
  args: {
    variant: "loading"
  }
};

// Compact mode
export const Compact: Story = {
  args: {
    title: "Quick Start",
    subtitle: "Choose an option",
    variant: "welcome",
    compact: true,
    suggestions: [
      { id: "1", text: "Quick help", category: "general" },
      { id: "2", text: "Write code", category: "coding" }
    ]
  }
};

// Without icon
export const NoIcon: Story = {
  args: {
    title: "Welcome back!",
    subtitle: "Ready to continue?",
    variant: "welcome",
    showIcon: false
  }
};

// With custom icon
export const CustomIcon: Story = {
  args: {
    title: "Research Assistant",
    subtitle: "Let's explore together",
    variant: "welcome",
    icon: "🔬"
  }
};

// Interactive example
export const Interactive: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Card className="p-6">
        <WelcomePrompt
          title="Welcome to AI Assistant"
          subtitle="How can I help you today?"
          variant="welcome"
          suggestions={[
            { id: "1", text: "Analyze this code", category: "coding" },
            { id: "2", text: "Explain a concept", category: "education" },
            { id: "3", text: "Help with writing", category: "writing" },
            { id: "4", text: "General question", category: "general" }
          ]}
          onSuggestionClick={(suggestion) => {
            alert(`You clicked: ${suggestion.text}`);
          }}
        />
      </Card>
    </div>
  )
};