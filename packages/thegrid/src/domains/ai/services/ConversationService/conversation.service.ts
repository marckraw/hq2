import { AIMessage } from "../../../../additional-types";
import {
  DatabaseService,
  databaseService,
} from "../../../../services/atoms/DatabaseService/database.service";

export const createConversationService = ({
  databaseService,
}: {
  databaseService: DatabaseService;
}) => {
  // Public methods
  const test = async () => {
    return "stub";
  };

  const addMessage = async ({
    message,
    conversationId,
  }: {
    message: AIMessage;
    conversationId: number;
  }) => {
    // Extract only the fields we need for the database
    const messageData = {
      conversationId,
      role: message.role,
      content: message.content,
      // TODO: fix this
      // @ts-ignore
      ...(message.tool_call_id ? { tool_call_id: message.tool_call_id } : {}), // Only include tool_call_id if it exists
    };

    // TODO: fix this
    // @ts-ignore
    return await databaseService.addMessage(messageData);
  };

  const saveToolResponse = async ({
    toolCallId,
    toolResponse,
    conversationId,
  }: {
    toolCallId: string;
    toolResponse: string;
    conversationId: number;
  }) => {
    return addMessage({
      message: {
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCallId,
      },
      conversationId,
    });
  };

  const addAttachments = async ({
    conversationId,
    attachments,
  }: {
    conversationId: number;
    attachments: Array<{
      name: string;
      type: string;
      url: string;
      size?: number;
    }>;
  }) => {
    const savedAttachments = [];
    
    for (const attachment of attachments) {
      // Calculate size from base64 if not provided
      // For S3 URLs, we'll use a default size for now
      const size = attachment.size || 0;
      
      const savedAttachment = await databaseService.addAttachment({
        conversationId,
        name: attachment.name,
        type: attachment.type,
        size,
        dataUrl: attachment.url, // The S3 URL goes in dataUrl field
      });
      
      savedAttachments.push(savedAttachment);
    }
    
    return savedAttachments;
  };

  // Return public interface
  return {
    test,
    saveToolResponse,
    addMessage,
    addAttachments,
  };
};

export const conversationService = createConversationService({
  databaseService,
});

export type ConversationService = typeof conversationService;
