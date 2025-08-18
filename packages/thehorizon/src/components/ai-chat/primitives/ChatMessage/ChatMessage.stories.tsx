import type { Meta, StoryObj } from "@storybook/react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { DEFAULT_AGENTS } from "@/components/ai-chat/ui/AgentAvatar";

const meta = {
  title: "AI Chat/Primitives/ChatMessage",
  component: ChatMessage,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    role: {
      control: { type: "select" },
      options: ["user", "assistant", "system"],
    },
    status: {
      control: { type: "select" },
      options: [undefined, "sending", "sent", "error"],
    },
    align: {
      control: { type: "select" },
      options: [undefined, "left", "right", "center"],
    },
    showAvatar: {
      control: { type: "boolean" },
    },
    isHighlighted: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic message examples
export const UserMessage: Story = {
  args: {
    role: "user",
    content: "Can you help me understand how React hooks work?",
    timestamp: new Date(),
    showAvatar: true,
  },
};

export const AssistantMessage: Story = {
  args: {
    role: "assistant",
    content: "Of course! React hooks are functions that let you use state and other React features in functional components. The most common ones are useState for managing state and useEffect for side effects.",
    timestamp: new Date(),
    showAvatar: true,
  },
};

export const SystemMessage: Story = {
  args: {
    role: "system",
    content: "This conversation has been saved to your history.",
    timestamp: new Date(),
    showAvatar: true,
  },
};

// Status variations
export const SendingMessage: Story = {
  args: {
    role: "user",
    content: "Sending this message...",
    status: "sending",
    timestamp: new Date(),
  },
};

export const ErrorMessage: Story = {
  args: {
    role: "user",
    content: "This message failed to send",
    status: "error",
    timestamp: new Date(),
  },
};

// With custom avatar
export const WithCustomAvatar: Story = {
  args: {
    role: "assistant",
    content: "I'm using a custom avatar image!",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=assistant",
    timestamp: new Date(),
  },
};

// Long message with code
export const LongMessageWithCode: Story = {
  args: {
    role: "assistant",
    content: `Here's a comprehensive example of using React hooks:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function ExampleComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
    
    return () => {
      // Cleanup function
      document.title = 'React App';
    };
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

This example demonstrates:
1. **useState**: Managing local component state
2. **useEffect**: Performing side effects and cleanup
3. **Dependencies array**: Re-running effects when values change`,
    timestamp: new Date(),
  },
};

// With action buttons
export const WithActions: Story = {
  args: {
    role: "assistant",
    content: "This message has action buttons that appear on hover.",
    timestamp: new Date(),
    actions: (
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" className="h-6 w-6">
          <Copy className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6">
          <RotateCcw className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6">
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6">
          <ThumbsDown className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
};

// Highlighted message
export const HighlightedMessage: Story = {
  args: {
    role: "assistant",
    content: "This message is highlighted to draw attention.",
    isHighlighted: true,
    timestamp: new Date(),
  },
};

// Without avatar
export const NoAvatar: Story = {
  args: {
    role: "assistant",
    content: "This message doesn't show an avatar.",
    showAvatar: false,
    timestamp: new Date(),
  },
};

// Center aligned (for system messages)
export const CenterAligned: Story = {
  args: {
    role: "system",
    content: "New session started",
    align: "center",
    showAvatar: false,
  },
};

// Conversation flow example
export const ConversationFlow: Story = {
  render: () => (
    <div className="space-y-4 max-w-3xl mx-auto">
      <ChatMessage
        role="user"
        content="What's the weather like today?"
        timestamp={new Date(Date.now() - 5 * 60000)}
      />
      <ChatMessage
        role="assistant"
        content="I don't have access to real-time weather data, but I can help you find weather information. You might want to check weather.com or your local weather app for current conditions in your area."
        timestamp={new Date(Date.now() - 4 * 60000)}
        actions={
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <ThumbsUp className="h-3 w-3" />
            </Button>
          </div>
        }
      />
      <ChatMessage
        role="user"
        content="Can you recommend any good weather apps?"
        timestamp={new Date(Date.now() - 3 * 60000)}
      />
      <ChatMessage
        role="assistant"
        content="Sure! Here are some popular weather apps:

• **Weather.com** - Comprehensive with radar maps
• **Dark Sky** - Known for hyperlocal precipitation predictions
• **Carrot Weather** - Fun personality with accurate forecasts
• **WeatherX** - Good for detailed meteorological data

Each has its strengths depending on what level of detail you need."
        timestamp={new Date(Date.now() - 2 * 60000)}
        actions={
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <ThumbsUp className="h-3 w-3" />
            </Button>
          </div>
        }
      />
      <ChatMessage
        role="system"
        content="AI model updated to latest version"
        align="center"
        showAvatar={false}
      />
      <ChatMessage
        role="user"
        content="Thanks for the recommendations!"
        timestamp={new Date(Date.now() - 1 * 60000)}
      />
      <ChatMessage
        role="assistant"
        content="You're welcome! Let me know if you need any other recommendations or have questions about weather apps."
        timestamp={new Date()}
        isHighlighted={true}
        actions={
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <ThumbsUp className="h-3 w-3" />
            </Button>
          </div>
        }
      />
    </div>
  ),
};

// Agent-specific messages
export const ChronosMessage: Story = {
  args: {
    role: "assistant",
    content: "I've scheduled your meeting for tomorrow at 2 PM. I'll send you a reminder 15 minutes before.",
    agent: DEFAULT_AGENTS.chronos,
    timestamp: new Date(),
    showAgentBadge: true,
    thinkingTime: 1250,
  },
};

export const ValkyrieMessage: Story = {
  args: {
    role: "assistant",
    content: `I've analyzed your code and found a few optimizations:

\`\`\`javascript
// Optimized version
const processData = (items) => {
  return items
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
};
\`\`\`

This reduces the complexity from O(n²) to O(n).`,
    agent: DEFAULT_AGENTS.valkyrie,
    timestamp: new Date(),
    showAgentBadge: true,
    thinkingTime: 3420,
  },
};

export const OdinMessage: Story = {
  args: {
    role: "assistant",
    content: "Based on the system architecture, I recommend implementing a microservices pattern with event-driven communication. This will provide better scalability and maintainability for your growing application.",
    agent: DEFAULT_AGENTS.odin,
    timestamp: new Date(),
    showAgentBadge: true,
    thinkingTime: 2100,
  },
};

// Multi-agent conversation
export const MultiAgentConversation: Story = {
  render: () => (
    <div className="space-y-4 max-w-3xl mx-auto">
      <ChatMessage
        role="user"
        content="I need help planning and implementing a new feature for user authentication"
        timestamp={new Date(Date.now() - 5 * 60000)}
      />
      <ChatMessage
        role="assistant"
        agent={DEFAULT_AGENTS.odin}
        content="I'll help you architect this authentication system. Based on best practices, I recommend implementing JWT-based authentication with refresh tokens. Let me outline the architecture..."
        timestamp={new Date(Date.now() - 4 * 60000)}
        showAgentBadge={true}
        thinkingTime={2300}
        actions={
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        }
      />
      <ChatMessage
        role="assistant"
        agent={DEFAULT_AGENTS.valkyrie}
        content={`I'll implement the authentication logic. Here's the code structure:

\`\`\`typescript
interface AuthService {
  login(credentials: Credentials): Promise<AuthTokens>;
  refresh(token: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  validateToken(token: string): Promise<boolean>;
}
\`\`\`

Let me create the implementation...`}
        timestamp={new Date(Date.now() - 3 * 60000)}
        showAgentBadge={true}
        thinkingTime={1800}
      />
      <ChatMessage
        role="assistant"
        agent={DEFAULT_AGENTS.heimdall}
        content="I'll set up monitoring for the authentication system. I'll track login attempts, failed authentications, and token refresh patterns to ensure security."
        timestamp={new Date(Date.now() - 2 * 60000)}
        showAgentBadge={true}
        thinkingTime={1500}
      />
      <ChatMessage
        role="user"
        content="Perfect! Can you also add email notifications for suspicious login attempts?"
        timestamp={new Date(Date.now() - 1 * 60000)}
      />
      <ChatMessage
        role="assistant"
        agent={DEFAULT_AGENTS.hermes}
        content="I'll handle the email notifications. I'll set up templates for suspicious login alerts and integrate with your email service. Users will receive instant notifications for any unusual activity."
        timestamp={new Date()}
        showAgentBadge={true}
        thinkingTime={950}
        isHighlighted={true}
      />
    </div>
  ),
};

// Agent without badge
export const AgentNoBadge: Story = {
  args: {
    role: "assistant",
    content: "This message has an agent avatar but no badge label.",
    agent: DEFAULT_AGENTS.general,
    showAgentBadge: false,
    timestamp: new Date(),
  },
};

// Playground for testing all props
export const Playground: Story = {
  args: {
    role: "assistant",
    content: "This is a playground message. Try changing the props!",
    timestamp: new Date(),
    showAvatar: true,
    isHighlighted: false,
    status: undefined,
    align: undefined,
    agent: DEFAULT_AGENTS.general,
    showAgentBadge: false,
    thinkingTime: 1500,
  },
};