export const isToolEvent = (e: { type: string }) => e.type === "tool_execution" || e.type === "tool_response";

export const splitProgressEvents = <T extends { type: string }>(events: T[]) => {
  const tool = events.filter(isToolEvent);
  const other = events.filter((e) => !isToolEvent(e));
  return { tool, other };
};
