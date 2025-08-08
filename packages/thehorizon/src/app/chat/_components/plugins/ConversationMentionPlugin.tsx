import { MessageSquare, Clock } from "lucide-react";

// Mock conversation data - in real app this would come from your API
const mockConversations = [
  {
    id: 1,
    title: "React state management discussion",
    updatedAt: "2024-01-15T10:30:00Z",
    messageCount: 12,
  },
  {
    id: 2,
    title: "Database schema design",
    updatedAt: "2024-01-14T15:45:00Z",
    messageCount: 8,
  },
  {
    id: 3,
    title: "API endpoint optimization",
    updatedAt: "2024-01-13T09:20:00Z",
    messageCount: 15,
  },
];

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};

export const createConversationMentionPlugin = (
  fetchConversations?: () => Promise<any[]>
): any => ({
  trigger: "#",
  name: "conversations",
  description: "Mention conversations",
  search: async (query: string): Promise<any[]> => {
    // In real app, use fetchConversations if provided, otherwise fall back to mock
    const conversations = fetchConversations
      ? await fetchConversations()
      : mockConversations;

    return conversations
      .filter((conv) => conv.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5) // Limit to 5 results
      .map((conv) => ({
        id: conv.id.toString(),
        type: "conversation",
        title: conv.title,
        description: `${conv.messageCount || 0} messages • ${formatRelativeTime(
          conv.updatedAt
        )}`,
        icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
        insertText: `[Conversation: ${conv.title}](#conversation-${conv.id})`,
        data: conv,
      }));
  },
  onSelect: (item: any) => {
    return item.insertText || `#${item.title}`;
  },
});

// File mention plugin example
export const createFileMentionPlugin = (
  searchFiles?: (query: string) => Promise<any[]>
): any => ({
  trigger: "@",
  name: "files",
  description: "Mention files",
  search: async (query: string): Promise<any[]> => {
    // Mock file data - replace with real file search
    const mockFiles = [
      {
        path: "src/components/Chat/ChatArea.tsx",
        type: "tsx",
        size: "4.2kb",
        lastModified: "2024-01-15T10:30:00Z",
      },
      {
        path: "packages/thegrid/src/routes/api/chat/chat.ts",
        type: "ts",
        size: "8.1kb",
        lastModified: "2024-01-15T09:15:00Z",
      },
    ];

    const files = searchFiles ? await searchFiles(query) : mockFiles;

    return files
      .filter((file) => file.path.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
      .map((file) => ({
        id: file.path,
        type: "file",
        title: file.path.split("/").pop() || file.path,
        description: `${file.path} • ${file.size}`,
        icon: <Clock className="h-4 w-4 text-green-500" />,
        insertText: `@[${file.path}]`,
        data: file,
      }));
  },
  onSelect: (item: any) => {
    return item.insertText || `@${item.title}`;
  },
});
