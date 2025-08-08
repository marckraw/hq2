import { getFileType, isFileTypeSupported } from "@/lib/file-utils";
import { FileType } from "@/lib/upload.type";
import { useCallback, useState } from "react";

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  type: "image" | "pdf" | "markdown";
  size: number;
  dataUrl?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
}

interface UseFileHandlerOptions {
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onError?: (error: Error) => void;
}

export const useFileHandler = (options?: UseFileHandlerOptions) => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      const maxSize = options?.maxFileSize || 10 * 1024 * 1024; // 10MB default

      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
        };
      }

      if (!isFileTypeSupported(file)) {
        return {
          isValid: false,
          error: "Unsupported file type",
        };
      }

      return { isValid: true };
    },
    [options?.maxFileSize]
  );

  const processFiles = useCallback(
    async (files: File[]): Promise<FileAttachment[]> => {
      const processedFiles: FileAttachment[] = [];
      console.log("[processFiles] Input files:", files);
      const supportedFiles = files.filter(isFileTypeSupported);
      console.log("[processFiles] Supported files:", supportedFiles);

      for (const file of supportedFiles) {
        try {
          const validation = validateFile(file);
          console.log(
            `[processFiles] Validation for ${file.name}:`,
            validation
          );
          if (!validation.isValid) {
            if (options?.onError) {
              options.onError(new Error(validation.error));
            }
            continue;
          }

          const fileType = getFileType(file);
          console.log(`[processFiles] File type for ${file.name}:`, fileType);
          if (fileType) {
            const attachment = {
              id: crypto.randomUUID(),
              file,
              name: file.name,
              type:
                fileType === FileType.IMAGE
                  ? "image"
                  : fileType === FileType.DOCUMENT
                  ? "pdf"
                  : "markdown",
              size: file.size,
            };
            console.log("[processFiles] Created attachment:", attachment);
            processedFiles.push(attachment as FileAttachment);
          }
        } catch (error) {
          console.error("Error processing file:", error);
          if (options?.onError && error instanceof Error) {
            options.onError(error);
          }
        }
      }

      console.log("[processFiles] Final processed files:", processedFiles);
      return processedFiles;
    },
    [validateFile, options?.onError]
  );

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const filesArray = Array.from(files);
      console.log("[useFileHandler] Processing files:", filesArray);
      const processedFiles = await processFiles(filesArray);
      console.log("[useFileHandler] Processed files:", processedFiles);

      setAttachments((prev) => {
        const newAttachments = [...prev, ...processedFiles];
        console.log("[useFileHandler] New attachments state:", newAttachments);
        return newAttachments;
      });
    },
    [processFiles]
  );

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      console.log("[useFileHandler] Dropping files:", files);
      const processedFiles = await processFiles(files);
      console.log("[useFileHandler] Processed dropped files:", processedFiles);
      setAttachments((prev) => {
        const newAttachments = [...prev, ...processedFiles];
        console.log(
          "[useFileHandler] New attachments state after drop:",
          newAttachments
        );
        return newAttachments;
      });
    },
    [processFiles]
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const prepareFiles = useCallback(
    async (
      endpoint: string,
      conversationId?: number | null,
      headers?: Record<string, string>
    ): Promise<UploadedFile[]> => {
      console.log(
        "[prepareFiles] Starting file preparation with attachments:",
        attachments
      );
      setIsUploading(true);
      try {
        const uploadPromises = attachments.map(async (attachment) => {
          console.log(`[prepareFiles] Preparing file: ${attachment.name}`);
          const formData = new FormData();
          formData.append("file", attachment.file);
          if (conversationId) {
            formData.append("conversationId", conversationId.toString());
          }

          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
            headers: headers || {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
            },
          });

          if (!response.ok) {
            const error = await response.json();
            console.error(
              `[prepareFiles] Preparation failed for ${attachment.name}:`,
              error
            );
            throw new Error(error.error?.message || "Failed to prepare file");
          }

          const result = await response.json();
          console.log(
            `[prepareFiles] Preparation successful for ${attachment.name}:`,
            result
          );
          return result.data || result;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        console.log("[prepareFiles] All preparations complete:", uploadedFiles);
        return uploadedFiles.filter(Boolean);
      } catch (error) {
        console.error("[prepareFiles] Preparation error:", error);
        if (options?.onError && error instanceof Error) {
          options.onError(error);
        }
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [attachments, options?.onError]
  );

  return {
    attachments,
    isUploading,
    hasAttachments: attachments.length > 0,
    handleFileSelect,
    handleFileDrop,
    removeAttachment,
    clearAttachments,
    prepareFiles,
    setAttachments,
  };
};
