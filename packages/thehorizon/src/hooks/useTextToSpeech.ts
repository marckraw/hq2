import { useState, useRef, useCallback } from "react";

export interface TextToSpeechState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentText: string | null;
}

export interface TextToSpeechActions {
  speak: (text: string, voiceId?: string) => Promise<void>;
  stop: () => void;
  clearError: () => void;
}

export const useTextToSpeech = (): TextToSpeechState & TextToSpeechActions => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Abort any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsPlaying(false);
    setIsLoading(false);
    setCurrentText(null);
  }, []);

  const speak = useCallback(
    async (text: string, voiceId?: string) => {
      try {
        // Stop any current playback
        stop();

        setIsLoading(true);
        setError(null);
        setCurrentText(text);

        // Create abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Call ElevenLabs TTS API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/elevenlabs/text-to-speech`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
            },
            body: JSON.stringify({
              text,
              voiceId: voiceId || "21m00Tcm4TlvDq8ikWAM", // Default voice
            }),
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`TTS failed: ${response.statusText}`);
        }

        // Get audio blob
        const audioBlob = await response.blob();

        if (abortController.signal.aborted) {
          return;
        }

        // Create audio URL and play
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Set up audio event listeners
        audio.onloadstart = () => {
          setIsLoading(false);
          setIsPlaying(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentText(null);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setError("Failed to play audio");
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentText(null);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        // Start playing
        await audio.play();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was aborted, ignore
          return;
        }

        console.error("Error in text-to-speech:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate speech"
        );
        setIsLoading(false);
        setIsPlaying(false);
        setCurrentText(null);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [stop]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    currentText,
    speak,
    stop,
    clearError,
  };
};
