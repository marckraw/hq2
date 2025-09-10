import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ApprovalCard } from "./ApprovalCard/ApprovalCard";
import type { ApprovalData, ApprovalStatus } from "./ApprovalCard/ApprovalCard";
import { DEFAULT_AGENTS } from "../ui/AgentAvatar";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "../primitives/ChatMessage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const meta = {
  title: "AI Chat/B. Core ⭐/Approval/ApprovalCard",
  component: ApprovalCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**SUPER IMPORTANT** - Approval system for agent actions. Features iterative disclosure with ADHD-friendly 3s breathing animations.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ApprovalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic approval examples
const basicApproval: ApprovalData = {
  id: "1",
  title: "Deploy to Production",
  description: "The agent wants to deploy your application to production environment with the latest changes.",
  details: {
    changes: [
      "Update API endpoints to production URLs",
      "Enable production logging",
      "Set environment variables",
      "Run database migrations",
    ],
    risks: ["Potential downtime during deployment", "Database migrations are irreversible"],
  },
  metadata: {
    cost: {
      estimatedTime: "5-10 minutes",
      apiCalls: 3,
    },
    rollback: true,
  },
  confidence: 92,
};

export const BasicApproval: Story = {
  args: {
    approval: basicApproval,
    agent: DEFAULT_AGENTS.valkyrie,
    status: "pending",
    priority: "high",
    onApprove: (id) => console.log("Approved:", id),
    onReject: (id, reason) => console.log("Rejected:", id, reason),
  },
};

// Code modification approval
const codeModificationApproval: ApprovalData = {
  id: "2",
  title: "Refactor Authentication Logic",
  description: "I'll refactor the authentication system to use JWT tokens instead of sessions for better scalability.",
  details: {
    before: `// Current implementation
app.use(session({
  secret: 'session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));`,
    after: `// Proposed implementation
app.use(jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  credentialsRequired: false
}));`,
    changes: [
      "Replace express-session with jsonwebtoken",
      "Update user authentication middleware",
      "Modify login/logout endpoints",
      "Update client-side token handling",
    ],
    risks: ["All active sessions will be invalidated", "Clients need to re-authenticate"],
    alternatives: [
      {
        title: "Hybrid Approach",
        description: "Support both sessions and JWT during transition period",
        confidence: 78,
      },
      {
        title: "OAuth2 Implementation",
        description: "Use OAuth2 with refresh tokens for better security",
        confidence: 85,
      },
    ],
  },
  metadata: {
    cost: {
      tokens: 4500,
      estimatedTime: "15-20 minutes",
    },
    rollback: true,
    dependencies: ["auth-service", "user-service"],
  },
  confidence: 88,
  deadline: new Date(Date.now() + 3600000), // 1 hour from now
};

export const CodeModification: Story = {
  args: {
    approval: codeModificationApproval,
    agent: DEFAULT_AGENTS.valkyrie,
    status: "pending",
    priority: "medium",
    defaultExpanded: true,
  },
};

// Database operation approval
const databaseApproval: ApprovalData = {
  id: "3",
  title: "Database Schema Migration",
  description: "Apply schema changes to add user preferences table and indexes for better query performance.",
  details: {
    before: "Current schema: 12 tables, 47 columns",
    after: "New schema: 13 tables, 52 columns, 3 new indexes",
    changes: [
      "CREATE TABLE user_preferences",
      "ADD INDEX idx_user_email ON users(email)",
      "ADD INDEX idx_created_at ON posts(created_at)",
      "ALTER TABLE users ADD COLUMN last_login TIMESTAMP",
    ],
    risks: [
      "Migration could take 5-10 minutes on large datasets",
      "Temporary table locks during index creation",
      "Rollback requires manual intervention",
    ],
  },
  metadata: {
    cost: {
      estimatedTime: "10-15 minutes",
      apiCalls: 1,
    },
    rollback: false,
    dependencies: ["database-backup", "maintenance-mode"],
  },
  confidence: 95,
};

export const DatabaseOperation: Story = {
  args: {
    approval: databaseApproval,
    agent: DEFAULT_AGENTS.odin,
    status: "pending",
    priority: "high",
  },
};

