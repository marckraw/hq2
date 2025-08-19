import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { 
  HoverCard,
  RevealPanel,
  RevealDrawer,
  MessageActions,
  QuickActions,
  CollapsibleSection,
  AccordionGroup,
  ExpandButton
} from "./index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "../primitives/ChatMessage";
import { DEFAULT_AGENTS } from "../ui/AgentAvatar";
import { AnimatedText } from "../animations";
import { Badge } from "@/components/ui/badge";
import { Info, Settings, Code, Database, Cloud } from "lucide-react";

const meta = {
  title: "AI Chat/B. Core ⭐/Disclosure/Overview",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "**SUPER IMPORTANT** - Progressive disclosure components. These are the elegant interaction patterns for revealing information on demand."
      }
    }
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// HoverCard Examples
export const HoverCards: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Hover Cards</h3>
        <div className="flex gap-4">
          <HoverCard
            content={
              <div className="p-2">
                <p className="text-sm font-medium">Top Position</p>
                <p className="text-xs text-muted-foreground">This appears above</p>
              </div>
            }
            side="top"
          >
            <Button variant="outline">Hover me (top)</Button>
          </HoverCard>

          <HoverCard
            content={
              <div className="p-2">
                <p className="text-sm font-medium">Bottom Position</p>
                <p className="text-xs text-muted-foreground">This appears below</p>
              </div>
            }
            side="bottom"
          >
            <Button variant="outline">Hover me (bottom)</Button>
          </HoverCard>

          <HoverCard
            content={
              <div className="p-2">
                <p className="text-sm font-medium">Right Position</p>
                <p className="text-xs text-muted-foreground">This appears to the right</p>
              </div>
            }
            side="right"
          >
            <Button variant="outline">Hover me (right)</Button>
          </HoverCard>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Rich Content Hover Cards</h3>
        <div className="flex gap-4">
          <HoverCard
            content={
              <div className="p-3 space-y-2 w-64">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="font-medium">Agent Information</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This agent specializes in code analysis and optimization.
                  It can review your code, suggest improvements, and help with debugging.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Code Review</Badge>
                  <Badge variant="secondary">Optimization</Badge>
                </div>
              </div>
            }
            side="bottom"
            openDelay={100}
          >
            <Badge variant="outline" className="cursor-help">
              <Info className="h-3 w-3 mr-1" />
              Agent Details
            </Badge>
          </HoverCard>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Viewport Boundary Detection</h3>
        <p className="text-sm text-muted-foreground">
          These hover cards automatically adjust position when near viewport edges. Try hovering on buttons near the edges.
        </p>
        
        {/* Corners demonstration */}
        <div className="relative min-h-[200px] border-2 border-dashed border-muted-foreground/20 rounded-lg">
          {/* Top Left Corner */}
          <div className="absolute top-2 left-2">
            <HoverCard
              content={
                <div className="p-3 w-48">
                  <p className="text-sm font-medium">Smart Positioning</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This card wanted to appear on top, but there's no room, so it flipped to bottom.
                  </p>
                </div>
              }
              side="top"
              autoFlip={true}
            >
              <Button size="sm" variant="outline">Top Left Corner</Button>
            </HoverCard>
          </div>

          {/* Top Right Corner */}
          <div className="absolute top-2 right-2">
            <HoverCard
              content={
                <div className="p-3 w-48">
                  <p className="text-sm font-medium">Auto-Adjusted</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This card adjusts to stay within viewport boundaries.
                  </p>
                </div>
              }
              side="right"
              autoFlip={true}
            >
              <Button size="sm" variant="outline">Top Right Corner</Button>
            </HoverCard>
          </div>

          {/* Bottom Left Corner */}
          <div className="absolute bottom-2 left-2">
            <HoverCard
              content={
                <div className="p-3 w-48">
                  <p className="text-sm font-medium">Boundary Aware</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Position flips when there's insufficient space below.
                  </p>
                </div>
              }
              side="bottom"
              autoFlip={true}
            >
              <Button size="sm" variant="outline">Bottom Left Corner</Button>
            </HoverCard>
          </div>

          {/* Bottom Right Corner */}
          <div className="absolute bottom-2 right-2">
            <HoverCard
              content={
                <div className="p-3 w-48">
                  <p className="text-sm font-medium">Intelligent Placement</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically finds the best position that fits.
                  </p>
                </div>
              }
              side="right"
              autoFlip={true}
            >
              <Button size="sm" variant="outline">Bottom Right Corner</Button>
            </HoverCard>
          </div>

          {/* Center for comparison */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <HoverCard
              content={
                <div className="p-3 w-48">
                  <p className="text-sm font-medium">Center Position</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plenty of space here, so position follows preference.
                  </p>
                </div>
              }
              side="top"
            >
              <Button variant="outline">Center (Normal)</Button>
            </HoverCard>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Manual vs Auto Positioning</h3>
        <div className="flex gap-4">
          <HoverCard
            content={
              <div className="p-2 w-40">
                <p className="text-sm font-medium">Auto-Flip Enabled</p>
                <p className="text-xs text-muted-foreground">Will adjust position</p>
              </div>
            }
            side="top"
            autoFlip={true}
          >
            <Button variant="outline" size="sm">Auto Flip ON</Button>
          </HoverCard>

          <HoverCard
            content={
              <div className="p-2 w-40">
                <p className="text-sm font-medium">Auto-Flip Disabled</p>
                <p className="text-xs text-muted-foreground">Stays in place</p>
              </div>
            }
            side="top"
            autoFlip={false}
          >
            <Button variant="outline" size="sm">Auto Flip OFF</Button>
          </HoverCard>
        </div>
      </div>
    </div>
  ),
};

