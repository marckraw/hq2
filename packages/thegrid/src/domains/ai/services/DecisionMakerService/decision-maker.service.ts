import { logger } from "@/utils/logger";
import { createLLMService } from "../LLMService/llm.service";
import { z } from "@hono/zod-openapi";

/**
 * 🚀 RECOMMENDED MODELS FOR DECISION MAKER (2025)
 *
 * SPEED + QUALITY BALANCE (OpenRouter model names):
 * 1. "google/gemini-2.0-flash-001" ⭐ BEST CHOICE - 150+ tok/s, ~37ms TTFT
 * 2. "anthropic/claude-3-haiku" - ~150-400ms response, reliable JSON
 * 3. "openai/gpt-4o-mini" - ~200-500ms, excellent structured output
 *
 * BLAZING FAST (if speed is critical):
 * 1. "deepseek/deepseek-r1" - Fastest reasoning model, open source
 * 2. "cohere/command-r-plus" - Built for real-time, low latency
 * 3. "google/gemini-2.5-flash" - Up to 150 tok/s
 *
 * REASONING (if complex decisions needed):
 * 1. "anthropic/claude-4-sonnet" - Best reasoning + fast
 * 2. "openai/o3-mini" - Great reasoning, moderate speed
 * 3. "deepseek/deepseek-r1" - Fast reasoning model
 *
 * COST-EFFECTIVE:
 * 1. "google/gemini-2.0-flash-001" - Great value at $1.25/$10.00 per 1M tokens
 * 2. "openai/gpt-4o-mini" - Affordable + reliable
 * 3. "anthropic/claude-3-haiku" - Fast + cheap
 */

// Decision schema for the router
const decisionSchema = z.object({
  actions: z.array(
    z.object({
      type: z.enum([
        "save_memory",
        "search_memory",
        "generate_response",
        "analyze_content",
        "no_action",
      ]),
      priority: z.number().min(1).max(10),
      reasoning: z.string(),
      metadata: z.record(z.any()).optional(),
    })
  ),
  summary: z.string(),
  shouldProceed: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export type DecisionResult = z.infer<typeof decisionSchema>;

const createDecisionMakerService = () => {
  const llmService = createLLMService({ dangerouslyAllowBrowser: false });
  const analyzeUserMessage = async (
    userMessage: string,
    conversationHistory?: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>,
    options?: {
      model?: string;
      maxContextMessages?: number;
    }
  ): Promise<DecisionResult> => {
    const {
      model = "google/gemini-2.0-flash-001", // Default to Gemini-2.0-Flash via OpenRouter for optimal speed + quality in 2025
      maxContextMessages = 5,
    } = options || {};

    logger.info(`🧠 Decision Maker (${model}) analyzing user input...`);

    // System prompt for decision making
    const systemPrompt = `You are a Decision Maker that analyzes user messages and decides what actions to take.

Your job is to analyze the user's message and determine:
1. Should we save anything to memory? (preferences, facts, goals, etc.)
2. Should we search existing memories for context?
3. What type of response generation is needed?
4. Any other specific actions required?

Context: You have access to the conversation history to make better decisions.

Return your decision as a JSON object with this structure:
{
  "actions": [
    {
      "type": "save_memory|search_memory|generate_response|analyze_content|no_action",
      "priority": 1-10,
      "reasoning": "Why this action is needed",
      "metadata": { any additional data }
    }
  ],
  "summary": "Brief summary of what you decided",
  "shouldProceed": true/false,
  "confidence": 0.0-1.0
}

Action types:
- save_memory: When user shares preferences, facts, goals, or important information
- search_memory: When response could benefit from past context
- generate_response: Always include this for final response generation
- analyze_content: When complex analysis is needed
- no_action: When no special action is required

Priority: 1 (lowest) to 10 (highest)
Confidence: How certain you are about your decisions (0.0 to 1.0)

Examples:
- If user says "I prefer dark mode" → save_memory (priority 8) + generate_response (priority 5)
- If user asks "What was my last project?" → search_memory (priority 9) + generate_response (priority 6)
- If user says "Hello" → generate_response (priority 5)
- If user shares complex information → analyze_content (priority 7) + save_memory (priority 8) + generate_response (priority 5)`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(conversationHistory || []).slice(-maxContextMessages), // Include last N messages for context
      {
        role: "user" as const,
        content: `Analyze this user message and decide what actions to take:\n\n"${userMessage}"`,
      },
    ];

    try {
      // Use the router LLM for structured decision making
      const validatedDecision = await llmService.runRouterLLM({
        model,
        messages,
        schema: decisionSchema,
      });

      logger.info(`🧠 Decision made: ${validatedDecision.summary}`);
      logger.info(`🧠 Actions planned: ${validatedDecision.actions.length}`);

      return validatedDecision;
    } catch (error) {
      logger.info(`🧠 Decision maker error: ${error}`);

      // Return a safe fallback decision
      return {
        actions: [
          {
            type: "generate_response",
            priority: 5,
            reasoning:
              "Error in decision making, defaulting to response generation",
          },
        ],
        summary: "Error in decision making process",
        shouldProceed: true,
        confidence: 0.2,
      };
    }
  };

  return {
    analyzeUserMessage,
  };
};

export const decisionMakerService = createDecisionMakerService();
export type DecisionMakerService = ReturnType<
  typeof createDecisionMakerService
>;
