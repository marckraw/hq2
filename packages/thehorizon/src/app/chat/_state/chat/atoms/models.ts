/**
 * Chat Models & Agents Atoms
 *
 * State for AI model and agent selection within the chat domain.
 * Separated from core chat state as these could potentially be shared
 * across different features in the future.
 */

import { atom } from "jotai";
import { MODELS } from "@/app/chat/_components/ChatArea.utils";

interface Agent {
  id: string;
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  icon: string;
  version?: string;
  author?: string;
}

// =============================================================================
// PRIVATE BASE ATOMS
// =============================================================================

const _selectedModelAtom = atom<string>("gpt-4.1-2025-04-14");
const _agentsAtom = atom<Agent[]>([]);
const _isLoadingAgentsAtom = atom(false);
const _agentTypeAtom = atom<string>("chat");

// =============================================================================
// PUBLIC READ-ONLY ATOMS
// =============================================================================

export const selectedModelAtom = atom((get) => get(_selectedModelAtom));
export const agentsAtom = atom((get) => get(_agentsAtom));
export const isLoadingAgentsAtom = atom((get) => get(_isLoadingAgentsAtom));
export const agentTypeAtom = atom((get) => get(_agentTypeAtom));

// =============================================================================
// DERIVED ATOMS (Computed state)
// =============================================================================

export const currentSelectionAtom = atom((get) => {
  const selectedModel = get(_selectedModelAtom);
  const agents = get(_agentsAtom);
  const agentType = get(_agentTypeAtom);

  // First check if we have a selected agent
  const agent = agents.find((a) => a.type === agentType);
  if (agent) {
    return { type: "agent" as const, item: agent };
  }

  // If agentType is "chat", look for the selected model in MODELS array
  if (agentType === "chat") {
    const model = MODELS.find((m) => m.id === selectedModel);
    if (model) {
      return { type: "model" as const, item: model };
    }

    // Fallback to default model if selected model not found
    const defaultModel = MODELS.find((m) => m.id === "gpt-4.1-2025-04-14");
    if (defaultModel) {
      return { type: "model" as const, item: defaultModel };
    }
  }

  return null;
});

export const currentModelPerformanceAtom = atom((get) => {
  const selection = get(currentSelectionAtom);

  if (selection?.type === "model") {
    return {
      speed: selection.item.speed,
      intelligence: selection.item.intelligence,
      name: selection.item.name,
      description: selection.item.description,
    };
  }

  return null;
});

export const currentCapabilitiesAtom = atom((get) => {
  const selection = get(currentSelectionAtom);

  if (selection?.type === "agent") {
    return {
      hasCapabilities: true,
      capabilities: selection.item.capabilities,
      isAgent: true,
    };
  }

  if (selection?.type === "model") {
    const isReasoningModel =
      selection.item.id.includes("o3") || selection.item.id.includes("o4");
    const isGPT4 = selection.item.id.includes("gpt-4");

    return {
      hasCapabilities: true,
      capabilities: [
        "text_generation",
        "conversation",
        ...(isReasoningModel
          ? ["advanced_reasoning", "complex_problem_solving"]
          : []),
        ...(isGPT4 ? ["code_generation", "analysis"] : []),
      ],
      isAgent: false,
    };
  }

  return { hasCapabilities: false, capabilities: [], isAgent: false };
});

// =============================================================================
// ACTION ATOMS
// =============================================================================

export const setSelectedModelAtom = atom(null, (_get, set, modelId: string) => {
  set(_selectedModelAtom, modelId);
});

export const setAgentsAtom = atom(null, (_get, set, agents: Agent[]) => {
  set(_agentsAtom, agents);
});

export const setIsLoadingAgentsAtom = atom(
  null,
  (_get, set, loading: boolean) => {
    set(_isLoadingAgentsAtom, loading);
  }
);

export const setAgentTypeAtom = atom(null, (_get, set, type: string) => {
  set(_agentTypeAtom, type);
});
