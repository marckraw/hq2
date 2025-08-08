import type { MimeTypeConfig } from "./upload.type";
import { FileType } from "./upload.type";

export const mimeTypes: MimeTypeConfig = {
  [FileType.TEXT]: {
    extensions: [".txt", ".md", ".json", ".html", ".csv"],
    mimes: [
      "text/plain",
      "text/markdown",
      "application/json",
      "text/html",
      "text/csv",
    ],
  },
  [FileType.AUDIO]: {
    extensions: [".mp3", ".wav", ".ogg", ".m4a"],
    mimes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  },
  [FileType.IMAGE]: {
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    mimes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
  [FileType.DOCUMENT]: {
    extensions: [".pdf"],
    mimes: ["application/pdf"],
  },
};

export const supportedExtensions = Object.values(mimeTypes)
  .flatMap((config) => config.extensions)
  .map((ext) => ext.replace(".", ""));

export const supportedMimes = Object.values(mimeTypes).flatMap(
  (config) => config.mimes
);

export const getFileTypeFromExtension = (
  extension: string
): FileType | null => {
  const normalized_ext = extension.startsWith(".")
    ? extension
    : `.${extension}`;
  return Object.entries(mimeTypes).find(([_, config]) =>
    config.extensions.includes(normalized_ext)
  )?.[0] as FileType | null;
};

export const getMimeTypeFromExtension = (extension: string): string | null => {
  const normalized_ext = extension.startsWith(".")
    ? extension
    : `.${extension}`;
  for (const config of Object.values(mimeTypes)) {
    const index = config.extensions.indexOf(normalized_ext);
    if (index !== -1) {
      return config.mimes[Math.min(index, config.mimes.length - 1)];
    }
  }
  return null;
};
