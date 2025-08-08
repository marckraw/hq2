/**
 * Authentication Atoms
 *
 * Global authentication state for the entire application.
 * These atoms are accessible from any part of the app.
 *
 * Following official Jotai patterns with private/public atom separation.
 */

import { atom } from "jotai";

// =============================================================================
// PRIVATE BASE ATOMS
// =============================================================================

const _currentUserAtom = atom<any | null>(null);

// =============================================================================
// PUBLIC READ-ONLY ATOMS
// =============================================================================

export const currentUserAtom = atom((get) => get(_currentUserAtom));
export const isAuthenticatedAtom = atom(
  (get) => get(_currentUserAtom) !== null
);

// =============================================================================
// ACTION ATOMS
// =============================================================================

export const setCurrentUserAtom = atom(null, (_get, set, user: any | null) => {
  set(_currentUserAtom, user);
});

export const logoutAtom = atom(null, (_get, set) => {
  set(_currentUserAtom, null);
});
