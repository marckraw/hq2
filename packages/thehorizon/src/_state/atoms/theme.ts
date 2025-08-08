/**
 * UI Preference Atoms
 *
 * Global UI state that affects the entire application.
 * Includes sidebar state and other app-wide UI preferences.
 *
 * Note: Theme management is now handled by the unified ThemeProvider.
 */

import { atom } from "jotai";

// =============================================================================
// PRIVATE BASE ATOMS
// =============================================================================

const _sidebarOpenAtom = atom(true);

// =============================================================================
// PUBLIC READ-ONLY ATOMS
// =============================================================================

export const sidebarOpenAtom = atom((get) => get(_sidebarOpenAtom));

// =============================================================================
// ACTION ATOMS
// =============================================================================

export const setSidebarOpenAtom = atom(null, (_get, set, open: boolean) => {
  set(_sidebarOpenAtom, open);
});

export const toggleSidebarAtom = atom(null, (get, set) => {
  const current = get(_sidebarOpenAtom);
  set(_sidebarOpenAtom, !current);
});
