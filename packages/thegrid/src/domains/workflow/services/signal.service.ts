import { db } from "../../../db";
import { signals } from "../../../db/schema/signals";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";
import { eventBus } from "../../../eda/events/event-bus";

export const createSignalService = () => {
  const createBaseSignal = (data: {
    source: string;
    type: string;
    payload: unknown;
    metadata?: Record<string, unknown>;
  }) => ({
    id: uuidv4(),
    timestamp: new Date(),
    source: data.source,
    metadata: data.metadata || {},
  });

  const storeSignal = async (data: {
    source: string;
    type: string;
    payload: unknown;
    metadata?: Record<string, unknown>;
  }) => {
    const baseSignal = createBaseSignal(data);

    await db.insert(signals).values({
      id: baseSignal.id,
      timestamp: baseSignal.timestamp,
      source: baseSignal.source,
      type: data.type,
      payload: data.payload,
      metadata: data.metadata || null,
    });

    // Send to stream if active
    // if (streamManager.isStreamActive("1")) {
    //   await streamManager.sendToUser("1", streamMessage);
    // }

    // Emit through event bus
    await eventBus.emit(`${data.source}.${data.type}` as any, data.payload);

    return baseSignal;
  };

  const findSignalById = async (id: string) => {
    const result = await db
      .select()
      .from(signals)
      .where(eq(signals.id, id))
      .limit(1);

    return result[0] || null;
  };

  const listSignals = async (options?: { limit?: number; offset?: number }) => {
    return await db
      .select()
      .from(signals)
      .orderBy(desc(signals.timestamp))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
  };

  return {
    storeSignal,
    findSignalById,
    listSignals,
  };
};

export const signalService = createSignalService();

export type SignalService = typeof signalService;
