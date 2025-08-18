import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "./FileUpload";
import type { FileUploadProps, FileInfo } from "./FileUpload";
import React from "react";

const meta: Meta<typeof FileUpload> = {
  title: "AI Chat/Attachments/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onFilesSelected: { action: "files-selected" },
    onFileRemove: { action: "file-removed" },
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

// Wrapper component for stateful stories
const FileUploadWithState = (args: FileUploadProps) => {
  const [files, setFiles] = React.useState<FileInfo[]>(args.files || []);

  const handleFilesSelected = (newFiles: FileInfo[]) => {
    setFiles([...files, ...newFiles]);
    args.onFilesSelected?.(newFiles);
  };

  const handleFileRemove = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    args.onFileRemove?.(id);
  };

  return (
    <div className="w-[400px]">
      <FileUpload
        {...args}
        files={files}
        onFilesSelected={handleFilesSelected}
        onFileRemove={handleFileRemove}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    accept: "*",
    maxSize: 5 * 1024 * 1024,
    maxFiles: 10,
    multiple: true,
    dragDropEnabled: true,
    showFileList: true,
  },
};

export const CompactMode: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    compact: true,
    maxFiles: 5,
  },
};

export const ImageOnly: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    accept: "image/*",
    uploadText: "Drop images here or browse",
    maxSize: 2 * 1024 * 1024,
  },
};

export const PDFOnly: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    accept: "application/pdf",
    uploadText: "Drop PDF files here or browse",
    maxSize: 10 * 1024 * 1024,
  },
};

export const SingleFile: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    multiple: false,
    maxFiles: 1,
    uploadText: "Drop a file here or browse",
  },
};

export const LargeFileLimit: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    maxSize: 100 * 1024 * 1024, // 100MB
    uploadText: "Drop large files here (up to 100MB)",
  },
};

export const WithExistingFiles: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    files: [
      {
        id: "existing-1",
        name: "existing-document.pdf",
        size: 2500000,
        type: "application/pdf",
      },
      {
        id: "existing-2",
        name: "existing-image.jpg",
        size: 1200000,
        type: "image/jpeg",
      },
    ],
    maxFiles: 5,
  },
};

export const Disabled: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    disabled: true,
    uploadText: "Upload disabled",
  },
};

export const WithError: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    error: "File size exceeds maximum limit",
  },
};

export const NoDragDrop: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    dragDropEnabled: false,
    uploadText: "Click to browse files",
  },
};

export const NoFileList: Story = {
  render: (args) => <FileUploadWithState {...args} />,
  args: {
    showFileList: false,
    files: [
      {
        id: "1",
        name: "hidden-file.pdf",
        size: 1000000,
        type: "application/pdf",
      },
    ],
  },
};