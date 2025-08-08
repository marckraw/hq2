/**
 * Global State - Public API
 *
 * App-wide state that should be accessible across all features.
 * Following official Jotai custom hooks pattern.
 *
 * Usage:
 * ```tsx
 * import { useAuth, useTheme } from '@/_state'
 * ```
 *
 * This is truly global state - not tied to any specific app route or feature.
 */

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================
export { useAuth, useAuthState, useAuthActions } from "./hooks/useAuth";

// =============================================================================
// THEME & UI PREFERENCE HOOKS
// =============================================================================
export { useTheme, useSidebar } from "./hooks/useTheme";

// =============================================================================
// GLOBAL CONNECTION HOOKS
// =============================================================================
// Note: Global connection hooks removed - app uses chat-specific connection status

/**
 * IMPORTANT: Raw atoms are NOT exported from this index.
 * Components should only use the custom hooks above.
 *
 * This follows the official Jotai pattern and provides:
 * - Better encapsulation
 * - Cleaner component code
 * - Easier testing
 * - Future-proof API
 *
 * If you need direct atom access for advanced use cases,
 * import from the specific atom files:
 * import { themeAtom } from '@/_state/atoms/theme'
 */
