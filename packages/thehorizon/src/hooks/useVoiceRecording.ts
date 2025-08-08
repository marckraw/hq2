import { useState, useRef, useCallback } from "react";

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

export interface VoiceRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
  transcribeAudio: () => Promise<string | null>;
}

export const useVoiceRecording = (): VoiceRecordingState &
  VoiceRecordingActions => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        setIsProcessing(false);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsProcessing(false);
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
      setIsProcessing(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const transcribeAudio = useCallback(async (): Promise<string | null> => {
    if (!audioBlob) {
      setError("No audio recording available");
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create FormData for the API request
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      // Call your transcription API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/audio/transcribe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transcription || null;
    } catch (err) {
      console.error("Error transcribing audio:", err);
      setError(
        err instanceof Error ? err.message : "Failed to transcribe audio"
      );
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob]);

  return {
    isRecording,
    isProcessing,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    transcribeAudio,
  };
};
