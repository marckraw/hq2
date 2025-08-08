import { logger } from "@/utils/logger";
import { config } from "../../../../config.env";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

export const createElevenLabsService = () => {
  if (!config.ELEVENLABS_API_KEY) {
    logger.warn(
      "ELEVENLABS_API_KEY is not set. ElevenLabsService will not be available."
    );
    return {
      isAvailable: false,
      textToSpeech: async () => {
        throw new Error("ElevenLabs service is not configured.");
      },
      textToSpeechStream: async () => {
        throw new Error("ElevenLabs service is not configured.");
      },
    };
  }

  const elevenlabs = new ElevenLabsClient({
    apiKey: config.ELEVENLABS_API_KEY,
  });

  /**
   * Converts text to speech and returns the audio as a buffer.
   * @param text The text to convert.
   * @param voiceId The ID of the voice to use.
   * @returns A buffer containing the audio data.
   */
  const textToSpeech = async (
    text: string,
    voiceId: string = "21m00Tcm4TlvDq8ikWAM"
  ) => {
    try {
      const audio = await elevenlabs.textToSpeech.convert(voiceId, {
        text,
        modelId: "eleven_multilingual_v2", // Use a supported model
        outputFormat: "mp3_44100_128",
      });

      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error("Error converting text to speech with ElevenLabs:", error);
      throw new Error("Failed to convert text to speech.");
    }
  };

  /**
   * Converts text to speech and returns the audio as a stream.
   * @param text The text to convert.
   * @param voiceId The ID of the voice to use.
   * @returns A readable stream of the audio data.
   */
  const textToSpeechStream = async (
    text: string,
    voiceId: string = "21m00Tcm4TlvDq8ikWAM"
  ): Promise<Readable> => {
    try {
      const audioStream = await elevenlabs.textToSpeech.stream(voiceId, {
        text,
        modelId: "eleven_multilingual_v2", // Use a supported model
        outputFormat: "mp3_44100_128",
      });

      return Readable.from(audioStream);
    } catch (error) {
      logger.error("Error streaming text to speech with ElevenLabs:", error);
      throw new Error("Failed to stream text to speech.");
    }
  };

  return {
    isAvailable: true,
    textToSpeech,
    textToSpeechStream,
  };
};

export type ElevenLabsService = ReturnType<typeof createElevenLabsService>;
