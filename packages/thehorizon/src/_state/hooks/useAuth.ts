/**
 * Authentication Hooks
 *
 * Custom hooks for authentication state management.
 * Following official Jotai custom hooks pattern.
 */

import { useAtomValue, useSetAtom } from "jotai";
import {
  currentUserAtom,
  isAuthenticatedAtom,
  setCurrentUserAtom,
  logoutAtom,
} from "../atoms/auth";

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const currentUser = useAtomValue(currentUserAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const setCurrentUser = useSetAtom(setCurrentUserAtom);
  const logout = useSetAtom(logoutAtom);

  return {
    // State
    currentUser,
    isAuthenticated,

    // Actions
    setCurrentUser,
    logout,
  };
}

/**
 * Hook for read-only authentication state
 */
export function useAuthState() {
  const currentUser = useAtomValue(currentUserAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  return {
    currentUser,
    isAuthenticated,
  };
}

/**
 * Hook for authentication actions only
 */
export function useAuthActions() {
  const setCurrentUser = useSetAtom(setCurrentUserAtom);
  const logout = useSetAtom(logoutAtom);

  return {
    setCurrentUser,
    logout,
  };
}
