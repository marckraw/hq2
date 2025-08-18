import type { Meta, StoryObj } from "@storybook/react";
import { AttachmentList } from "./AttachmentList";
import type { DocumentAttachmentProps } from "./DocumentAttachment";

const meta: Meta<typeof AttachmentList> = {
  title: "AI Chat/Attachments/AttachmentList",
  component: AttachmentList,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["horizontal", "vertical", "grid"],
    },
    onRemove: { action: "removed" },
    onPreview: { action: "previewed" },
    onDownload: { action: "downloaded" },
  },
};

export default meta;
type Story = StoryObj<typeof AttachmentList>;

const sampleAttachments: DocumentAttachmentProps[] = [
  {
    id: "1",
    name: "Dune-7-Fremen-Utopia-Draft-9.2.pdf",
    type: "pdf",
    size: 3200000,
    removable: true,
    previewable: true,
    downloadable: true,
  },
  {
    id: "2",
    name: "Dune-Fremen-Utopia-Cover-Draft.jpg",
    type: "image",
    size: 1500000,
    thumbnail: "https://via.placeholder.com/100",
    removable: true,
    previewable: true,
    downloadable: true,
  },
  {
    id: "3",
    name: "www.wikipedia.org/wiki/List_of_Dune_characters",
    type: "link",
    url: "https://www.wikipedia.org/wiki/List_of_Dune_characters",
    removable: true,
  },
  {
    id: "4",
    name: "Product_Catalog.pdf",
    type: "pdf",
    size: 20000000,
    removable: true,
    previewable: true,
    downloadable: true,
  },
  {
    id: "5",
    name: "Cinema_4D_Project_File.zip",
    type: "file",
    size: 20000000,
    removable: true,
    downloadable: true,
  },
];

export const VerticalLayout: Story = {
  args: {
    attachments: sampleAttachments,
    direction: "vertical",
    title: "References",
    showCount: true,
    maxVisible: 3,
  },
};

export const HorizontalLayout: Story = {
  args: {
    attachments: sampleAttachments,
    direction: "horizontal",
    title: "Attached Files",
    showCount: true,
    maxVisible: 3,
  },
};

export const GridLayout: Story = {
  name: "Grid Layout (Compact)",
  args: {
    attachments: sampleAttachments,
    direction: "grid",
    compact: true,
    title: "References",
    showCount: true,
    maxVisible: 4,
  },
};

export const EmptyState: Story = {
  args: {
    attachments: [],
    emptyMessage: "No documents attached",
  },
};

export const SingleAttachment: Story = {
  args: {
    attachments: [sampleAttachments[0]],
    showCount: false,
  },
};

export const ManyAttachments: Story = {
  name: "Many Attachments with Expansion",
  args: {
    attachments: [
      ...sampleAttachments,
      {
        id: "6",
        name: "research-paper.pdf",
        type: "pdf",
        size: 4500000,
        removable: true,
        previewable: true,
        downloadable: true,
      },
      {
        id: "7",
        name: "data-analysis.xlsx",
        type: "file",
        size: 2300000,
        removable: true,
        downloadable: true,
      },
      {
        id: "8",
        name: "presentation.pptx",
        type: "file",
        size: 8900000,
        removable: true,
        previewable: true,
        downloadable: true,
      },
    ],
    direction: "vertical",
    title: "Project Files",
    showCount: true,
    maxVisible: 3,
  },
};

export const CompactGrid: Story = {
  args: {
    attachments: sampleAttachments.slice(0, 3),
    direction: "grid",
    compact: true,
    showCount: false,
  },
};

export const NoEditMode: Story = {
  name: "Read-only Mode",
  args: {
    attachments: sampleAttachments.slice(0, 3),
    direction: "vertical",
    editable: false,
    title: "Attached Documents",
  },
};