// RevealPanel Examples
export const RevealPanels: Story = {
  render: () => {
    const [rightPanel, setRightPanel] = useState(false);
    const [leftPanel, setLeftPanel] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMinimized, setDrawerMinimized] = useState(false);

    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reveal Panels</h3>
          <div className="flex gap-4">
            <Button onClick={() => setRightPanel(true)}>
              Open Right Panel
            </Button>
            <Button onClick={() => setLeftPanel(true)}>
              Open Left Panel
            </Button>
            <Button onClick={() => setDrawerOpen(true)}>
              Open Drawer (can minimize)
            </Button>
          </div>
        </div>

        <RevealPanel
          isOpen={rightPanel}
          onClose={() => setRightPanel(false)}
          title="Agent Thinking Process"
          side="right"
          width="md"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Analysis Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Understanding user intent</li>
                <li>Searching relevant knowledge</li>
                <li>Formulating response</li>
                <li>Checking for accuracy</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tools Used</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Code Analysis</Badge>
                <Badge>Memory Search</Badge>
                <Badge>Documentation</Badge>
              </div>
            </div>
          </div>
        </RevealPanel>

        <RevealPanel
          isOpen={leftPanel}
          onClose={() => setLeftPanel(false)}
          title="Conversation History"
          side="left"
          width="sm"
        >
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3">
                <p className="text-sm">Previous message {i}</p>
                <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
              </Card>
            ))}
          </div>
        </RevealPanel>

        <RevealDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          isMinimized={drawerMinimized}
          onMinimizeChange={setDrawerMinimized}
          title="Orchestration Details"
          side="right"
          width="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This drawer can be minimized to save space while keeping it accessible.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-3">
                  <p className="text-sm font-medium">Agent {i} Output</p>
                  <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                </Card>
              ))}
            </div>
          </div>
        </RevealDrawer>
      </div>
    );
  },
};

// MessageActions Examples
export const MessageActionExamples: Story = {
  render: () => {
    const [hover1, setHover1] = useState(false);
    const [hover2, setHover2] = useState(false);
    const [quickActions, setQuickActions] = useState(false);

    return (
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Message with Hover Actions</h3>
          
          <div 
            className="relative"
            onMouseEnter={() => setHover1(true)}
            onMouseLeave={() => setHover1(false)}
          >
            <ChatMessage
              role="assistant"
              agent={DEFAULT_AGENTS.valkyrie}
              content="Hover over this message to see action buttons appear."
              timestamp={new Date()}
            />
            <div className="absolute top-2 right-2">
              <MessageActions
                visible={hover1}
                onCopy={action("copy")}
                onRetry={action("retry")}
                onShowDetails={action("show-details")}
                showActions={{
                  copy: true,
                  retry: true,
                  details: true,
                }}
                animation="slide"
              />
            </div>
          </div>

          <div 
            className="relative"
            onMouseEnter={() => setHover2(true)}
            onMouseLeave={() => setHover2(false)}
          >
            <ChatMessage
              role="user"
              content="This message has different actions including feedback."
              timestamp={new Date()}
            />
            <div className="absolute top-2 left-2">
              <MessageActions
                visible={hover2}
                onCopy={action("copy")}
                onThumbsUp={action("thumbs-up")}
                onThumbsDown={action("thumbs-down")}
                onEdit={action("edit")}
                onDelete={action("delete")}
                showActions={{
                  copy: true,
                  feedback: true,
                  edit: true,
                  delete: true,
                }}
                animation="scale"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions Bar</h3>
          <div 
            className="relative inline-block"
            onMouseEnter={() => setQuickActions(true)}
            onMouseLeave={() => setQuickActions(false)}
          >
            <Button>
              Hover for quick actions
            </Button>
            <QuickActions
              visible={quickActions}
              position="top"
              actions={[
                { id: "1", label: "Copy", icon: Info, onClick: action("copy-clicked") },
                { id: "2", label: "Share", icon: Settings, onClick: action("share-clicked") },
                { id: "3", label: "Code", icon: Code, onClick: action("code-clicked") },
              ]}
            />
          </div>
        </div>
      </div>
    );
  },
};

