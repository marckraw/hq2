import { useChatInput } from "../_state/chat";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
  dataUrl?: string;
}

export const useFileUpload = () => {
  const { attachments, addAttachment, removeAttachment, clearAttachments } =
    useChatInput();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: FileAttachment[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));

    // Add each attachment individually using the hook's addAttachment method
    newAttachments.forEach((attachment) => addAttachment(attachment));
  };

  const prepareFiles = async (conversationId?: number | null) => {
    const uploadedFiles = await Promise.all(
      attachments.map(async (attachment) => {
        if (!attachment.file) return null;

        const formData = new FormData();
        formData.append("file", attachment.file);
        if (conversationId) {
          formData.append("conversationId", conversationId.toString());
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/files/prepare`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Failed to prepare file");
        }

        return (await response.json()).data;
      })
    );

    return uploadedFiles.filter(Boolean);
  };

  return {
    // State
    attachments,
    hasAttachments: attachments.length > 0,

    // Actions
    handleFileSelect,
    removeAttachment,
    clearAttachments,
    prepareFiles,
  };
};
