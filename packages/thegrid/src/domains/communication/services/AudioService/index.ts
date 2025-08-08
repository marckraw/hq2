import { logger } from "@/utils/logger";
import { createLLMService } from "../../../ai/services/LLMService/llm.service";

export const createAudioService = () => {
  const llmService = createLLMService({ dangerouslyAllowBrowser: false });
  /**
   * Transcribes an audio file using GPT-4o Mini Audio Preview (with Whisper fallback).
   * @param filePath - The path to the audio file.
   * @returns The transcription text.
   */
  const transcribe = async (filePath: string) => {
    try {
      return await llmService.transcribeAudio(filePath);
    } catch (error) {
      logger.error("Error transcribing audio:", error);
      throw new Error("Failed to transcribe audio.");
    }
  };

  /**
   * Transcribes an audio file using only OpenAI's Whisper model.
   * @param filePath - The path to the audio file.
   * @returns The transcription text.
   */
  const transcribeWithWhisper = async (filePath: string) => {
    try {
      return await llmService.transcribeAudioWithWhisper(filePath);
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
    try {
      return await llmService.transcribeVideo(videoPath);
    } catch (error) {
      logger.error("Error transcribing video:", error);
      throw new Error("Failed to transcribe video.");
    }
  };

  return {
    transcribe,
    transcribeWithWhisper,
    transcribeVideo,
  };
};

export type AudioService = ReturnType<typeof createAudioService>;
