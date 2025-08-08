import { logger } from "@/utils/logger";
// Example usage of drizzle-zod schemas
// This demonstrates that the drizzle-zod integration is working correctly

import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { conversations, messages, pipelines } from "./schema";

// Create Zod schemas from Drizzle schemas
const ConversationSelectSchema = createSelectSchema(conversations);
const ConversationInsertSchema = createInsertSchema(conversations);
const ConversationUpdateSchema = createUpdateSchema(conversations);

const MessageSelectSchema = createSelectSchema(messages);
const MessageInsertSchema = createInsertSchema(messages);

const PipelineSelectSchema = createSelectSchema(pipelines);
const PipelineInsertSchema = createInsertSchema(pipelines);

// Example validation functions
export const validateConversationData = (data: unknown) => {
  const result = ConversationInsertSchema.safeParse(data);
  if (result.success) {
    logger.info("Valid conversation data:", result.data);
    return result.data;
  } else {
    logger.error("Invalid conversation data:", result.error.format());
    return null;
  }
};

export const validateMessageData = (data: unknown) => {
  const result = MessageInsertSchema.safeParse(data);
  if (result.success) {
    logger.info("Valid message data:", result.data);
    return result.data;
  } else {
    logger.error("Invalid message data:", result.error.format());
    return null;
  }
};

export const validatePipelineData = (data: unknown) => {
  const result = PipelineInsertSchema.safeParse(data);
  if (result.success) {
    logger.info("Valid pipeline data:", result.data);
    return result.data;
  } else {
    logger.error("Invalid pipeline data:", result.error.format());
    return null;
  }
};

// Example usage:
//
// const conversationData = {
//   title: "New Conversation",
//   systemMessage: "You are a helpful assistant"
// };
//
// const validConversation = validateConversationData(conversationData);
// if (validConversation) {
//   // Use the validated data (it's properly typed)
//   logger.info(validConversation.title);
// }

export {
  ConversationSelectSchema,
  ConversationInsertSchema,
  ConversationUpdateSchema,
  MessageSelectSchema,
  MessageInsertSchema,
  PipelineSelectSchema,
  PipelineInsertSchema,
};
