import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  WelcomePrompt,
  ChatHeader,
  KeyboardHint,
  SidebarHintPill,
  ConversationItem,
  ConversationList,
  ExecutionStep,
  ResponseMetrics,
} from "./index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const meta = {
  title: "AI Chat/C. Presentational/Overview",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Overview of all pure presentational components. These components have no business logic and are fully controlled via props."
      }
    }
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// WelcomePrompt Stories
export const WelcomePromptDemo: Story = {
  render: () => {
    const [variant, setVariant] = useState<"welcome" | "empty" | "error" | "loading">("welcome");
    
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {(["welcome", "empty", "error", "loading"] as const).map(v => (
            <Button
              key={v}
              size="sm"
              variant={variant === v ? "default" : "outline"}
              onClick={() => setVariant(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        
        <WelcomePrompt
          variant={variant}
          onSuggestionClick={(s) => console.log("Clicked:", s)}
        />
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Compact Version</h3>
          <WelcomePrompt
            variant="welcome"
            compact
            suggestions={[
              { id: "1", text: "Quick help" },
              { id: "2", text: "Get started" },
            ]}
          />
        </Card>
      </div>
    );
  },
};

// ChatHeader Stories
export const ChatHeaderDemo: Story = {
  render: () => {
    const [status, setStatus] = useState<"online" | "offline" | "typing" | "thinking">("online");
    
    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          {(["online", "offline", "typing", "thinking"] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Default</p>
            <ChatHeader
              title="AI Assistant"
              status={status}
              onBack={() => console.log("Back")}
              actions={[
                { id: "settings", icon: () => "⚙️", label: "Settings", onClick: () => {} },
                { id: "share", icon: () => "📤", label: "Share", onClick: () => {} },
              ]}
            />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Minimal</p>
            <ChatHeader
              variant="minimal"
              status={status}
            />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Detailed</p>
            <ChatHeader
              variant="detailed"
              subtitle="3 agents working"
              status={status}
              badge="Pro"
            />
          </div>
        </div>
      </div>
    );
  },
};

// KeyboardHint Stories
export const KeyboardHintDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Inline (Default)</p>
        <KeyboardHint />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Minimal</p>
        <KeyboardHint variant="minimal" />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Card</p>
        <div className="max-w-sm">
          <KeyboardHint variant="card" />
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Compact</p>
        <KeyboardHint compact />
      </div>
    </div>
  ),
};

// SidebarHintPill Stories
export const SidebarHintPillDemo: Story = {
  render: () => {
    const [hovered, setHovered] = useState(false);
    
    return (
      <div className="relative h-96 border rounded-lg overflow-hidden">
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
          Hover over the pill to see it expand
        </p>
        
        <SidebarHintPill
          count={5}
          label="conversations"
          isHovered={hovered}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
        
        <div className="absolute bottom-4 left-4 space-y-2">
          <p className="text-sm font-medium">Variants:</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setHovered(!hovered)}>
              Toggle Hover
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

// ConversationItem Stories
export const ConversationItemDemo: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Default</p>
        <ConversationItem
          id="1"
          title="Project Discussion"
          preview="Let's talk about the new features..."
          timestamp={new Date()}
          messageCount={12}
          onSelect={() => console.log("Selected")}
          onDelete={() => console.log("Delete")}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Active & Unread</p>
        <ConversationItem
          id="2"
          title="Important Update"
          preview="There's been a change in the requirements..."
          timestamp={new Date(Date.now() - 3600000)}
          isActive
          isUnread
          messageCount={3}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Pinned</p>
        <ConversationItem
          id="3"
          title="Team Standup"
          timestamp={new Date(Date.now() - 86400000)}
          isPinned
          messageCount={45}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Compact</p>
        <ConversationItem
          id="4"
          title="Quick Question"
          variant="compact"
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Detailed</p>
        <ConversationItem
          id="5"
          title="Architecture Review"
          preview="We need to discuss the microservices approach and how it will affect our current infrastructure..."
          variant="detailed"
          timestamp={new Date(Date.now() - 172800000)}
          messageCount={28}
        />
      </div>
    </div>
  ),
};

// ConversationList Stories
export const ConversationListDemo: Story = {
  render: () => {
    const [activeId, setActiveId] = useState<number>(1);
    const [groupBy, setGroupBy] = useState<"none" | "date" | "pinned">("none");
    
    const conversations = [
      {
        id: 1,
        title: "Project Planning",
        preview: "Let's outline the next sprint...",
        timestamp: new Date(),
        messageCount: 15,
        isPinned: true,
      },
      {
        id: 2,
        title: "Bug Report",
        preview: "Found an issue with the login...",
        timestamp: new Date(Date.now() - 3600000),
        isUnread: true,
        messageCount: 3,
      },
      {
        id: 3,
        title: "Feature Request",
        preview: "Can we add dark mode?",
        timestamp: new Date(Date.now() - 86400000),
        messageCount: 8,
      },
      {
        id: 4,
        title: "Team Discussion",
        preview: "Weekly sync about progress",
        timestamp: new Date(Date.now() - 172800000),
        messageCount: 42,
      },
      {
        id: 5,
        title: "Documentation",
        preview: "Need to update the API docs",
        timestamp: new Date(Date.now() - 604800000),
        messageCount: 12,
      },
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <p className="text-sm text-muted-foreground">Group by:</p>
          {(["none", "date", "pinned"] as const).map(g => (
            <Button
              key={g}
              size="sm"
              variant={groupBy === g ? "default" : "outline"}
              onClick={() => setGroupBy(g)}
            >
              {g}
            </Button>
          ))}
        </div>
        
        <div className="border rounded-lg h-96">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => setActiveId(Number(id))}
            onDelete={(id) => console.log("Delete:", id)}
            showSearch
            groupBy={groupBy}
          />
        </div>
      </div>
    );
  },
};

// ExecutionStep Stories
export const ExecutionStepDemo: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<string[]>([]);
    
    const toggleStep = (id: string) => {
      setExpanded(prev => 
        prev.includes(id) 
          ? prev.filter(i => i !== id)
          : [...prev, id]
      );
    };
    
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Different Types & States</p>
          <div className="space-y-2">
            <ExecutionStep
              id="1"
              type="thinking"
              content="Analyzing user request"
              status="complete"
              duration={1234}
            />
            <ExecutionStep
              id="2"
              type="search"
              content="Searching knowledge base"
              status="running"
            />
            <ExecutionStep
              id="3"
              type="database"
              content="Querying user preferences"
              status="complete"
              duration={456}
            />
            <ExecutionStep
              id="4"
              type="code"
              content="Generating Python script"
              status="error"
              result="Syntax error on line 42"
            />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Expandable with Details</p>
          <div className="space-y-2">
            <ExecutionStep
              id="5"
              type="tool_execution"
              content="Running code analysis"
              status="complete"
              duration={2345}
              expanded={expanded.includes("5")}
              onToggle={() => toggleStep("5")}
              result="Found 3 potential optimizations"
              metadata={{
                tool: "eslint",
                files: 12,
                issues: 3,
              }}
            />
            <ExecutionStep
              id="6"
              type="fetch"
              content="Fetching API documentation"
              status="complete"
              duration={1567}
              expanded={expanded.includes("6")}
              onToggle={() => toggleStep("6")}
              result="Successfully retrieved 5 endpoints"
            />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Compact Variant</p>
          <div className="space-y-1">
            <ExecutionStep
              id="7"
              type="thinking"
              content="Processing..."
              variant="compact"
              status="complete"
              duration={500}
            />
            <ExecutionStep
              id="8"
              type="search"
              content="Finding matches..."
              variant="compact"
              status="complete"
              duration={230}
            />
          </div>
        </div>
      </div>
    );
  },
};

