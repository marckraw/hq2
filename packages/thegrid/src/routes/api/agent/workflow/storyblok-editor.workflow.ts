import { userLogger } from "@/utils/logger";
import { transformMessagesForAI, getLastUserMessage } from "@mrck-labs/grid-core";
import type { ProgressMessage } from "@mrck-labs/grid-core";
import { SessionData } from "../../../../db/schema/sessions";
// import { createWorkflow } from "@mrck-labs/grid-workflows";
// import { agentFactory } from "../../../../agent/factories/agents.factory";
import { serviceRegistry } from "@/registry/service-registry";
import { createStoryblokEditorAgent } from "@/agent/factories/StoryblokEditorAgent";
import { RequestContext } from "../requestContext";

export const storyblokEditorWorkflow = async ({
  sessionData,
  token: _token,
  send,
}: {
  sessionData: SessionData;
  token: string;
  send: (message: ProgressMessage) => Promise<void>;
}) => {
  // Get context from RequestContext instead of prop drilling
  const conversationContext = RequestContext.get();

  userLogger.log("[hq.ef.design] [storyblok-editor.workflow.ts] conversationContext from RequestContext", {
    sessionId: conversationContext.getSessionId(),
    conversationId: conversationContext.getSnapshot().metadata.conversationId,
  });
  userLogger.log("[hq.ef.design] [storyblok-editor.workflow.ts] Starting workflow");
  const conversationHistory = await serviceRegistry.get("database").getConversationHistory(sessionData.conversationId);
  userLogger.log("[hq.ef.design] [storyblok-editor.workflow.ts] Conversation history", {
    conversationHistory,
  });
  // Prepare messages for agents
  const messagesForAI = transformMessagesForAI(conversationHistory);
  userLogger.log("[hq.ef.design] [storyblok-editor.workflow.ts] Messages for AI", {
    messagesForAI,
  });

  const langfuse = serviceRegistry.get("langfuse");
  const span = langfuse.createSpanForSession(
    conversationContext.getSessionId(),
    "storyblok-editor-workflow",
    {
      conversationId: sessionData.conversationId,
    },
    messagesForAI
  );

  try {
    const agentCreationSpan = langfuse.createSpanForSession(conversationContext.getSessionId(), "agent-creation", {
      agentType: conversationContext.getState().agentType,
      startTime: new Date().toISOString(),
    });
    // const agent = await agentFactory.createAgent(sessionData.agentType as any);
    const agent = await createStoryblokEditorAgent();

    if (agent.setSendUpdate) {
      agent.setSendUpdate(async (data) => {
        // Type assertion to handle the mismatch between agent and workflow message types
        await send(data as any);
      });
    }

    if (agentCreationSpan) {
      agentCreationSpan.end({
        output: {
          agentId: agent.id,
          agentType: agent.type,
          availableToolsCount: agent.availableTools.length,
        },
        metadata: {
          endTime: new Date().toISOString(),
          success: true,
          toolsLoaded: agent.availableTools.length,
        },
      });
    }

    // Add agent creation event
    langfuse.addEventToSession(conversationContext.getSessionId(), "agent-creation-completed", {
      agentId: agent.id,
      agentType: agent.type,
      toolsLoaded: agent.availableTools.length,
    });

    const lastUserMessage = getLastUserMessage(messagesForAI);

    await send({
      type: "user_message",
      content: lastUserMessage.content || "",
    });

    const agentActSpan = langfuse.createSpanForSession(conversationContext.getSessionId(), "agent-act", {
      agentType: conversationContext.getState().agentType,
      autonomousMode: conversationContext.getState().autonomousMode,
      startTime: new Date().toISOString(),
    });

    const response = await agent.act({
      messages: [
        {
          role: "user",
          content: conversationContext.getState().message.content,
        },
      ],
      context: {
        userMessage: conversationContext.getState().message.content,
        conversationId: String(conversationContext.getState().conversationId),
        conversationHistory: messagesForAI,
        sessionToken: conversationContext.getSessionId(),
        sessionData: conversationContext.getState(),
      },
    });

    if (agentActSpan) {
      agentActSpan.end({
        output: {
          agentId: agent.id,
          agentType: agent.type,
          availableToolsCount: agent.availableTools.length,
        },
      });
    }

    await send({
      // @ts-ignore
      type: "partial_update",
      content: "Successfully generated the storyblok content",
      metadata: {
        approvalId: "123", // for now just mock
        rawResponse: response.content,
      },
    });

    span?.end();
    await send({
      type: "finished",
      content: "Finished generation!",
    });
  } catch (error) {
    userLogger.log("[storyblok-editor.workflow.ts] some error here", {
      name: "some error here",
    });
    await send({
      type: "error",
      content: "Error in storyblok editor workflow",
    });
  }
};
