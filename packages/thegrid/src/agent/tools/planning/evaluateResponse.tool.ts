import { createNamedTool } from "@mrck-labs/grid-core";
import { z } from "@hono/zod-openapi";
import { userLogger } from "../../../utils/logger";

// Define the parameters schema separately for type inference
const evaluateResponseSchema = z.object({
  reasoning: z.string().describe("Detailed reasoning for why you're evaluating this response and what you found"),
  responseContent: z.string().describe("The exact response content being evaluated"),
  evaluation: z
    .object({
      state: z
        .enum([
          "waiting-for-prompt", // When the response contains a question or requires user input
          "task-completed", // When the response indicates task completion
          "next-action", // When the response indicates that its not waiting for prompt and is not completed
        ])
        .describe(
          "REQUIRED: Determine the current state - waiting-for-prompt (has question), task-completed (task is done), or next-action (continue working)"
        ),
      hasQuestion: z
        .boolean()
        .describe("REQUIRED: True if the response contains any question or request for user input"),
      questionText: z.string().optional().describe("The exact question text if hasQuestion is true"),
      completionIndicators: z
        .array(z.string())
        .optional()
        .describe("Specific phrases or words that indicate task completion (e.g., 'done', 'completed', 'finished')"),
      nextSteps: z.string().optional().describe("What should happen next based on this evaluation"),
    })
    .describe("REQUIRED: Complete structured evaluation of the response"),
});

// Type for the parameters
type EvaluateResponseParams = z.infer<typeof evaluateResponseSchema>;

export const evaluateResponseTool: any = createNamedTool({
  name: "evaluate_response",
  description:
    "REQUIRED: Use this tool to evaluate every response. Analyze if the response contains a question, indicates task completion, or describes next steps. Always use this tool - never skip evaluation.",
  inputSchema: evaluateResponseSchema,
  execute: async (params: EvaluateResponseParams) => {
    userLogger.log("[evaluateResponse.tool] ✅ Using evaluateResponse tool with params:", params);
    return JSON.stringify(params.evaluation, null, 2);
  },
});
