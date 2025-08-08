import { createRoute, z } from "@hono/zod-openapi";

// Request schema
const ElevenLabsTTSRequestSchema = z.object({
  text: z.string().describe("Text to convert to speech"),
  voiceId: z.string().optional().describe("Optional voice ID for specific voice selection"),
});

// Response schemas
const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Route definition
export const textToSpeechRoute = createRoute({
  method: "post",
  path: "/text-to-speech",
  summary: "Convert text to speech",
  description: "Converts text to speech using ElevenLabs API and streams the audio response",
  tags: ["ElevenLabs"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ElevenLabsTTSRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Audio stream of the generated speech",
      content: {
        "audio/mpeg": {
          schema: z.any().describe("Audio stream in MPEG format"),
        },
      },
    },
    500: {
      description: "Failed to generate speech",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    503: {
      description: "ElevenLabs service not configured",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});