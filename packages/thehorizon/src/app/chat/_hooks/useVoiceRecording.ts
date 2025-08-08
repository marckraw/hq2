import { useVoiceRecorder } from "../_state/chat";
import type { EnhancedEditorRef } from "@/app/chat/_components/EnhancedEditor";

export const useVoiceRecording = () => {
  const { showVoiceRecorder, toggleVoiceRecorder, setShowVoiceRecorder } =
    useVoiceRecorder();

  const toggleRecording = () => {
    toggleVoiceRecorder();
  };

  const handleTranscription = (
    transcription: string,
    editorRef: React.RefObject<EnhancedEditorRef | null>
  ) => {
    // Set the transcription in the editor
    editorRef.current?.setContent(transcription);
    // Hide the voice recorder
    setShowVoiceRecorder(false);
    // Focus the editor for potential editing
    editorRef.current?.focus();
  };

  return {
    // State
    showVoiceRecorder,
    isRecording: showVoiceRecorder,

    // Actions
    toggleRecording,
    handleTranscription,
    startRecording: () => setShowVoiceRecorder(true),
    stopRecording: () => setShowVoiceRecorder(false),
  };
};
