import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import {
  AgentThinking,
  ToolCall,
  AgentRouter,
  WorkflowStep,
  WorkflowGroup,
  AgentWorkflow,
} from "./index";
import type { WorkflowItem } from "./index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayCircle, RotateCcw } from "lucide-react";

const meta = {
  title: "AI Chat/D. Interactive/Workflow/Overview",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Components for displaying agent workflows, thinking states, and tool executions."
      }
    }
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual Components
export const ThinkingComponent: Story = {
  render: () => {
    const [thinking, setThinking] = useState(true);
    
    useEffect(() => {
      const timer = setTimeout(() => setThinking(false), 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="space-y-6 max-w-2xl">
        <h3 className="text-lg font-semibold">Agent Thinking Component</h3>
        
        {/* Compact version */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Compact mode:</p>
          <AgentThinking
            thinking={thinking}
            agentName="Valkyrie"
            duration={2300}
            compact={true}
          />
        </div>

        {/* Full version with thoughts */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Detailed mode with thoughts:</p>
          <AgentThinking
            thinking={false}
            agentName="Odin"
            duration={3400}
            thoughts={[
              { id: "1", content: "Analyzing user request for code optimization", duration: 800 },
              { id: "2", content: "Identifying performance bottlenecks in the codebase", duration: 1200 },
              { id: "3", content: "Generating optimization recommendations", duration: 1400 },
            ]}
            expanded={true}
            showTimestamps={true}
          />
        </div>

        <Button onClick={() => window.location.reload()}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restart Animation
        </Button>
      </div>
    );
  },
};

export const ToolCallComponent: Story = {
  render: () => {
    const [status, setStatus] = useState<"pending" | "running" | "success" | "error">("pending");

    useEffect(() => {
      const timer1 = setTimeout(() => setStatus("running"), 1000);
      const timer2 = setTimeout(() => setStatus("success"), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }, []);

    return (
      <div className="space-y-6 max-w-2xl">
        <h3 className="text-lg font-semibold">Tool Call Component</h3>

        {/* Compact versions */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Compact mode:</p>
          <ToolCall
            toolName="SearchKnowledgeBase"
            toolType="search"
            status={status}
            duration={1234}
            compact={true}
          />
          <ToolCall
            toolName="ExecuteCode"
            toolType="code"
            status="error"
            error="Syntax error on line 42"
            compact={true}
          />
        </div>

        {/* Full version with details */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Detailed mode with input/output:</p>
          <ToolCall
            toolName="GenerateCode"
            toolType="code"
            status="success"
            duration={2456}
            input={{
              language: "TypeScript",
              task: "Create a React component",
              requirements: ["Use hooks", "Include types", "Add comments"]
            }}
            output={`export const MyComponent: React.FC = () => {
  // Component implementation
  return <div>Hello World</div>;
}`}
            expanded={true}
            showRaw={false}
            timestamp={new Date()}
          />
        </div>

        {/* Error state */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Error state:</p>
          <ToolCall
            toolName="DatabaseQuery"
            toolType="database"
            status="error"
            error="Connection timeout: Unable to reach database server"
            input="SELECT * FROM users WHERE active = true"
            expanded={true}
          />
        </div>
      </div>
    );
  },
};

export const RouterComponent: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-semibold">Agent Router Component</h3>

      {/* Compact version */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Compact mode:</p>
        <AgentRouter
          fromAgent="Heimdall"
          toAgent="Valkyrie"
          decision={{
            reason: "Code implementation required",
            confidence: 92
          }}
          compact={true}
        />
      </div>

      {/* Detailed routing decision */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Detailed routing with alternatives:</p>
        <AgentRouter
          fromAgent="Chronos"
          toAgent="Odin"
          type="escalation"
          decision={{
            reason: "Complex architectural decision required that needs senior agent expertise",
            confidence: 88,
            alternatives: [
              {
                agentId: "valkyrie",
                agentName: "Valkyrie",
                reason: "Could handle implementation but not architecture",
                confidence: 65
              },
              {
                agentId: "hermes",
                agentName: "Hermes",
                reason: "Could communicate the decision but not make it",
                confidence: 45
              }
            ]
          }}
          expanded={true}
          timestamp={new Date()}
        />
      </div>

      {/* Delegation example */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Delegation:</p>
        <AgentRouter
          toAgent="Hermes"
          type="delegation"
          decision={{
            reason: "Delegating communication task to specialized agent",
            confidence: 95
          }}
        />
      </div>
    </div>
  ),
};

export const WorkflowSteps: Story = {
  render: () => (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-lg font-semibold">Workflow Steps</h3>

      {/* Sequential steps */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Sequential Workflow</h4>
        <div className="space-y-2">
          <WorkflowStep stepNumber={1} status="complete">
            <AgentThinking
              thinking={false}
              duration={1200}
              compact={true}
            />
          </WorkflowStep>
          
          <WorkflowStep stepNumber={2} status="complete">
            <ToolCall
              toolName="SearchDatabase"
              toolType="database"
              status="success"
              duration={456}
              compact={true}
            />
          </WorkflowStep>
          
          <WorkflowStep stepNumber={3} status="active">
            <AgentRouter
              toAgent="Valkyrie"
              decision={{ reason: "Implementation needed", confidence: 90 }}
              compact={true}
              status="routing"
            />
          </WorkflowStep>
          
          <WorkflowStep stepNumber={4} status="pending">
            <Card className="p-2 bg-muted/30">
              <p className="text-sm text-muted-foreground">Waiting...</p>
            </Card>
          </WorkflowStep>
        </div>
      </Card>

      {/* Parallel execution */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Parallel Execution</h4>
        <WorkflowGroup type="parallel" title="Running 3 tools simultaneously">
          <WorkflowStep status="complete" parallel>
            <ToolCall
              toolName="SearchWeb"
              toolType="web"
              status="success"
              duration={1234}
              compact={true}
            />
          </WorkflowStep>
          
          <WorkflowStep status="complete" parallel>
            <ToolCall
              toolName="QueryDatabase"
              toolType="database"
              status="success"
              duration={890}
              compact={true}
            />
          </WorkflowStep>
          
          <WorkflowStep status="active" parallel>
            <ToolCall
              toolName="AnalyzeCode"
              toolType="code"
              status="running"
              compact={true}
            />
          </WorkflowStep>
        </WorkflowGroup>
      </Card>
    </div>
  ),
};

// Complete Workflow Example
export const CompleteWorkflow: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const workflowItems: WorkflowItem[] = [
      {
        id: "think-1",
        type: "thinking",
        status: currentStep > 0 ? "complete" : currentStep === 0 ? "active" : "pending",
        data: {
          agentName: "Heimdall",
          thinking: currentStep === 0,
          duration: 2300,
          thoughts: [
            { id: "1", content: "Analyzing user request for system optimization" },
            { id: "2", content: "Identifying potential performance improvements" },
            { id: "3", content: "Planning execution strategy" },
          ]
        }
      },
      {
        id: "tools-parallel-1",
        type: "tool",
        status: currentStep > 2 ? "complete" : currentStep >= 1 && currentStep <= 2 ? "active" : "pending",
        parallel: true,
        data: {
          toolName: "AnalyzePerformance",
          toolType: "code",
          input: { metrics: ["cpu", "memory", "disk"] },
          output: "Found 3 bottlenecks",
          duration: 1500
        }
      },
      {
        id: "tools-parallel-2",
        type: "tool",
        status: currentStep > 2 ? "complete" : currentStep >= 1 && currentStep <= 2 ? "active" : "pending",
        parallel: true,
        data: {
          toolName: "SearchDocumentation",
          toolType: "search",
          input: "optimization best practices",
          output: "Found 15 relevant articles",
          duration: 890
        }
      },
      {
        id: "route-1",
        type: "routing",
        status: currentStep > 3 ? "complete" : currentStep === 3 ? "active" : "pending",
        data: {
          fromAgent: "Heimdall",
          toAgent: "Odin",
          type: "escalation",
          decision: {
            reason: "Architecture changes required for optimization",
            confidence: 85,
            alternatives: [
              { agentId: "valkyrie", agentName: "Valkyrie", reason: "Could implement but not design", confidence: 60 }
            ]
          }
        }
      },
      {
        id: "think-2",
        type: "thinking",
        status: currentStep > 4 ? "complete" : currentStep === 4 ? "active" : "pending",
        data: {
          agentName: "Odin",
          thinking: currentStep === 4,
          duration: 3100,
          thoughts: [
            { id: "1", content: "Reviewing system architecture" },
            { id: "2", content: "Designing optimization strategy" },
            { id: "3", content: "Creating implementation plan" },
          ]
        }
      },
      {
        id: "tool-3",
        type: "tool",
        status: currentStep > 5 ? "complete" : currentStep === 5 ? "active" : "pending",
        data: {
          toolName: "GenerateOptimizationPlan",
          toolType: "code",
          input: { 
            bottlenecks: ["database queries", "memory leaks", "inefficient algorithms"],
            priority: "high"
          },
          output: "Generated 12-step optimization plan",
          duration: 2100
        }
      },
      {
        id: "message-1",
        type: "message",
        status: currentStep > 6 ? "complete" : currentStep === 6 ? "active" : "pending",
        data: {
          content: "Optimization plan complete. Ready for implementation."
        }
      }
    ];

    useEffect(() => {
      if (isRunning && currentStep < workflowItems.length) {
        const timer = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 2000);
        return () => clearTimeout(timer);
      } else if (currentStep >= workflowItems.length) {
        setIsRunning(false);
      }
    }, [isRunning, currentStep, workflowItems.length]);

    const startWorkflow = () => {
      setCurrentStep(0);
      setIsRunning(true);
    };

    const resetWorkflow = () => {
      setCurrentStep(0);
      setIsRunning(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={startWorkflow} disabled={isRunning}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Workflow
          </Button>
          <Button onClick={resetWorkflow} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <AgentWorkflow
          items={workflowItems}
          currentStep={currentStep}
          isRunning={isRunning}
          isComplete={currentStep >= workflowItems.length}
          totalDuration={12345}
          title="System Optimization Workflow"
          agentName="Multi-Agent"
          autoExpandActive={true}
        />
      </div>
    );
  },
};

// Real-time Simulation
export const RealtimeSimulation: Story = {
  render: () => {
    const [items, setItems] = useState<WorkflowItem[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const simulationSteps = [
      () => ({
        id: "think-start",
        type: "thinking" as const,
        status: "active" as const,
        data: { agentName: "Chronos", thinking: true }
      }),
      () => ({
        id: "think-start",
        type: "thinking" as const,
        status: "complete" as const,
        data: { 
          agentName: "Chronos", 
          thinking: false,
          duration: 1800,
          thoughts: [
            { id: "1", content: "User needs help with React performance" }
          ]
        }
      }),
      () => ({
        id: "tool-search",
        type: "tool" as const,
        status: "active" as const,
        data: { toolName: "SearchKnowledgeBase", toolType: "search", status: "running" }
      }),
      () => ({
        id: "tool-search",
        type: "tool" as const,
        status: "complete" as const,
        data: { 
          toolName: "SearchKnowledgeBase", 
          toolType: "search",
          status: "success",
          duration: 890,
          output: "Found 5 relevant optimization techniques"
        }
      }),
      () => ({
        id: "route-to-dev",
        type: "routing" as const,
        status: "active" as const,
        data: { 
          toAgent: "Valkyrie",
          status: "routing"
        }
      }),
      () => ({
        id: "route-to-dev",
        type: "routing" as const,
        status: "complete" as const,
        data: { 
          fromAgent: "Chronos",
          toAgent: "Valkyrie",
          decision: { reason: "Implementation expertise needed", confidence: 92 }
        }
      }),
    ];

    useEffect(() => {
      if (isRunning && currentIndex < simulationSteps.length) {
        const timer = setTimeout(() => {
          const newItem = simulationSteps[currentIndex]();
          setItems(prev => {
            const existing = prev.findIndex(item => item.id === newItem.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = newItem;
              return updated;
            }
            return [...prev, newItem];
          });
          setCurrentIndex(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(timer);
      } else if (currentIndex >= simulationSteps.length) {
        setIsRunning(false);
      }
    }, [isRunning, currentIndex, simulationSteps.length]);

    const startSimulation = () => {
      setItems([]);
      setCurrentIndex(0);
      setIsRunning(true);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={startSimulation} disabled={isRunning}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Real-time Simulation
          </Button>
          <p className="text-sm text-muted-foreground">
            Watch as workflow steps appear and update in real-time
          </p>
        </div>

        <AgentWorkflow
          items={items}
          currentStep={Math.floor(currentIndex / 2)}
          isRunning={isRunning}
          isComplete={currentIndex >= simulationSteps.length}
          title="Real-time Agent Processing"
          autoExpandActive={true}
          mode="detailed"
        />
      </div>
    );
  },
};