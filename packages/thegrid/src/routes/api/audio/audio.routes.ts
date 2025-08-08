import { createRoute, z } from "@hono/zod-openapi";

// Response schemas
const TranscriptionResponseSchema = z.object({
  transcription: z.string(),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Route definitions
export const transcribeAudioRoute = createRoute({
  method: "post",
  path: "/transcribe",
  summary: "Transcribe audio file",
  description: "Transcribes an uploaded audio file to text using the audio service",
  tags: ["Audio"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any().describe("Audio file to transcribe (supported formats: mp3, wav, m4a, etc.)"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Audio transcribed successfully",
      content: {
        "application/json": {
          schema: TranscriptionResponseSchema,
        },
      },
    },
    400: {
      description: "No file provided",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Failed to transcribe audio",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const transcribeVideoRoute = createRoute({
  method: "post",
  path: "/transcribe-video",
  summary: "Transcribe video file",
  description: "Extracts audio from a video file and transcribes it to text",
  tags: ["Audio"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any().describe("Video file to transcribe (supported formats: mp4, avi, mov, etc.)"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Video audio transcribed successfully",
      content: {
        "application/json": {
          schema: TranscriptionResponseSchema,
        },
      },
    },
    400: {
      description: "No file provided",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Failed to transcribe video",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});