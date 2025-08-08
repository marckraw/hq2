/**
 * Chat Models & Agents Hooks
 *
 * Custom hooks for model and agent selection following official Jotai patterns.
 * Provides clean API for components to interact with model/agent state.
 */

import { useAtomValue, useSetAtom } from "jotai";
import {
  // Read-only atoms
  selectedModelAtom,
  agentsAtom,
  isLoadingAgentsAtom,
  agentTypeAtom,
  currentSelectionAtom,
  currentModelPerformanceAtom,
  currentCapabilitiesAtom,

  // Action atoms
  setSelectedModelAtom,
  setAgentsAtom,
  setIsLoadingAgentsAtom,
  setAgentTypeAtom,
} from "../atoms/models";

// =============================================================================
// MODEL SELECTION HOOKS
// =============================================================================

export function useModelSelection() {
  const selectedModel = useAtomValue(selectedModelAtom);
  const currentSelection = useAtomValue(currentSelectionAtom);
  const currentModelPerformance = useAtomValue(currentModelPerformanceAtom);
  const currentCapabilities = useAtomValue(currentCapabilitiesAtom);
  const setSelectedModel = useSetAtom(setSelectedModelAtom);

  return {
    selectedModel,
    currentSelection,
    currentModelPerformance,
    currentCapabilities,
    setSelectedModel,
  };
}

// =============================================================================
// AGENT HOOKS
// =============================================================================

export function useAgents() {
  const agents = useAtomValue(agentsAtom);
  const isLoadingAgents = useAtomValue(isLoadingAgentsAtom);
  const agentType = useAtomValue(agentTypeAtom);
  const setAgents = useSetAtom(setAgentsAtom);
  const setIsLoadingAgents = useSetAtom(setIsLoadingAgentsAtom);
  const setAgentType = useSetAtom(setAgentTypeAtom);

  return {
    agents,
    isLoadingAgents,
    agentType,
    setAgents,
    setIsLoadingAgents,
    setAgentType,
  };
}

// =============================================================================
// CURRENT SELECTION HOOK (Combined model/agent state)
// =============================================================================

export function useCurrentSelection() {
  const currentSelection = useAtomValue(currentSelectionAtom);
  const currentModelPerformance = useAtomValue(currentModelPerformanceAtom);
  const currentCapabilities = useAtomValue(currentCapabilitiesAtom);
  const selectedModel = useAtomValue(selectedModelAtom);
  const agentType = useAtomValue(agentTypeAtom);
  const setSelectedModel = useSetAtom(setSelectedModelAtom);
  const setAgentType = useSetAtom(setAgentTypeAtom);

  return {
    currentSelection,
    currentModelPerformance,
    currentCapabilities,
    selectedModel,
    agentType,
    setSelectedModel,
    setAgentType,

    // Convenience computed properties
    hasSelection: currentSelection !== null,
    isAgent: currentSelection?.type === "agent",
    isModel: currentSelection?.type === "model",
    selectionName: currentSelection?.item?.name ?? "No selection",
    selectionDescription: currentSelection?.item?.description ?? "",
  };
}