// Multi-agent collaboration approval
const multiAgentApproval: ApprovalData = {
  id: "4",
  title: "Complete Feature Implementation",
  description: "Multiple agents will collaborate to implement the user dashboard feature.",
  details: {
    changes: [
      "Odin: Design system architecture",
      "Valkyrie: Implement backend API",
      "Chronos: Set up scheduled data updates",
      "Hermes: Create user notifications",
    ],
    risks: ["Complex coordination between agents", "Potential conflicts in implementation"],
    alternatives: [
      {
        title: "Sequential Implementation",
        description: "Agents work one at a time to avoid conflicts",
        confidence: 70,
      },
    ],
  },
  metadata: {
    cost: {
      tokens: 125000,
      estimatedTime: "45-60 minutes",
      apiCalls: 47,
    },
    rollback: true,
    dependencies: ["api-gateway", "frontend-build", "database"],
  },
  confidence: 82,
};

export const MultiAgentCollaboration: Story = {
  args: {
    approval: multiAgentApproval,
    agent: DEFAULT_AGENTS.odin,
    status: "pending",
    priority: "critical",
  },
};

// Expired approval
export const ExpiredApproval: Story = {
  args: {
    approval: {
      ...basicApproval,
      deadline: new Date(Date.now() - 3600000), // 1 hour ago
    },
    agent: DEFAULT_AGENTS.chronos,
    status: "expired",
    priority: "low",
  },
};

// Approved state
export const ApprovedState: Story = {
  args: {
    approval: basicApproval,
    agent: DEFAULT_AGENTS.heimdall,
    status: "approved",
    priority: "medium",
  },
};

// Rejected state
export const RejectedState: Story = {
  args: {
    approval: basicApproval,
    agent: DEFAULT_AGENTS.hermes,
    status: "rejected",
    priority: "high",
  },
};

// Compact variant
export const CompactVariant: Story = {
  args: {
    approval: {
      id: "5",
      title: "Quick Fix",
      description: "Fix a typo in the README file",
      confidence: 99,
    },
    variant: "compact",
    status: "pending",
    priority: "low",
    showMetadata: false,
  },
};

// Inline in chat conversation
export const InlineInConversation: Story = {
  args: {
    approval: basicApproval,
    agent: DEFAULT_AGENTS.odin,
    status: "pending",
    priority: "medium",
  },
  render: () => {
    const [approvals, setApprovals] = useState<Record<string, ApprovalStatus>>({
      "1": "pending",
      "2": "pending",
    });

    const handleApprove = (id: string) => {
      setApprovals((prev) => ({ ...prev, [id]: "approved" }));
    };

    const handleReject = (id: string) => {
      setApprovals((prev) => ({ ...prev, [id]: "rejected" }));
    };

    return (
      <div className="max-w-3xl space-y-4">
        <ChatMessage
          role="user"
          content="Can you help me optimize the database and deploy the changes?"
          timestamp={new Date(Date.now() - 5 * 60000)}
        />

        <ChatMessage
          role="assistant"
          agent={DEFAULT_AGENTS.odin}
          content="I'll help you optimize the database. First, let me analyze the current schema and propose optimizations."
          timestamp={new Date(Date.now() - 4 * 60000)}
          showAgentBadge
        />

        <div className="ml-11">
          <ApprovalCard
            approval={{
              id: "1",
              title: "Database Optimization",
              description: "Add indexes and optimize queries for better performance",
              details: {
                changes: [
                  "Add composite index on (user_id, created_at)",
                  "Optimize slow queries with EXPLAIN ANALYZE",
                  "Update statistics for query planner",
                ],
                risks: ["Brief table locks during index creation"],
              },
              metadata: {
                cost: { estimatedTime: "5 minutes" },
                rollback: true,
              },
              confidence: 94,
            }}
            agent={DEFAULT_AGENTS.odin}
            status={approvals["1"]}
            priority="medium"
            onApprove={() => handleApprove("1")}
            onReject={() => handleReject("1")}
            variant="inline"
          />
        </div>

        {approvals["1"] === "approved" && (
          <>
            <ChatMessage
              role="assistant"
              agent={DEFAULT_AGENTS.odin}
              content="Great! I've applied the database optimizations. Now let's prepare for deployment."
              timestamp={new Date(Date.now() - 3 * 60000)}
              showAgentBadge
            />

            <div className="ml-11">
              <ApprovalCard
                approval={{
                  id: "2",
                  title: "Deploy to Production",
                  description: "Deploy the optimized database configuration to production",
                  details: {
                    changes: [
                      "Apply migrations to production database",
                      "Update connection pool settings",
                      "Restart application servers",
                    ],
                  },
                  metadata: {
                    cost: { estimatedTime: "10 minutes" },
                    rollback: true,
                  },
                  confidence: 90,
                }}
                agent={DEFAULT_AGENTS.valkyrie}
                status={approvals["2"]}
                priority="high"
                onApprove={() => handleApprove("2")}
                onReject={() => handleReject("2")}
                variant="inline"
              />
            </div>
          </>
        )}

        {approvals["2"] === "approved" && (
          <ChatMessage
            role="assistant"
            agent={DEFAULT_AGENTS.valkyrie}
            content="✅ Deployment complete! The database optimizations are now live in production. Query performance has improved by approximately 40%."
            timestamp={new Date()}
            showAgentBadge
          />
        )}
      </div>
    );
  },
};

