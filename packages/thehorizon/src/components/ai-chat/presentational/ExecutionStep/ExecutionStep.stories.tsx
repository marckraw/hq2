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
      options: ["thinking", "search", "fetch", "analyze", "tool_execution", "tool_response", "database", "code", "complete"],
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

// Search step
export const Search: Story = {
  args: {
    id: "2",
    type: "search",
    content: "Searching knowledge base for relevant information",
    status: "complete",
    duration: 1234,
    result: {
      sources: ["Documentation", "Stack Overflow", "GitHub"],
      matches: 42
    },
    variant: "default"
  }
};

// Fetch step
export const Fetch: Story = {
  args: {
    id: "3",
    type: "fetch",
    content: "Fetching data from external API",
    status: "running",
    variant: "default"
  }
};

// Analyze step
export const Analyze: Story = {
  args: {
    id: "4",
    type: "analyze",
    content: "Analyzing the gathered information",
    status: "complete",
    duration: 2100,
    result: {
      confidence: 0.92,
      insights: 5
    },
    variant: "default"
  }
};

// Tool execution
export const ToolExecution: Story = {
  args: {
    id: "5",
    type: "tool_execution",
    content: "Running code formatter",
    status: "complete",
    duration: 450,
    result: {
      tool: "prettier",
      filesModified: 12
    },
    variant: "default"
  }
};

// Complete step
export const Complete: Story = {
  args: {
    id: "6",
    type: "complete",
    content: "Task completed successfully",
    status: "complete",
    duration: 5400,
    variant: "default"
  }
};

// Error state
export const ErrorState: Story = {
  args: {
    id: "7",
    type: "tool_execution",
    content: "Failed to connect to database",
    status: "error",
    error: "Connection timeout after 30 seconds",
    variant: "default"
  }
};

// Pending state
export const Pending: Story = {
  args: {
    id: "8",
    type: "search",
    content: "Waiting to search documentation",
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
    type: "analyze",
    content: "Deep analysis of codebase",
    status: "complete",
    duration: 3200,
    expanded: true,
    result: {
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
        type="search"
        content="Searching for relevant information"
        status="complete"
        duration={1200}
        result={{ sources: 3, matches: 24 }}
      />
      
      <ExecutionStep
        id="3"
        type="analyze"
        content="Analyzing search results"
        status="complete"
        duration={900}
      />
      
      <ExecutionStep
        id="4"
        type="tool_execution"
        content="Generating response"
        status="running"
      />
      
      <ExecutionStep
        id="5"
        type="complete"
        content="Ready to deliver response"
        status="pending"
      />
    </Card>
  )
};