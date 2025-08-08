import { logger } from "@/utils/logger";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { serviceRegistry } from "../../../registry/service-registry";

const elevenlabs = new Hono();

// POST /text-to-speech - Audio streaming endpoint
elevenlabs.post("/text-to-speech", async (c) => {
    const elevenLabsService = serviceRegistry.get("elevenlabs");
    if (!elevenLabsService.isAvailable) {
      return c.json({ error: "ElevenLabs service is not configured." } as const, 503);
    }

    const { text, voiceId } = await c.req.json();

    try {
      const audioStream = await elevenLabsService.textToSpeechStream(
        text,
        voiceId
      );

      c.header("Content-Type", "audio/mpeg");
      return stream(c, async (stream) => {
        for await (const chunk of audioStream) {
          await stream.write(chunk);
        }
      });
    } catch (error) {
      logger.error("Error in ElevenLabs text-to-speech route:", error);
      return c.json({ error: "Failed to generate speech." } as const, 500);
    }
  }
);

export default elevenlabs;