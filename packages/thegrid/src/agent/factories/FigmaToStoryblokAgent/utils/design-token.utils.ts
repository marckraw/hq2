// Utility functions for resolving design tokens from global variables

export const resolveDesignToken = (
  tokenRef: string | any,
  globalVars?: { styles?: Record<string, any>; [key: string]: any }
): any => {
  // If tokenRef is not a string, return as-is (already resolved or not a token)
  if (typeof tokenRef !== "string") {
    return tokenRef;
  }

  // Try to resolve from globalVars.styles
  const resolvedValue = globalVars?.styles?.[tokenRef];

  // Return resolved value if found, otherwise return original token reference
  return resolvedValue !== undefined ? resolvedValue : tokenRef;
};

// Helper to resolve all design tokens in a design object
export const resolveDesignTokens = (
  design: Record<string, any> = {},
  globalVars?: { styles?: Record<string, any>; [key: string]: any }
): Record<string, any> => {
  const resolved: Record<string, any> = {};

  Object.entries(design).forEach(([key, value]) => {
    resolved[key] = resolveDesignToken(value, globalVars);
  });

  return resolved;
};
