export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
  dataUrl?: string;
}
