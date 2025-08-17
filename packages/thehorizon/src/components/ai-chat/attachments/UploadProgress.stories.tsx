import type { Meta, StoryObj } from "@storybook/react";
import { UploadProgress } from "./UploadProgress";
import type { UploadItem } from "./UploadProgress";

const meta: Meta<typeof UploadProgress> = {
  title: "AI Chat/Attachments/UploadProgress",
  component: UploadProgress,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onCancel: { action: "cancelled" },
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof UploadProgress>;

const activeUploads: UploadItem[] = [
  {
    id: "1",
    name: "2024-my-portfolio.pdf",
    size: 12800000,
    type: "application/pdf",
    progress: 20,
    status: "uploading",
    uploadedSize: 2560000,
    speed: 1024000,
    remainingTime: 10,
  },
  {
    id: "2",
    name: "arthur-profile.jpeg",
    size: 2500000,
    type: "image/jpeg",
    progress: 60,
    status: "uploading",
    uploadedSize: 1500000,
    speed: 512000,
    remainingTime: 2,
  },
  {
    id: "3",
    name: "Cinema_4D_Project_File.zip",
    size: 20000000,
    type: "application/zip",
    progress: 100,
    status: "completed",
    uploadedSize: 20000000,
  },
];

const mixedUploads: UploadItem[] = [
  {
    id: "1",
    name: "Product_Catalog.pdf",
    size: 20000000,
    type: "application/pdf",
    progress: 100,
    status: "completed",
  },
  {
    id: "2",
    name: "Cinema_4D_Project_File.zip",
    size: 20000000,
    type: "application/zip",
    progress: 45,
    status: "uploading",
    uploadedSize: 9000000,
    speed: 2048000,
    remainingTime: 5,
  },
  {
    id: "3",
    name: "broken-file.txt",
    size: 1000,
    progress: 0,
    status: "error",
    error: "Network error",
  },
  {
    id: "4",
    name: "Blender_Project_File.zip",
    size: 300000000,
    type: "application/zip",
    progress: 50,
    status: "uploading",
    uploadedSize: 150000000,
    speed: 5120000,
    remainingTime: 30,
  },
];

export const ActiveUploads: Story = {
  args: {
    uploads: activeUploads,
    showIndividualProgress: true,
    showOverallProgress: true,
    cancellable: true,
    closable: true,
  },
};

export const MixedStatus: Story = {
  args: {
    uploads: mixedUploads,
    showIndividualProgress: true,
    showOverallProgress: true,
    cancellable: true,
    closable: true,
  },
};

export const CompactMode: Story = {
  args: {
    uploads: activeUploads.slice(0, 2),
    compact: true,
    closable: true,
  },
};

export const PreparingState: Story = {
  args: {
    uploads: [
      {
        id: "1",
        name: "large-video.mp4",
        size: 500000000,
        type: "video/mp4",
        progress: 0,
        status: "preparing",
      },
    ],
    showIndividualProgress: true,
  },
};

export const AllCompleted: Story = {
  args: {
    uploads: [
      {
        id: "1",
        name: "document1.pdf",
        size: 5000000,
        progress: 100,
        status: "completed",
      },
      {
        id: "2",
        name: "image.jpg",
        size: 2000000,
        progress: 100,
        status: "completed",
      },
      {
        id: "3",
        name: "video.mp4",
        size: 50000000,
        progress: 100,
        status: "completed",
      },
    ],
    showIndividualProgress: true,
    showOverallProgress: true,
  },
};

export const AllErrors: Story = {
  args: {
    uploads: [
      {
        id: "1",
        name: "failed1.pdf",
        size: 5000000,
        progress: 0,
        status: "error",
        error: "File too large",
      },
      {
        id: "2",
        name: "failed2.jpg",
        size: 2000000,
        progress: 0,
        status: "error",
        error: "Invalid file type",
      },
      {
        id: "3",
        name: "failed3.mp4",
        size: 50000000,
        progress: 0,
        status: "error",
        error: "Network timeout",
      },
    ],
    showIndividualProgress: true,
    showOverallProgress: true,
  },
};

export const SingleUpload: Story = {
  args: {
    uploads: [
      {
        id: "1",
        name: "single-file.pdf",
        size: 10000000,
        type: "application/pdf",
        progress: 35,
        status: "uploading",
        uploadedSize: 3500000,
        speed: 1536000,
        remainingTime: 4,
      },
    ],
    showIndividualProgress: true,
    showOverallProgress: false,
    cancellable: true,
  },
};

export const AutoHideCompleted: Story = {
  args: {
    uploads: activeUploads,
    autoHideCompleted: 2000, // Hide after 2 seconds
    showIndividualProgress: true,
    showOverallProgress: true,
  },
};

export const NoOverallProgress: Story = {
  args: {
    uploads: activeUploads,
    showIndividualProgress: true,
    showOverallProgress: false,
  },
};

export const NoIndividualProgress: Story = {
  args: {
    uploads: activeUploads,
    showIndividualProgress: false,
    showOverallProgress: true,
  },
};

export const NotCancellable: Story = {
  args: {
    uploads: activeUploads.slice(0, 2),
    cancellable: false,
    showIndividualProgress: true,
  },
};

export const CustomTitle: Story = {
  args: {
    uploads: activeUploads,
    title: "Uploading Project Files",
    showIndividualProgress: true,
    showOverallProgress: true,
  },
};