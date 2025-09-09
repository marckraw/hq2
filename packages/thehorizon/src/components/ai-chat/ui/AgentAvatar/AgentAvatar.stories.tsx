import type { Meta, StoryObj } from "@storybook/react";
import { AgentAvatar, AgentBadge, DEFAULT_AGENTS } from "./AgentAvatar";

const meta = {
  title: "AI Chat/C. Presentational/UI/AgentAvatar",
  component: AgentAvatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof AgentAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual agent avatars
export const Chronos: Story = {
  args: {
    agent: DEFAULT_AGENTS.chronos,
    size: "md",
    showRing: false,
    animate: true,
  },
};

export const Valkyrie: Story = {
  args: {
    agent: DEFAULT_AGENTS.valkyrie,
    size: "md",
    showRing: false,
    animate: true,
  },
};

export const Odin: Story = {
  args: {
    agent: DEFAULT_AGENTS.odin,
    size: "md",
    showRing: false,
    animate: true,
  },
};

export const Heimdall: Story = {
  args: {
    agent: DEFAULT_AGENTS.heimdall,
    size: "md",
    showRing: false,
    animate: true,
  },
};

export const Hermes: Story = {
  args: {
    agent: DEFAULT_AGENTS.hermes,
    size: "md",
    showRing: false,
    animate: true,
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AgentAvatar agent={DEFAULT_AGENTS.valkyrie} size="xs" />
      <AgentAvatar agent={DEFAULT_AGENTS.valkyrie} size="sm" />
      <AgentAvatar agent={DEFAULT_AGENTS.valkyrie} size="md" />
      <AgentAvatar agent={DEFAULT_AGENTS.valkyrie} size="lg" />
    </div>
  ),
};

// With status indicators
export const WithOnlineStatus: Story = {
  args: {
    agent: DEFAULT_AGENTS.chronos,
    size: "md",
    isOnline: true,
  },
};

export const ActiveTyping: Story = {
  args: {
    agent: DEFAULT_AGENTS.valkyrie,
    size: "md",
    isActive: true,
    isOnline: true,
  },
};

// With ring
export const WithRing: Story = {
  args: {
    agent: DEFAULT_AGENTS.odin,
    size: "md",
    showRing: true,
  },
};

// All agents grid
export const AllAgents: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      {Object.values(DEFAULT_AGENTS).map((agent) => (
        <div key={agent.id} className="flex flex-col items-center gap-2">
          <AgentAvatar agent={agent} size="lg" animate />
          <span className="text-sm font-medium">{agent.name}</span>
          <span className="text-xs text-muted-foreground text-center">
            {agent.description}
          </span>
        </div>
      ))}
    </div>
  ),
};

// Agent badges
export const Badges: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {Object.values(DEFAULT_AGENTS).map((agent) => (
          <AgentBadge key={agent.id} agent={agent} size="sm" />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.values(DEFAULT_AGENTS).map((agent) => (
          <AgentBadge key={agent.id} agent={agent} size="md" />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.values(DEFAULT_AGENTS).map((agent) => (
          <AgentBadge key={agent.id} agent={agent} size="sm" showIcon={false} />
        ))}
      </div>
    </div>
  ),
};

// Interactive states
export const InteractiveStates: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar agent={DEFAULT_AGENTS.chronos} size="lg" />
        <span className="text-xs text-muted-foreground">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar agent={DEFAULT_AGENTS.valkyrie} size="lg" isOnline />
        <span className="text-xs text-muted-foreground">Online</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar agent={DEFAULT_AGENTS.odin} size="lg" isActive />
        <span className="text-xs text-muted-foreground">Typing</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar agent={DEFAULT_AGENTS.heimdall} size="lg" isOnline isActive />
        <span className="text-xs text-muted-foreground">Online & Typing</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar agent={DEFAULT_AGENTS.hermes} size="lg" showRing />
        <span className="text-xs text-muted-foreground">With Ring</span>
      </div>
    </div>
  ),
};