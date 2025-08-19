import type { Meta, StoryObj } from "@storybook/react";
import { ChatInput } from "./ChatInput";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain } from "lucide-react";
import { AgentBadge, DEFAULT_AGENTS } from "@/components/ai-chat/ui/AgentAvatar";

const meta = {
  title: "AI Chat/B. Core ⭐/Primitives/ChatInput",
  component: ChatInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "**SUPER IMPORTANT** - The primary chat input component. Feature-rich with attachments, voice, shortcuts, and more."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    showSendButton: {
      control: { type: "boolean" },
    },
    showAttachButton: {
      control: { type: "boolean" },
    },
    showVoiceButton: {
      control: { type: "boolean" },
    },
    showShortcuts: {
      control: { type: "boolean" },
    },
    showCharCount: {
      control: { type: "boolean" },
    },
    maxRows: {
      control: { type: "number", min: 1, max: 10 },
    },
    minRows: {
      control: { type: "number", min: 1, max: 5 },
    },
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic input
export const Default: Story = {
  args: {
    placeholder: "Type a message...",
    showSendButton: true,
    showShortcuts: true,
  },
};

// Controlled component example
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    const handleSubmit = (text: string) => {
      setMessages([...messages, text]);
      setValue("");
    };

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted min-h-[100px]">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">Messages will appear here...</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
        <ChatInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Type and press Enter to send..."
        />
      </div>
    );
  },
};

// With all buttons
export const WithAllButtons: Story = {
  args: {
    placeholder: "Type a message...",
    showSendButton: true,
    showAttachButton: true,
    showVoiceButton: true,
    showShortcuts: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    value: "Generating response...",
    isLoading: true,
    showSendButton: true,
  },
};

// Recording state
export const Recording: Story = {
  args: {
    placeholder: "Recording...",
    isRecording: true,
    showVoiceButton: true,
    showSendButton: false,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    placeholder: "Chat is disabled",
    disabled: true,
    showSendButton: true,
  },
};

// With character limit
export const WithCharacterLimit: Story = {
  args: {
    placeholder: "Type a message (max 100 chars)...",
    maxLength: 100,
    showCharCount: true,
    showSendButton: true,
  },
};

// Multi-line with auto-resize
export const MultiLine: Story = {
  args: {
    value: "This is a longer message that spans multiple lines.\n\nIt demonstrates how the textarea automatically resizes based on content.\n\nTry adding more lines to see it grow!",
    minRows: 2,
    maxRows: 6,
    showSendButton: true,
  },
};

// Without shortcuts hint
export const NoShortcuts: Story = {
  args: {
    placeholder: "Type a message...",
    showShortcuts: false,
    showSendButton: true,
  },
};

// With custom left addon (agent selector)
export const WithAgentSelector: Story = {
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState(DEFAULT_AGENTS.general);
    const [showAgentMenu, setShowAgentMenu] = useState(false);

    return (
      <ChatInput
        placeholder={`Ask ${selectedAgent.name}...`}
        leftAddon={
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAgentMenu(!showAgentMenu)}
              className="h-8 gap-1"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs">{selectedAgent.name}</span>
            </Button>
            {showAgentMenu && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-popover border rounded-lg shadow-lg">
                <div className="space-y-1">
                  {Object.values(DEFAULT_AGENTS).map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowAgentMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-muted text-sm"
                    >
                      <AgentBadge agent={agent} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    );
  },
};

// With custom right addon (AI suggestions)
export const WithAISuggestions: Story = {
  render: () => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    return (
      <ChatInput
        placeholder="Type or use AI suggestions..."
        rightAddon={
          <Button
            type="button"
            size="icon"
            variant={showSuggestions ? "default" : "ghost"}
            className="h-8 w-8"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Brain className="h-4 w-4" />
          </Button>
        }
      />
    );
  },
};

// Interactive example with ref control
export const WithRefControl: Story = {
  render: () => {
    const inputRef = useRef<any>(null);
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => inputRef.current?.focus()}
          >
            Focus
          </Button>
          <Button
            size="sm"
            onClick={() => inputRef.current?.blur()}
          >
            Blur
          </Button>
          <Button
            size="sm"
            onClick={() => {
              inputRef.current?.setValue("Hello from ref!");
              setValue("Hello from ref!");
            }}
          >
            Set Value
          </Button>
          <Button
            size="sm"
            onClick={() => {
              inputRef.current?.clear();
              setValue("");
            }}
          >
            Clear
          </Button>
        </div>
        <ChatInput
          ref={inputRef}
          value={value}
          onChange={setValue}
          placeholder="Use buttons above to control input..."
        />
      </div>
    );
  },
};

// Minimal version
export const Minimal: Story = {
  args: {
    placeholder: "Type a message...",
    showSendButton: false,
    showShortcuts: false,
  },
};

// Full featured playground
export const Playground: Story = {
  args: {
    placeholder: "Type a message...",
    showSendButton: true,
    showAttachButton: true,
    showVoiceButton: true,
    showShortcuts: true,
    showCharCount: true,
    maxLength: 500,
    minRows: 1,
    maxRows: 5,
    disabled: false,
    isLoading: false,
    isRecording: false,
  },
};