// ResponseMetrics Stories
export const ResponseMetricsDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Inline (Default)</p>
        <ResponseMetrics
          stepCount={5}
          duration={3456}
          sources={3}
          confidence={92}
          tokens={1250}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Card Variant</p>
        <div className="max-w-sm">
          <ResponseMetrics
            variant="card"
            stepCount={8}
            duration={12345}
            sources={5}
            confidence={85}
            tokens={3456}
          />
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Detailed Variant</p>
        <div className="max-w-md">
          <ResponseMetrics
            variant="detailed"
            stepCount={12}
            duration={45678}
            sources={8}
            confidence={78}
            tokens={8901}
            customMetrics={[
              { id: "cost", label: "Cost", value: "$0.042", icon: () => "💰" },
              { id: "cache", label: "Cache Hits", value: "3/5", icon: () => "💾" },
            ]}
          />
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Minimal (without icons)</p>
        <ResponseMetrics
          showIcons={false}
          stepCount={3}
          duration={1234}
          confidence={95}
        />
      </div>
    </div>
  ),
};

// Combined Example
export const CompleteConversationFlow: Story = {
  render: () => {
    const [showMetrics, setShowMetrics] = useState(true);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <ChatHeader
          title="AI Assistant"
          subtitle="Ready to help"
          status="online"
          badge="Pro"
        />
        
        <Card className="p-6">
          <WelcomePrompt
            title="Welcome back!"
            subtitle="How can I assist you today?"
            onSuggestionClick={(s) => console.log("Suggestion:", s)}
          />
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-3">Research Process</h3>
          <div className="space-y-2">
            <ExecutionStep
              id="1"
              type="thinking"
              content="Understanding your request"
              status="complete"
              duration={1200}
            />
            <ExecutionStep
              id="2"
              type="search"
              content="Searching knowledge base"
              status="complete"
              duration={890}
            />
            <ExecutionStep
              id="3"
              type="tool_execution"
              content="Generating response"
              status="complete"
              duration={2100}
            />
          </div>
          
          {showMetrics && (
            <div className="mt-4 pt-4 border-t">
              <ResponseMetrics
                stepCount={3}
                duration={4190}
                sources={2}
                confidence={88}
                tokens={450}
              />
            </div>
          )}
        </Card>
        
        <div className="flex justify-center">
          <Button onClick={() => setShowMetrics(!showMetrics)}>
            Toggle Metrics
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <KeyboardHint variant="minimal" />
        </div>
      </div>
    );
  },
};