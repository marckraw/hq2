import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChatMessage } from "./primitives/ChatMessage/ChatMessage";
import { ChatInput } from "./primitives/ChatInput/ChatInput";
import { MessageActions } from "./disclosure/MessageActions";
import { HoverCard } from "./disclosure/HoverCard";
import { ApprovalCard } from "./approval/ApprovalCard";
import { AgentThinking } from "./workflow/AgentThinking";
import { WelcomePrompt } from "./presentational/WelcomePrompt/WelcomePrompt";
import { ChatHeader } from "./presentational/ChatHeader/ChatHeader";
import { ExecutionStep } from "./presentational/ExecutionStep/ExecutionStep";
import { ResponseMetrics } from "./presentational/ResponseMetrics/ResponseMetrics";
import { BreathingWrapper } from "./animations/BreathingWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_AGENTS } from "./ui/AgentAvatar";

const meta = {
  title: "AI Chat/A. Showcases/Complete Experience",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Complete showcase of the AI Chat system. Demonstrates how all the core components work together to create a cohesive experience."
      }
    }
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Complete chat interface
export const CompleteChatInterface: Story = {
  render: () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    
    const handleSend = (content: string) => {
      // Add user message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date()
      }]);
      
      // Simulate thinking
      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I understand your request. Let me help you with that.",
          timestamp: new Date()
        }]);
      }, 2000);
    };
    
    return (
      <div className="flex flex-col h-screen bg-background">
        <ChatHeader
          title="AI Assistant"
          subtitle="Claude 3 Opus"
          badge="Pro"
          status="online"
        />
        
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <WelcomePrompt
              title="Welcome to AI Chat"
              subtitle="How can I help you today?"
              variant="welcome"
              suggestions={[
                { id: "1", text: "Show me what you can do", category: "general" },
                { id: "2", text: "Help me with coding", category: "coding" },
                { id: "3", text: "Explain a concept", category: "education" }
              ]}
              onSuggestionClick={(s) => handleSend(s.text)}
            />
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className="relative"
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <ChatMessage
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                  />
                  <div className={`absolute top-2 ${msg.role === 'user' ? 'left-2' : 'right-2'}`}>
                    <MessageActions
                      visible={hoveredMessageId === msg.id}
                      onCopy={() => alert("Copied!")}
                      onRetry={msg.role === 'assistant' ? () => alert("Retry") : undefined}
                      showActions={{
                        copy: true,
                        retry: msg.role === 'assistant'
                      }}
                      animation="slide"
                      size="sm"
                    />
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <AgentThinking thought="Processing your request..." />
              )}
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <ChatInput
            placeholder="Type your message..."
            onSubmit={handleSend}
            showSendButton
            showAttachButton
            disabled={isThinking}
          />
        </div>
      </div>
    );
  }
};

// Approval flow demonstration
export const ApprovalFlow: Story = {
  render: () => {
    const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
    
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <ChatHeader
          title="Agent Approval Request"
          subtitle="Review required action"
          status="thinking"
        />
        
        <BreathingWrapper intensity="high" speed="slow">
          <ApprovalCard
            data={{
              id: "1",
              agent: DEFAULT_AGENTS.architect,
              title: "Deploy to Production",
              description: "The agent wants to deploy your application to the production environment with the latest changes.",
              priority: "high",
              changes: [
                {
                  type: "add",
                  path: "infrastructure/kubernetes/",
                  description: "Add Kubernetes deployment configuration"
                },
                {
                  type: "modify",
                  path: ".github/workflows/deploy.yml",
                  description: "Update CI/CD pipeline for production deployment"
                }
              ],
              estimatedDuration: 300000,
              riskLevel: "medium"
            }}
            status={approvalStatus}
            onApprove={() => setApprovalStatus("approved")}
            onReject={() => setApprovalStatus("rejected")}
            onRequestChanges={(changes) => alert(`Changes requested: ${changes}`)}
          />
        </BreathingWrapper>
        
        {approvalStatus === "approved" && (
          <Card className="p-4 bg-green-50 dark:bg-green-950">
            <p className="text-green-800 dark:text-green-200">
              ✅ Deployment approved and initiated
            </p>
          </Card>
        )}
      </div>
    );
  }
};

// Execution timeline
export const ExecutionTimeline: Story = {
  render: () => {
    const [showMetrics, setShowMetrics] = useState(false);
    
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <ChatHeader
          title="Research Assistant"
          subtitle="Analyzing your request"
          status="thinking"
        />
        
        <Card className="p-4 space-y-2">
          <h3 className="font-medium mb-3">Execution Timeline</h3>
          
          <ExecutionStep
            id="1"
            type="thinking"
            content="Understanding your requirements"
            status="complete"
            duration={1200}
          />
          
          <ExecutionStep
            id="2"
            type="search"
            content="Searching knowledge base"
            status="complete"
            duration={890}
            result={{ sources: 5, matches: 42 }}
          />
          
          <ExecutionStep
            id="3"
            type="fetch"
            content="Fetching external data"
            status="complete"
            duration={1567}
          />
          
          <ExecutionStep
            id="4"
            type="analyze"
            content="Analyzing information"
            status="running"
          />
          
          <ExecutionStep
            id="5"
            type="complete"
            content="Generating response"
            status="pending"
          />
        </Card>
        
        <Button onClick={() => setShowMetrics(!showMetrics)}>
          {showMetrics ? "Hide" : "Show"} Metrics
        </Button>
        
        {showMetrics && (
          <ResponseMetrics
            stepCount={5}
            duration={3657}
            sources={8}
            confidence={92}
            tokens={1234}
            variant="card"
          />
        )}
      </div>
    );
  }
};

// Progressive disclosure demo
export const ProgressiveDisclosure: Story = {
  render: () => {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold mb-4">Progressive Disclosure Patterns</h2>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium mb-4">Hover for Details</h3>
            <div className="flex gap-4">
              <HoverCard
                content={
                  <div className="space-y-2">
                    <p className="font-medium">Database Status</p>
                    <Badge variant="default">Connected</Badge>
                    <p className="text-sm text-muted-foreground">
                      Latency: 12ms<br/>
                      Queries: 1,234<br/>
                      Cache Hit: 89%
                    </p>
                  </div>
                }
                side="right"
              >
                <Button variant="outline">Database Info</Button>
              </HoverCard>
              
              <HoverCard
                content={
                  <div className="space-y-2">
                    <p className="font-medium">API Performance</p>
                    <div className="flex gap-2">
                      <Badge>Fast</Badge>
                      <Badge variant="secondary">Cached</Badge>
                    </div>
                    <p className="text-sm">Response time: 45ms avg</p>
                  </div>
                }
                side="right"
              >
                <Button variant="outline">API Status</Button>
              </HoverCard>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-medium mb-4">Message with Actions</h3>
            <div className="relative group">
              <ChatMessage
                role="assistant"
                content="Hover over this message to see the elegant action buttons appear. This is the recommended pattern for message interactions."
                timestamp={new Date()}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageActions
                  visible={true}
                  onCopy={() => alert("Copied!")}
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
          </Card>
        </div>
      </div>
    );
  }
};