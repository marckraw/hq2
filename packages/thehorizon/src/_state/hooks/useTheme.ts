/**
 * Theme & UI Preference Hooks
 *
 * Re-exports the theme hook from our unified theme provider
 */

import { useTheme } from "@/providers/theme-provider";
import { useAtomValue, useSetAtom } from "jotai";
import {
  sidebarOpenAtom,
  setSidebarOpenAtom,
  toggleSidebarAtom,
} from "../atoms/theme";

/**
 * Hook for sidebar state management
 */
export function useSidebar() {
  const sidebarOpen = useAtomValue(sidebarOpenAtom);
  const setSidebarOpen = useSetAtom(setSidebarOpenAtom);
  const toggleSidebar = useSetAtom(toggleSidebarAtom);

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  };
}

// Re-export the theme hook
export { useTheme };
