export enum FileType {
  TEXT = "text",
  AUDIO = "audio",
  IMAGE = "image",
  DOCUMENT = "document",
}

export interface FileTypeConfig {
  extensions: string[];
  mimes: string[];
}

export interface UploadResult {
  uuid: string;
  type: FileType;
  path: string;
  original_name: string;
}

export type MimeTypeConfig = Record<FileType, FileTypeConfig>;
