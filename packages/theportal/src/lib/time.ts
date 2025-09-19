export const formatDurationShort = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${s} second${s === 1 ? "" : "s"}`;
};
