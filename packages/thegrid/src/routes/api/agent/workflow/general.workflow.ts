import { createGeneralAgent } from "@/agent/factories/GeneralAgent";
import { serviceRegistry } from "@/registry/service-registry";
import { userLogger } from "@/utils/logger";
import { getLastUserMessage, type ProgressMessage, transformMessagesForAI } from "@mrck-labs/grid-core";
import { SessionData } from "../../../../db/schema/sessions";
import { RequestContext } from "../requestContext";

export const generalWorkflow = async ({
  sessionData,
  // token,
  send,
}: {
  sessionData: SessionData;
  token: string;
  send: (message: ProgressMessage) => Promise<void>;
}) => {
  // Get context from RequestContext instead of prop drilling
  const conversationContext = RequestContext.get();

  const conversationHistory = await serviceRegistry.get("database").getConversationHistory(sessionData.conversationId);
  // Prepare messages for agents
  const messagesForAI = transformMessagesForAI(conversationHistory);

  const langfuse = serviceRegistry.get("langfuse");
  const span = langfuse.createSpanForSession(
    conversationContext.getSessionId(),
    "general-workflow",
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
    const agent = await createGeneralAgent();

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

    console.log("this is response ? ");
    console.log(response);

    await send({
      type: "llm_response",
      content: response?.content || "No response from agent",
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
