import { logger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { serviceRegistry } from "../../../registry/service-registry";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { transcribeAudioRoute, transcribeVideoRoute } from "./audio.routes";

const audio = new OpenAPIHono();

audio.openapi(transcribeAudioRoute, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return c.json({ error: "No file provided" } as const, 400);
  }

  // Create a temporary file to store the upload
  const tempDir = os.tmpdir();
  const tempFileName = `${Date.now()}-${file.name}`;
  const tempFilePath = path.join(tempDir, tempFileName);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    const audioService = serviceRegistry.get("audio");
    const transcription = await audioService.transcribe(tempFilePath);

    return c.json({ transcription } as const, 200);
  } catch (error) {
    logger.error("Error during transcription:", error);
    return c.json({ error: "Failed to transcribe audio" } as const, 500);
  } finally {
    // Clean up the temporary file
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      logger.error("Error cleaning up temporary file:", cleanupError);
    }
  }
});

audio.openapi(transcribeVideoRoute, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return c.json({ error: "No file provided" } as const, 400);
  }

  // Create a temporary file to store the upload
  const tempDir = os.tmpdir();
  const tempFileName = `${Date.now()}-${file.name}`;
  const tempFilePath = path.join(tempDir, tempFileName);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    const audioService = serviceRegistry.get("audio");
    const transcription = await audioService.transcribeVideo(tempFilePath);

    return c.json({ transcription } as const, 200);
  } catch (error: any) {
    logger.error("Error during video transcription:", error);
    return c.json(
      { error: error.message || "Failed to transcribe video" } as const,
      500
    );
  } finally {
    // Clean up the temporary file
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      logger.error("Error cleaning up temporary file:", cleanupError);
    }
  }
});

export default audio;