// Batch approvals
export const BatchApprovals: Story = {
  args: {
    approval: basicApproval,
    agent: DEFAULT_AGENTS.valkyrie,
    status: "pending",
    priority: "low",
  },
  render: () => {
    const [statuses, setStatuses] = useState<Record<string, ApprovalStatus>>({
      "1": "pending",
      "2": "pending",
      "3": "pending",
    });

    const approvals: ApprovalData[] = [
      {
        id: "1",
        title: "Update Dependencies",
        description: "Update npm packages to latest versions",
        confidence: 95,
      },
      {
        id: "2",
        title: "Fix Linting Errors",
        description: "Auto-fix 23 linting errors in the codebase",
        confidence: 99,
      },
      {
        id: "3",
        title: "Optimize Images",
        description: "Compress and optimize 15 images for better performance",
        confidence: 100,
      },
    ];

    const handleApprove = (id: string) => {
      setStatuses((prev) => ({ ...prev, [id]: "approved" }));
    };

    const handleReject = (id: string) => {
      setStatuses((prev) => ({ ...prev, [id]: "rejected" }));
    };

    const handleApproveAll = () => {
      const newStatuses: Record<string, ApprovalStatus> = {};
      approvals.forEach((a) => {
        if (statuses[a.id] === "pending") {
          newStatuses[a.id] = "approved";
        }
      });
      setStatuses((prev) => ({ ...prev, ...newStatuses }));
    };

    const pendingCount = Object.values(statuses).filter((s) => s === "pending").length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Batch Approvals</h3>
            <p className="text-sm text-muted-foreground">
              {pendingCount} pending approval{pendingCount !== 1 ? "s" : ""}
            </p>
          </div>
          {pendingCount > 0 && (
            <Button onClick={handleApproveAll} size="sm">
              Approve All ({pendingCount})
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {approvals.map((approval, index) => (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ApprovalCard
                  approval={approval}
                  agent={DEFAULT_AGENTS.valkyrie}
                  status={statuses[approval.id]}
                  priority="low"
                  onApprove={() => handleApprove(approval.id)}
                  onReject={() => handleReject(approval.id)}
                  variant="compact"
                  showMetadata={false}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {Object.values(statuses).every((s) => s !== "pending") && (
          <Card className="p-4 bg-green-500/5 border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-400">✅ All approvals processed successfully</p>
          </Card>
        )}
      </div>
    );
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    approval: codeModificationApproval,
    agent: DEFAULT_AGENTS.valkyrie,
    status: "pending",
    priority: "medium",
  },
  render: () => {
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
    const [variant, setVariant] = useState<"inline" | "standalone" | "compact">("inline");
    const [expanded, setExpanded] = useState(false);
    const [showMetadata, setShowMetadata] = useState(true);

    return (
      <div className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {(["low", "medium", "high", "critical"] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={priority === p ? "default" : "outline"}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Variant</label>
            <div className="flex gap-2">
              {(["inline", "standalone", "compact"] as const).map((v) => (
                <Button key={v} size="sm" variant={variant === v ? "default" : "outline"} onClick={() => setVariant(v)}>
                  {v}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Options</label>
            <div className="flex gap-2">
              <Button size="sm" variant={expanded ? "default" : "outline"} onClick={() => setExpanded(!expanded)}>
                Expanded
              </Button>
              <Button
                size="sm"
                variant={showMetadata ? "default" : "outline"}
                onClick={() => setShowMetadata(!showMetadata)}
              >
                Metadata
              </Button>
            </div>
          </div>
        </div>

        <ApprovalCard
          approval={codeModificationApproval}
          agent={DEFAULT_AGENTS.valkyrie}
          status="pending"
          priority={priority}
          variant={variant}
          defaultExpanded={expanded}
          showMetadata={showMetadata}
          onApprove={(id) => console.log("Approved:", id)}
          onReject={(id, reason) => console.log("Rejected:", id, reason)}
          onRequestChanges={(id, changes) => console.log("Changes requested:", id, changes)}
          onDefer={(id, until) => console.log("Deferred:", id, until)}
        />
      </div>
    );
  },
};