// CollapsibleSection Examples
export const CollapsibleSections: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Collapsible Sections</h3>
          
          <CollapsibleSection
            title="Click to expand this section"
            defaultOpen={false}
          >
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                This content is revealed when you click the header.
                It can contain any React components.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title={
              <div className="flex items-center justify-between">
                <span>Section with badge</span>
              </div>
            }
            badge={<Badge variant="secondary">3 items</Badge>}
          >
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-2">
                  <p className="text-sm">Item {i}</p>
                </Card>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Accordion Group</h3>
          <AccordionGroup
            sections={[
              {
                id: "1",
                title: "Database Configuration",
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Configure your database connection settings.
                    </p>
                    <Badge variant="outline">PostgreSQL</Badge>
                  </div>
                ),
                badge: <Database className="h-4 w-4" />,
              },
              {
                id: "2",
                title: "Cloud Services",
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Set up cloud service integrations.
                    </p>
                    <Badge variant="outline">AWS</Badge>
                  </div>
                ),
                badge: <Cloud className="h-4 w-4" />,
              },
              {
                id: "3",
                title: "Development Tools",
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Configure development environment.
                    </p>
                    <Badge variant="outline">VS Code</Badge>
                  </div>
                ),
                badge: <Code className="h-4 w-4" />,
              },
            ]}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Expand Button</h3>
          <Card className="p-4">
            <p className="text-sm mb-4">
              {expanded 
                ? "This is the full content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                : "This is a preview of the content..."}
            </p>
            <ExpandButton
              expanded={expanded}
              onExpandChange={setExpanded}
              size="sm"
            />
          </Card>
        </div>
      </div>
    );
  },
};

// Integration Example
export const IntegratedExample: Story = {
  render: () => {
    const [showPanel, setShowPanel] = useState(false);
    const [hover, setHover] = useState(false);

    return (
      <div className="space-y-8 max-w-3xl">
        <h3 className="text-lg font-semibold">Complete Integration Example</h3>
        
        <div 
          className="relative"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <ChatMessage
            role="assistant"
            agent={DEFAULT_AGENTS.odin}
            content={
              <CollapsibleSection
                title="I've analyzed your architecture requirements..."
                defaultOpen={true}
                showIcon={true}
              >
                <AnimatedText
                  text="Based on your needs, I recommend implementing a microservices architecture with event-driven communication. This will provide better scalability and maintainability for your growing application."
                  type="typewriter"
                  speed={20}
                />
              </CollapsibleSection>
            }
            timestamp={new Date()}
            showAgentBadge
            thinkingTime={2100}
          />
          
          <div className="absolute top-2 right-2">
            <MessageActions
              visible={hover}
              onCopy={action("copy")}
              onShowDetails={() => setShowPanel(true)}
              showActions={{
                copy: true,
                details: true,
                feedback: true,
              }}
              animation="fade"
              onThumbsUp={action("thumbs-up")}
              onThumbsDown={action("thumbs-down")}
            />
          </div>

          <div className="absolute bottom-2 right-2">
            <HoverCard
              content={
                <div className="p-3 space-y-2 w-64">
                  <p className="text-sm font-medium">Architecture Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Agent confidence: 92%<br />
                    Tools used: 3<br />
                    Memory hits: 7
                  </p>
                </div>
              }
              side="left"
            >
              <Badge variant="outline" className="text-xs cursor-help">
                <Info className="h-3 w-3 mr-1" />
                Details
              </Badge>
            </HoverCard>
          </div>
        </div>

        <RevealPanel
          isOpen={showPanel}
          onClose={() => setShowPanel(false)}
          title="Complete Agent Analysis"
          side="right"
          width="lg"
        >
          <div className="space-y-4">
            <AccordionGroup
              sections={[
                {
                  id: "thinking",
                  title: "Thinking Process",
                  content: (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. Analyzed project requirements</p>
                      <p>2. Evaluated scalability needs</p>
                      <p>3. Considered team expertise</p>
                      <p>4. Recommended best practices</p>
                    </div>
                  ),
                },
                {
                  id: "tools",
                  title: "Tools & Resources",
                  content: (
                    <div className="flex flex-wrap gap-2">
                      <Badge>Architecture Patterns</Badge>
                      <Badge>Best Practices DB</Badge>
                      <Badge>Case Studies</Badge>
                    </div>
                  ),
                },
                {
                  id: "confidence",
                  title: "Confidence Breakdown",
                  content: (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pattern Match</span>
                        <span className="text-muted-foreground">95%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Context Relevance</span>
                        <span className="text-muted-foreground">88%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Solution Fit</span>
                        <span className="text-muted-foreground">92%</span>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </RevealPanel>
      </div>
    );
  },
};