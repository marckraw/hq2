import { createSonomaAgent } from "@/agent/factories/SonomaAgent";
import { serviceRegistry } from "@/registry/service-registry";
import { userLogger } from "@/utils/logger";
import { getLastUserMessage, type ProgressMessage, transformMessagesForAI } from "@mrck-labs/grid-core";
import { SessionData } from "../../../../db/schema/sessions";
import { RequestContext } from "../requestContext";

export const sonomaWorkflow = async ({
  sessionData,
  // token,
  send,
}: {
  sessionData: SessionData;
  token: string;
  send: (message: ProgressMessage) => Promise<void>;
}) => {
  const conversationContext = RequestContext.get();

  const conversationHistory = await serviceRegistry.get("database").getConversationHistory(sessionData.conversationId);
  const messagesForAI = transformMessagesForAI(conversationHistory);

  const langfuse = serviceRegistry.get("langfuse");
  const span = langfuse.createSpanForSession(
    conversationContext.getSessionId(),
    "sonoma-workflow",
    { conversationId: sessionData.conversationId },
    messagesForAI
  );

  try {
    const agentCreationSpan = langfuse.createSpanForSession(conversationContext.getSessionId(), "agent-creation", {
      agentType: conversationContext.getState().agentType,
      startTime: new Date().toISOString(),
    });

    // Create Sonoma agent
    const agent = await createSonomaAgent();

    if (agent.setSendUpdate) {
      agent.setSendUpdate(async (data) => {
        await send(data as any);
      });
    }

    agentCreationSpan?.end({
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

    langfuse.addEventToSession(conversationContext.getSessionId(), "agent-creation-completed", {
      agentId: agent.id,
      agentType: agent.type,
      toolsLoaded: agent.availableTools.length,
    });

    const lastUserMessage = getLastUserMessage(messagesForAI);
    await send({ type: "user_message", content: lastUserMessage.content || "" });

    const response = await agent.act({
      messages: [{ role: "user" as const, content: conversationContext.getState().message.content }],
      context: {
        userMessage: conversationContext.getState().message.content,
        conversationId: String(conversationContext.getState().conversationId),
        conversationHistory: messagesForAI,
        sessionToken: conversationContext.getSessionId(),
        sessionData: conversationContext.getState(),
      },
    });

    await send({ type: "llm_response", content: response?.content || "No response from agent" });

    span?.end();
    await send({ type: "finished", content: "Finished generation!" });
  } catch (error) {
    userLogger.log("[sonoma.workflow.ts] error", { error: String(error) });
    await send({ type: "error", content: "Error in sonoma workflow" });
  }
};
