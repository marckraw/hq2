import type { Meta, StoryObj } from "@storybook/react";
import { DocumentAttachment } from "./DocumentAttachment";

const meta: Meta<typeof DocumentAttachment> = {
  title: "AI Chat/D. Interactive/Attachments/DocumentAttachment",
  component: DocumentAttachment,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["pdf", "image", "video", "audio", "link", "file"],
    },
    onRemove: { action: "removed" },
    onPreview: { action: "previewed" },
    onDownload: { action: "downloaded" },
  },
};

export default meta;
type Story = StoryObj<typeof DocumentAttachment>;

export const PDFDocument: Story = {
  args: {
    id: "1",
    name: "Dune-7-Fremen-Utopia-Draft-9.2.pdf",
    type: "pdf",
    size: 3200000,
    removable: true,
    previewable: true,
    downloadable: true,
  },
};

export const ImageDocument: Story = {
  args: {
    id: "2",
    name: "Dune-Fremen-Utopia-Cover-Draft.jpg",
    type: "image",
    size: 1500000,
    thumbnail: "https://via.placeholder.com/100",
    removable: true,
    previewable: true,
    downloadable: true,
  },
};

export const LinkDocument: Story = {
  args: {
    id: "3",
    name: "www.wikipedia.org/wiki/List_of_Dune_characters",
    type: "link",
    url: "https://www.wikipedia.org/wiki/List_of_Dune_characters",
    removable: true,
    previewable: false,
    downloadable: false,
  },
};

export const CompactMode: Story = {
  args: {
    id: "4",
    name: "Product_Catalog.pdf",
    type: "pdf",
    size: 20000000,
    compact: true,
    removable: true,
  },
};

export const LoadingState: Story = {
  args: {
    id: "5",
    name: "Cinema_4D_Project_File.zip",
    type: "file",
    size: 20000000,
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    id: "6",
    name: "broken-file.txt",
    type: "file",
    size: 1000,
    error: "Failed to upload",
  },
};

export const VideoDocument: Story = {
  args: {
    id: "7",
    name: "presentation.mp4",
    type: "video",
    size: 150000000,
    removable: true,
    previewable: true,
    downloadable: true,
  },
};

export const AudioDocument: Story = {
  args: {
    id: "8",
    name: "podcast-episode.mp3",
    type: "audio",
    size: 8500000,
    removable: true,
    previewable: true,
    downloadable: true,
  },
};

export const NoActions: Story = {
  args: {
    id: "9",
    name: "readonly-document.pdf",
    type: "pdf",
    size: 1200000,
    removable: false,
    previewable: false,
    downloadable: false,
  },
};