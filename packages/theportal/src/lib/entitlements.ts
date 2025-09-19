import type { Session } from "next-auth";
import type { AgentType } from "@/services/agents.service";

// Email-based entitlements
// NEXT_PUBLIC_AGENT_SUPERUSERS: comma-separated emails with access to all agents
const SUPERUSER_EMAILS: string[] = (process.env.NEXT_PUBLIC_AGENT_SUPERUSERS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// NEXT_PUBLIC_AGENT_ALLOWLIST: JSON string mapping email -> array of agent ids (or ["*"])
// Example: {"marckraw@icloud.com":["*"],"other@example.com":["general","health-coach"]}
function parseAllowlist(): Record<string, AgentType[]> {
  try {
    const raw = process.env.NEXT_PUBLIC_AGENT_ALLOWLIST || "";
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, AgentType[]>;
    const normalized: Record<string, AgentType[]> = {};
    for (const [email, agents] of Object.entries(obj)) {
      normalized[email.toLowerCase()] = agents;
    }
    return normalized;
  } catch {
    return {};
  }
}

const EMAIL_ALLOWLIST = parseAllowlist();

function getEmail(session: Session | null | undefined): string | null {
  const email = session?.user?.email || null;
  return email ? email.toLowerCase() : null;
}

export function getAllowedAgents(session: Session | null | undefined, availableAgents: AgentType[]): AgentType[] {
  const email = getEmail(session);
  const baseAgents = Array.from(new Set(["general", ...availableAgents]));
  if (!email) return ["general"];

  if (SUPERUSER_EMAILS.includes(email)) return baseAgents;

  const rule = EMAIL_ALLOWLIST[email];
  if (rule && rule.length > 0) {
    if (rule.includes("*")) return baseAgents;
    const allowed = rule.filter((t) => baseAgents.includes(t));
    return allowed.length > 0 ? Array.from(new Set(["general", ...allowed])) : ["general"];
  }

  return ["general"];
}

export function isAgentAllowed(
  session: Session | null | undefined,
  agent: AgentType,
  availableAgents: AgentType[]
): boolean {
  const allowed = getAllowedAgents(session, availableAgents);
  return allowed.includes(agent);
}

export function ensureAllowedAgent(
  session: Session | null | undefined,
  agent: AgentType,
  availableAgents: AgentType[]
): AgentType {
  return isAgentAllowed(session, agent, availableAgents) ? agent : "general";
}
