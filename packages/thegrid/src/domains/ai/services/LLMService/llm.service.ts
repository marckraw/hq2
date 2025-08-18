import { logger } from "@/utils/logger";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import os from "os";
import path from "path";
import { config } from "../../../../config.env";
import { ChatMessage } from "../../../../routes/api/shared";
import { serviceRegistry } from "@/registry/service-registry";

export interface LLMTraceContext {
  sessionId?: string;
  userId?: string;
  conversationId?: number;
  agentType?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

// TODO: fix any
// @ts-ignore
const createLLMService = ({ dangerouslyAllowBrowser = false }: { dangerouslyAllowBrowser?: boolean }): any => {
  console.log("createLLMService", { dangerouslyAllowBrowser });
  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
    dangerouslyAllowBrowser,
  });
  const openrouter = new OpenAI({
    apiKey: config.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser,
  });

  const runOpenRouterLLM = async ({
    model = "google/gemma-3n-e4b-it:free",
    messages,
    tools,
    traceContext,
  }: {
    model?: string;
    messages: ChatMessage[];
    tools: any[];
    traceContext?: LLMTraceContext;
  }) => {
    const langfuseService = serviceRegistry.get("langfuse");
    // Create Langfuse generation within session trace if traceContext provided
    let generation;
    if (traceContext && traceContext.sessionId) {
      generation = langfuseService.createGenerationForSession(traceContext.sessionId, {
        name: `openrouter-${model}`,
        model,
        input: {
          messages,
          tools: tools.map((t) => ({ name: t.function?.name || t.name })),
          temperature: 0.1,
        },
        metadata: {
          provider: "openrouter",
          toolChoice: "auto",
          agentType: traceContext.agentType,
          toolCount: tools.length,
          ...traceContext.metadata,
        },
      });
    }

    const formattedTools = tools.map((tool) => {
      if (tool.parameters) {
        logger.info("🤪 Zod object");
        return zodFunction(tool);
      } else {
        logger.info("✅ Normal object");
        return tool;
      }
    });

    try {
      const response = await openrouter.chat.completions.create({
        model,
        temperature: 0.1,
        // TODO: fix any
        messages: [...(messages as any)],
        tools: formattedTools,
        tool_choice: "auto",
        //   parallel_tool_calls: false,
      });

      console.log("OpenRouter LLM response:");
      console.log(response);

      const usage = response.usage;
      const cost = langfuseService.calculateCost(model, {
        input: usage?.prompt_tokens,
        output: usage?.completion_tokens,
        total: usage?.total_tokens,
      });

      if (generation) {
        generation.end({
          output: response.choices[0]?.message,
          usage: {
            input: usage?.prompt_tokens,
            output: usage?.completion_tokens,
            total: usage?.total_tokens,
          },
          cost,
        });
      }

      return response.choices[0]?.message;
    } catch (error) {
      logger.error("OpenRouter LLM error:", error);

      if (generation) {
        generation.end({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      throw error;
    }
  };

  const runLLM = async ({
    model = "gpt-4.1-mini",
    // model = "gpt-5-nano",
    messages,
    tools,
    traceContext,
  }: {
    model?: string;
    messages: ChatMessage[];
    tools: any[];
    traceContext?: LLMTraceContext;
  }) => {
    const langfuseService = serviceRegistry.get("langfuse");
    // Create Langfuse generation within session trace if traceContext provided
    let generation;
    if (traceContext && traceContext.sessionId) {
      generation = langfuseService.createGenerationForSession(traceContext.sessionId, {
        name: `openai-${model}`,
        model,
        input: {
          messages: [
            {
              role: "system",
              content: `
                When answering questions about previous interactions, stored knowledge, or past events:
                1. ALWAYS check your available tools first
                2. If a searchMemory tool is available, use it BEFORE providing information from your own knowledge
                3. Only use your pre-trained knowledge if:
                  - The memory search returns no results
                  - The tools are unavailable
                  - The question is about general knowledge unrelated to our previous interactions
                `,
            },
            ...messages,
          ],
          tools: tools.map((t) => ({ name: t.function?.name || t.name })),
          temperature: 0.1,
        },
        metadata: {
          provider: "openai",
          toolChoice: "auto",
          agentType: traceContext.agentType,
          toolCount: tools.length,
          ...traceContext.metadata,
        },
      });
    }

    const formattedTools = tools.map((tool) => {
      if (tool.parameters) {
        logger.info("🤪 Zod object");
        return zodFunction(tool);
      } else {
        logger.info("✅ Normal object");
        return tool;
      }
    });

    try {
      const response = await openai.chat.completions.create({
        model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: `
            When answering questions about previous interactions, stored knowledge, or past events:
            1. ALWAYS check your available tools first
            2. If a searchMemory tool is available, use it BEFORE providing information from your own knowledge
            3. Only use your pre-trained knowledge if:
              - The memory search returns no results
              - The tools are unavailable
              - The question is about general knowledge unrelated to our previous interactions
            `,
          },
          // {
          //   role: "system",
          //   content: `
          //   You are a helpful assistant.
          //   When the user prompts you, you always create a plan to complete the task the user has asked for.
          //   You will create a file called "plan-*.md" and write the plan there. (you will use the "compose_plan" tool to do this)
          //   `,
          // },
          // TODO: fix any
          ...(messages as any),
        ],
        tools: formattedTools,
        tool_choice: "auto",
        //   parallel_tool_calls: false,
      });

      const usage = response.usage;
      const cost = langfuseService.calculateCost(model, {
        input: usage?.prompt_tokens,
        output: usage?.completion_tokens,
        total: usage?.total_tokens,
      });

      if (generation) {
        generation.end({
          output: response.choices[0]?.message,
          usage: {
            input: usage?.prompt_tokens,
            output: usage?.completion_tokens,
            total: usage?.total_tokens,
          },
          cost,
        });
      }

      return response.choices[0]?.message;
    } catch (error) {
      logger.error("OpenAI LLM error:", error);

      if (generation) {
        generation.end({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      throw error;
    }
  };

  const runCleanLLM = async ({
    model = "gpt-4.1-mini",
    // model = "gpt-5-nano",
    messages,
    tools,
  }: {
    model?: string;
    messages: ChatMessage[];
    tools: any[];
  }) => {
    const formattedTools = tools.map((tool) => {
      if (tool.parameters) {
        logger.info("🤪 Zod object");
        return zodFunction(tool);
      } else {
        logger.info("✅ Normal object");
        return tool;
      }
    });

    const response = await openai.chat.completions.create({
      model,
      temperature: 0.1,
      // TODO: fix any
      messages: [...(messages as any)],
      tools: formattedTools,
      tool_choice: "auto",
      //   parallel_tool_calls: false,
    });

    return response.choices[0]?.message;
  };

  const runCleanLLMWithJSONResponse = async ({
    model = "gpt-4.1-mini",
    // model = "gpt-5-nano",
    messages,
    tools,
    traceContext,
  }: {
    model?: string;
    messages: ChatMessage[];
    tools?: any[];
    traceContext?: LLMTraceContext;
  }) => {
    const langfuseService = serviceRegistry.get("langfuse");
    // Create Langfuse generation within session trace if traceContext provided
    let generation;
    if (traceContext && traceContext.sessionId) {
      generation = langfuseService.createGenerationForSession(traceContext.sessionId, {
        name: `openai-json-${model}`,
        model,
        input: {
          messages,
          tools: tools?.map((t) => ({ name: t.function?.name || t.name })) || [],
          temperature: 0.1,
          responseFormat: "json_object",
        },
        metadata: {
          provider: "openai",
          responseFormat: "json",
          agentType: traceContext.agentType,
          toolCount: tools?.length || 0,
          ...traceContext.metadata,
        },
        tags: traceContext.tags,
      });
    }

    let formattedTools = [];
    if (tools) {
      formattedTools = tools.map((tool) => {
        if (tool.parameters) {
          logger.info("🤪 Zod object");
          return zodFunction(tool);
        } else {
          logger.info("✅ Normal object");
          return tool;
        }
      });
    }

    try {
      const response = await openai.chat.completions.create({
        model,
        temperature: 0.1,
        // TODO: fix any
        messages: [...(messages as any)],
        response_format: { type: "json_object" },
        tools: formattedTools,
        tool_choice: "auto",
      });

      // End generation with success if tracing
      if (generation) {
        const usage = response.usage;
        const cost = langfuseService.calculateCost(model, {
          input: usage?.prompt_tokens,
          output: usage?.completion_tokens,
          total: usage?.total_tokens,
        });

        generation.end({
          output: response.choices[0]?.message,
          usage: {
            input: usage?.prompt_tokens,
            output: usage?.completion_tokens,
            total: usage?.total_tokens,
          },
          cost,
        });
      }

      return response.choices[0]?.message;
    } catch (error) {
      logger.error("OpenAI JSON LLM error:", error);

      // End generation with error if tracing
      if (generation) {
        generation.end({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      throw error;
    }
  };

  /**
   *
   * Very simple llm request, used only for streaming responses
   * It is supposed to be used without any tool calling
   * Just a simple stream - for example
   * - rephrasing the user message etc
   *
   */
  const runStreamedLLM = async ({
    model = "gpt-4.1-mini",
    // model = "gpt-5-nano",
    messages,
    isReasoningModel = false,
    traceContext,
  }: {
    model?: string;
    messages: ChatMessage[];
    isReasoningModel?: boolean;
    traceContext?: LLMTraceContext;
  }) => {
    const langfuseService = serviceRegistry.get("langfuse");
    // Create Langfuse trace for streaming
    const trace = langfuseService.createTrace({
      name: "openai-streaming-llm",
      sessionId: traceContext?.sessionId,
      userId: traceContext?.userId,
      conversationId: traceContext?.conversationId,
      agentType: traceContext?.agentType,
      metadata: {
        provider: "openai",
        streaming: true,
        isReasoningModel,
        ...traceContext?.metadata,
      },
      tags: ["llm", "openai", "streaming", traceContext?.agentType].filter((tag): tag is string => Boolean(tag)),
    });

    const generation = trace.createGeneration({
      name: `openai-streaming-${model}`,
      model,
      input: {
        messages,
        temperature: isReasoningModel ? 1 : 0.7,
        streaming: true,
      },
      metadata: {
        provider: "openai",
        isReasoningModel,
      },
    });

    try {
      const chatStream = await openai.chat.completions.create({
        model,
        messages: [...(messages as any)],
        stream: true,
        temperature: isReasoningModel ? 1 : 0.7,
      });

      // For streaming, we'll track the start but end the generation when the stream completes
      // The calling code should handle calling generation.end() with final usage stats
      return {
        stream: chatStream,
        generation,
        trace,
      };
    } catch (error) {
      logger.error("Streaming LLM error:", error);

      generation.end({
        error: error instanceof Error ? error.message : String(error),
      });

      trace.end({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  };

  /**
   * Router/Planner LLM - for decision making and action planning
   * Uses Google Gemini 2.0 Flash through OpenRouter for optimal speed + cost
   * Uses structured JSON output for reliable parsing
   * Designed for internal system use, not streaming
   */
  const runRouterLLM = async ({
    model = "google/gemini-2.0-flash-001",
    messages,
    schema,
  }: {
    model?: string;
    messages: ChatMessage[];
    schema?: any; // Zod schema for validation
  }) => {
    const response = await openrouter.chat.completions.create({
      model,
      temperature: 0.1, // Low temperature for consistent structured output
      messages: [...(messages as any)],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);

      // Validate with schema if provided
      if (schema) {
        return schema.parse(parsed);
      }

      return parsed;
    } catch (error) {
      logger.error("Router LLM JSON parsing error:", error);
      throw new Error(`Failed to parse router LLM response: ${error}`);
    }
  };

  /**
   * Enhanced streaming LLM with tool support for final response generation
   * This is for the final phase after planning/routing
   */
  const runStreamedLLMWithTools = async ({
    model = "gpt-4.1-mini",
    // model = "gpt-5-nano",
    messages,
    tools = [],
    isReasoningModel = false,
    traceContext,
  }: {
    model?: string;
    messages: ChatMessage[];
    tools?: any[];
    isReasoningModel?: boolean;
    traceContext?: LLMTraceContext;
  }) => {
    const langfuseService = serviceRegistry.get("langfuse");
    // Create Langfuse trace for streaming with tools
    const trace = langfuseService.createTrace({
      name: "openai-streaming-llm-with-tools",
      sessionId: traceContext?.sessionId,
      userId: traceContext?.userId,
      conversationId: traceContext?.conversationId,
      agentType: traceContext?.agentType,
      metadata: {
        provider: "openai",
        streaming: true,
        isReasoningModel,
        toolCount: tools.length,
        ...traceContext?.metadata,
      },
      tags: ["llm", "openai", "streaming", "tools", traceContext?.agentType].filter((tag): tag is string =>
        Boolean(tag)
      ),
    });

    const generation = trace.createGeneration({
      name: `openai-streaming-tools-${model}`,
      model,
      input: {
        messages,
        tools: tools.map((t) => ({ name: t.function?.name || t.name })),
        temperature: isReasoningModel ? 1 : 0.7,
        streaming: true,
      },
      metadata: {
        provider: "openai",
        isReasoningModel,
        toolsEnabled: tools.length > 0,
      },
    });

    const formattedTools = tools.map((tool) => {
      if (tool.parameters) {
        return zodFunction(tool);
      } else {
        return tool;
      }
    });

    try {
      const chatStream = await openai.chat.completions.create({
        model,
        messages: [...(messages as any)],
        stream: true,
        temperature: isReasoningModel ? 1 : 0.7,
        tools: formattedTools.length > 0 ? formattedTools : undefined,
        tool_choice: formattedTools.length > 0 ? "auto" : undefined,
      });

      // Return enhanced stream object with tracing
      return {
        stream: chatStream,
        generation,
        trace,
      };
    } catch (error) {
      logger.error("Streaming LLM with tools error:", error);

      generation.end({
        error: error instanceof Error ? error.message : String(error),
      });

      trace.end({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  };

  /**
   * Transcribes an audio file using GPT-4o Mini Audio Preview (with Whisper fallback).
   * @param filePath - The path to the audio file.
   * @returns The transcription text.
   */
  const transcribeAudio = async (filePath: string): Promise<string> => {
    try {
      // First try GPT-4o Mini Audio Preview
      const audioBuffer = fs.readFileSync(filePath);
      const base64Audio = audioBuffer.toString("base64");

      // Determine audio format from file extension
      const ext = path.extname(filePath).toLowerCase();
      const formatMap: Record<string, string> = {
        ".mp3": "mp3",
        ".wav": "wav",
        ".webm": "webm",
        ".m4a": "m4a",
        ".mp4": "mp4",
      };
      const format = formatMap[ext] || "mp3";

      logger.info(`🎵 Attempting GPT-4o Mini transcription for ${format} file`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini-audio-preview",
        modalities: ["text", "audio"] as any,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please transcribe this audio file accurately. Return only the transcribed text without any additional commentary.",
              },
              {
                type: "input_audio" as any,
                input_audio: {
                  data: base64Audio,
                  format: format as any,
                },
              },
            ] as any,
          },
        ],
        temperature: 0.1,
      });

      const transcription = response.choices[0]?.message?.content;
      if (transcription) {
        logger.info("✅ GPT-4o Mini transcription successful");
        return transcription;
      }

      throw new Error("No transcription content received from GPT-4o Mini");
    } catch (error) {
      logger.warn("⚠️ GPT-4o Mini transcription failed, falling back to Whisper:", error);

      // Fallback to Whisper
      try {
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: "whisper-1",
        });
        logger.info("✅ Whisper fallback transcription successful");
        return transcription.text;
      } catch (whisperError) {
        logger.error("❌ Both GPT-4o Mini and Whisper transcription failed:", whisperError);
        throw new Error("Failed to transcribe audio with both GPT-4o Mini and Whisper.");
      }
    }
  };

  /**
   * Transcribes an audio file using only OpenAI's Whisper model.
   * @param filePath - The path to the audio file.
   * @returns The transcription text.
   */
  const transcribeAudioWithWhisper = async (filePath: string): Promise<string> => {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      });
      return transcription.text;
    } catch (error) {
      logger.error("Error transcribing audio with Whisper:", error);
      throw new Error("Failed to transcribe audio with Whisper.");
    }
  };

  /**
   * Extracts audio from a video file and transcribes it.
   * @param videoPath - The path to the video file.
   * @returns The transcription text.
   */
  const transcribeVideo = async (videoPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const tempDir = os.tmpdir();
      const tempFileName = `${Date.now()}-audio.mp3`;
      const audioPath = path.join(tempDir, tempFileName);

      ffmpeg(videoPath)
        .toFormat("mp3")
        .on("error", (err: Error) => {
          logger.error("An error occurred: " + err.message);
          reject(new Error("Failed to extract audio from video. Make sure ffmpeg is installed."));
        })
        .on("end", async () => {
          try {
            const transcription = await transcribeAudio(audioPath);
            resolve(transcription);
          } catch (error) {
            reject(error);
          } finally {
            // Clean up the temporary audio file
            fs.unlink(audioPath, (err) => {
              if (err) logger.error("Error deleting temporary audio file:", err);
            });
          }
        })
        .save(audioPath);
    });
  };

  // Backward compatibility wrappers (without tracing)
  // These maintain the original function signatures for existing code
  const runLLMCompat = async (params: { model?: string; messages: ChatMessage[]; tools: any[] }) =>
    runLLM({ ...params });

  const runOpenRouterLLMCompat = async (params: { model?: string; messages: ChatMessage[]; tools: any[] }) =>
    runOpenRouterLLM({ ...params });

  const runStreamedLLMCompat = async (params: {
    model?: string;
    messages: ChatMessage[];
    isReasoningModel?: boolean;
  }) => {
    const result = await runStreamedLLM({ ...params });
    return result.stream; // Return just the stream for backward compatibility
  };

  const runStreamedLLMWithToolsCompat = async (params: {
    model?: string;
    messages: ChatMessage[];
    tools?: any[];
    isReasoningModel?: boolean;
  }) => {
    const result = await runStreamedLLMWithTools({ ...params });
    return result.stream; // Return just the stream for backward compatibility
  };

  /**
   * Helper function to end streaming traces
   * This should be called by the consuming code when streaming is complete
   */
  const endStreamingTrace = (
    generation: any,
    trace: any,
    usage?: {
      input?: number;
      output?: number;
      total?: number;
    },
    fullResponse?: string
  ) => {
    if (generation && trace) {
      try {
        const langfuseService = serviceRegistry.get("langfuse");
        const cost = usage ? langfuseService.calculateCost("gpt-4o-mini", usage) : undefined;

        generation.end({
          output: fullResponse,
          usage,
          cost,
        });

        trace.end({
          success: true,
          streamingComplete: true,
        });
      } catch (error) {
        logger.error("Failed to end streaming trace:", error);
      }
    }
  };

  /**
   * Helper function to create trace context from request parameters
   */
  const createTraceContext = (options: {
    sessionId?: string;
    userId?: string;
    conversationId?: number;
    agentType?: string;
    metadata?: Record<string, any>;
  }): LLMTraceContext => {
    return {
      sessionId: options.sessionId,
      userId: options.userId,
      conversationId: options.conversationId,
      agentType: options.agentType,
      metadata: options.metadata,
    };
  };

  // Return public interface
  return {
    openai,
    runLLM,
    runCleanLLM,
    runCleanLLMWithJSONResponse,
    runOpenRouterLLM,
    runStreamedLLM,
    runRouterLLM,
    runStreamedLLMWithTools,
    transcribeAudio,
    transcribeAudioWithWhisper,
    transcribeVideo,
    runLLMCompat,
    runOpenRouterLLMCompat,
    runStreamedLLMCompat,
    runStreamedLLMWithToolsCompat,
    endStreamingTrace,
    createTraceContext,
  };
};

export { createLLMService };

// Export the type for the service registry
export type LLMService = ReturnType<typeof createLLMService>;
