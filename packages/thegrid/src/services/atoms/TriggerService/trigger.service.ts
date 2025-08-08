import { z } from 'zod';
import { serviceRegistry } from '@/registry/service-registry';
import { logger } from '@/utils/logger';

export const TriggerEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.string(),
  data: z.any().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type TriggerEvent = z.infer<typeof TriggerEventSchema>;

export const createTriggerService = () => {
  const triggers: TriggerEvent[] = [];
  const maxTriggers = 100;
  const triggerStreams = new Map<string, { type: string }>();
  
  const getStreamManager = () => serviceRegistry.get('streamManager');

  const broadcastTrigger = (trigger: TriggerEvent) => {
    // Broadcast to all active trigger streams
    for (const [streamToken, streamInfo] of triggerStreams) {
      if (streamInfo.type === 'trigger' && getStreamManager().isStreamActive(streamToken)) {
        try {
          // Since we can't send directly to a token-based stream,
          // we'll need to handle this in the SSE endpoint
          logger.info('Trigger event ready for stream', { streamToken, triggerId: trigger.id });
        } catch (error) {
          logger.error('Failed to broadcast trigger', {
            streamToken,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }
  };

  const recordTrigger = (trigger: Omit<TriggerEvent, 'id' | 'timestamp'>): TriggerEvent => {
    const newTrigger: TriggerEvent = {
      ...trigger,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    triggers.unshift(newTrigger);
    
    if (triggers.length > maxTriggers) {
      triggers.splice(maxTriggers);
    }

    broadcastTrigger(newTrigger);
    
    logger.info('Trigger recorded', { 
      triggerId: newTrigger.id, 
      type: newTrigger.type 
    });
    
    return newTrigger;
  };

  const getTriggers = (): TriggerEvent[] => {
    return triggers;
  };

  const clearTriggers = (): void => {
    triggers.length = 0;
    logger.info('All triggers cleared');
  };

  const getTriggerById = (id: string): TriggerEvent | undefined => {
    return triggers.find(trigger => trigger.id === id);
  };

  const initializeStream = (): string => {
    const streamToken = crypto.randomUUID();
    // Store the stream info in our local map
    triggerStreams.set(streamToken, { type: 'trigger' });
    // Add to legacy stream tracking
    getStreamManager().addStream(streamToken);
    
    logger.info('Trigger stream initialized', { streamToken });
    
    return streamToken;
  };
  
  const getStream = (streamToken: string): { type: string } | undefined => {
    return triggerStreams.get(streamToken);
  };
  
  const removeStream = (streamToken: string): void => {
    triggerStreams.delete(streamToken);
    getStreamManager().stopStream(streamToken);
  };
  
  const getLatestTrigger = (): TriggerEvent | undefined => {
    return triggers[0];
  };

  const getAllStreams = (): Record<string, { type: string }> => {
    return Object.fromEntries(triggerStreams);
  };

  return {
    recordTrigger,
    getTriggers,
    clearTriggers,
    getTriggerById,
    initializeStream,
    getStream,
    removeStream,
    getLatestTrigger,
    getAllStreams,
  };
};

export const triggerService = createTriggerService();