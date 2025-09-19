import type { Session } from "next-auth";
import type { AgentType } from "@/services/agents.service";

// Optional: OIDs with full access to all agents (comma-separated OIDs)
const SUPERUSER_OIDS: string[] = (process.env.NEXT_PUBLIC_PORTAL_SUPERUSER_OIDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Optional: fine-grained allowlist per Azure OID
// Key: Azure AD OID, Value: ["*"] for all agents or specific agent type names
// Fill in with real OIDs as needed.
const AGENT_ALLOWLIST_BY_OID: Record<string, AgentType[]> = {
  // "00000000-0000-0000-0000-000000000000": ["*"],
  // "11111111-1111-1111-1111-111111111111": ["general", "sonoma"],
};

function getAzureOid(session: Session | null | undefined): string | null {
  const user = session?.user as (Session["user"] & { azureOid?: string }) | undefined;
  return (user?.azureOid as string) || (user?.id as string) || null;
}

export function getAllowedAgents(session: Session | null | undefined, availableAgents: AgentType[]): AgentType[] {
  const oid = getAzureOid(session);
  const baseAgents = Array.from(new Set(["general", ...availableAgents]));
  if (!oid) return ["general"];

  if (SUPERUSER_OIDS.includes(oid)) return baseAgents;

  const rule = AGENT_ALLOWLIST_BY_OID[oid];
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
