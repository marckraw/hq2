import { mimeTypes } from "./mime.config";
import { FileType } from "./upload.type";

export const getFileType = (file: File): FileType | null => {
  if (file.type.startsWith("image/")) return FileType.IMAGE;
  if (file.type === "application/pdf") return FileType.DOCUMENT;
  if (file.name.endsWith(".md") || file.type === "text/markdown")
    return FileType.TEXT;
  return null;
};

export const getPreviewIcon = (fileType: FileType) => {
  switch (fileType) {
    case FileType.DOCUMENT:
      return "📄";
    case FileType.TEXT:
      return "📝";
    default:
      return "📎";
  }
};

export const isFileTypeSupported = (file: File) => {
  const supportedTypes = [
    ...mimeTypes[FileType.IMAGE].mimes,
    ...mimeTypes[FileType.DOCUMENT].mimes,
    ...mimeTypes[FileType.TEXT].mimes,
  ];

  return (
    supportedTypes.includes(file.type) ||
    file.name.toLowerCase().endsWith(".md") ||
    file.name.toLowerCase().endsWith(".pdf")
  );
};
