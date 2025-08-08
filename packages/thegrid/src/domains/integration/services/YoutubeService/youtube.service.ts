import { logger } from "@/utils/logger";
import { youtubeDl } from "youtube-dl-exec";
import fs from "fs";
import path from "path";
import os from "os";
import { serviceRegistry } from "../../../../registry/service-registry";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";

export const createYoutubeService = () => {
  const downloadAudio = async (url: string): Promise<string> => {
    logger.info("Downloading audio from URL:", url);
    const tempDir = os.tmpdir();
    const filename = `${Date.now()}`;
    const template = path.join(tempDir, filename);
    const expectedOutputPath = `${template}.mp3`;

    logger.info("Downloading audio to:", expectedOutputPath);

    await youtubeDl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: template,
      ffmpegLocation: ffmpegPath, // Point to the packaged ffmpeg binary
    });

    if (!fs.existsSync(expectedOutputPath)) {
      throw new Error(
        `Failed to download audio. Expected file not found at ${expectedOutputPath}`
      );
    }

    return expectedOutputPath;
  };

  const transcribeVideoFromUrl = async (url: string): Promise<string> => {
    const audioPath = await downloadAudio(url);
    try {
      const audioService = serviceRegistry.get("audio");
      // Use transcribe for audio files, not transcribeVideo
      return await audioService.transcribe(audioPath);
    } finally {
      fs.unlink(audioPath, (err) => {
        if (err) logger.error("Error deleting temporary audio file:", err);
      });
    }
  };

  return { downloadAudio, transcribeVideoFromUrl };
};

export const youtubeService = createYoutubeService();
export type YoutubeService = typeof youtubeService;
