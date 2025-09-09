import type { Meta, StoryObj } from "@storybook/react";
import { ExecutionStep } from "./ExecutionStep";
import { Card } from "@/components/ui/card";

const meta = {
  title: "AI Chat/C. Presentational/Content/ExecutionStep",
  component: ExecutionStep,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Displays execution steps for agent workflows. Shows thinking, searching, and tool execution states."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["user_message", "thinking", "tool_execution", "tool_response", "llm_response", "memory_saved", "finished", "error"],
      description: "Type of execution step"
    },
    status: {
      control: "select",
      options: ["pending", "running", "complete", "error"],
      description: "Current status of the step"
    },
    variant: {
      control: "select",
      options: ["default", "compact", "detailed"],
      description: "Display variant"
    },
    expanded: {
      control: "boolean",
      description: "Expanded state"
    }
  }
} satisfies Meta<typeof ExecutionStep>;

export default meta;
type Story = StoryObj<typeof meta>;

// Thinking step
export const Thinking: Story = {
  args: {
    id: "1",
    type: "thinking",
    content: "Understanding your request and planning the approach",
    status: "running",
    variant: "default"
  }
};

// Tool execution step
export const ToolExecution: Story = {
  args: {
    id: "2",
    type: "tool_execution",
    content: "Running code formatter",
    status: "complete",
    duration: 450,
    metadata: {
      tool: "prettier",
      filesModified: 12
    },
    variant: "default"
  }
};

// Tool response step
export const ToolResponse: Story = {
  args: {
    id: "3",
    type: "tool_response",
    content: "Processing tool response",
    status: "complete",
    duration: 200,
    variant: "default"
  }
};

// LLM response step
export const LLMResponse: Story = {
  args: {
    id: "4",
    type: "llm_response",
    content: "Generating response from language model",
    status: "complete",
    duration: 2100,
    metadata: {
      confidence: 0.92,
      tokens: 512
    },
    variant: "default"
  }
};

// Memory saved step
export const MemorySaved: Story = {
  args: {
    id: "5",
    type: "memory_saved",
    content: "Saving conversation to memory",
    status: "complete",
    duration: 350,
    metadata: {
      memoryType: "long-term",
      confidence: 0.95
    },
    variant: "default"
  }
};

// Finished step
export const Finished: Story = {
  args: {
    id: "6",
    type: "finished",
    content: "Task completed successfully",
    status: "complete",
    duration: 5400,
    variant: "default"
  }
};

// Error type
export const ErrorType: Story = {
  args: {
    id: "7",
    type: "error",
    content: "Failed to connect to database",
    status: "error",
    metadata: {
      error: "Connection timeout after 30 seconds"
    },
    variant: "default"
  }
};

// Pending state
export const Pending: Story = {
  args: {
    id: "8",
    type: "thinking",
    content: "Waiting to process request",
    status: "pending",
    variant: "default"
  }
};

// Compact variant
export const CompactVariant: Story = {
  args: {
    id: "9",
    type: "thinking",
    content: "Processing...",
    status: "running",
    variant: "compact"
  }
};

// Detailed variant with expansion
export const DetailedVariant: Story = {
  args: {
    id: "10",
    type: "llm_response",
    content: "Deep analysis of codebase",
    status: "complete",
    duration: 3200,
    expanded: true,
    metadata: {
      files: 145,
      issues: 3,
      suggestions: 12,
      confidence: 0.88
    },
    variant: "detailed"
  }
};

// Workflow sequence
export const WorkflowSequence: Story = {
  render: () => (
    <Card className="p-4 space-y-2 max-w-2xl">
      <h3 className="text-sm font-medium mb-3">Execution Timeline</h3>
      
      <ExecutionStep
        id="1"
        type="thinking"
        content="Understanding your request"
        status="complete"
        duration={800}
      />
      
      <ExecutionStep
        id="2"
        type="tool_execution"
        content="Searching for relevant information"
        status="complete"
        duration={1200}
        metadata={{ tool: "search", matches: 24 }}
      />
      
      <ExecutionStep
        id="3"
        type="llm_response"
        content="Analyzing search results"
        status="complete"
        duration={900}
      />
      
      <ExecutionStep
        id="4"
        type="memory_saved"
        content="Saving to memory"
        status="running"
      />
      
      <ExecutionStep
        id="5"
        type="finished"
        content="Ready to deliver response"
        status="pending"
      />
    </Card>
  )
};