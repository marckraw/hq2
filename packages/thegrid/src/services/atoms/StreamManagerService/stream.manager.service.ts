import { SSEStreamingApi } from "hono/streaming";
import type { ProgressMessage } from "core.mrck.dev";
import type { ProgressMessage as GridCoreProgressMessage } from "@mrck-labs/grid-core";
import { userLogger } from "@/utils/logger";

type StreamEntry = {
  stream: SSEStreamingApi;
  isActive: boolean;
};

type FinalProgressMessage = GridCoreProgressMessage | ProgressMessage;

const createStreamManager = () => {
  const activeStreams = new Map<string, StreamEntry>();
  // Legacy token-based tracking for backward compatibility
  const legacyTokenStreams = new Map<string, { isActive: boolean }>();

  const addStream = (userId: string, stream: SSEStreamingApi) => {
    const streamState = { stream, isActive: true };
    activeStreams.set(userId, streamState);
    userLogger.log("[stream.manager.service.ts] func:addStream: activeStreams", {
      activeStreams,
    });
    return streamState;
  };

  const stopStream = (userId: string) => {
    const streamState = activeStreams.get(userId);
    if (streamState) {
      streamState.isActive = false;
      activeStreams.delete(userId);
      return true;
    }
    return false;
  };

  const isStreamActive = (userId: string) => {
    return activeStreams.get(userId)?.isActive ?? false;
  };

  const sendToUser = async (userId: string, data: FinalProgressMessage) => {
    const streamState = activeStreams.get(userId);
    if (!streamState || !streamState.isActive) return false;

    await streamState.stream.writeSSE({
      data: JSON.stringify(data),
    });

    return true;
  };

  const broadcast = (data: FinalProgressMessage) => {
    for (const [, streamState] of activeStreams) {
      if (streamState.isActive) {
        streamState.stream.writeSSE({
          data: JSON.stringify(data),
        });
      }
    }
  };

  // Factory methods from StreamService
  const createSender = (stream: SSEStreamingApi) => {
    return (data: FinalProgressMessage) => stream.writeSSE({ data: JSON.stringify(data) });
  };

  const createGridStreamSender = <T extends Partial<FinalProgressMessage>>(stream: SSEStreamingApi) => {
    return (data: T) => stream.writeSSE({ data: JSON.stringify(data) });
  };

  // Legacy compatibility methods for StreamService migration
  const addStreamLegacy = (token: string) => {
    const streamState = { isActive: true };
    userLogger.log("[stream.manager.service.ts] func:addStreamLegacy: legacyTokenStreams", {
      streamState,
      token,
    });
    legacyTokenStreams.set(token, streamState);
    userLogger.log("[stream.manager.service.ts] func:addStreamLegacy: legacyTokenStreams", {
      legacyTokenStreams: Object.fromEntries(legacyTokenStreams),
    });

    return streamState;
  };

  const stopStreamLegacy = (token: string) => {
    const streamState = legacyTokenStreams.get(token);
    if (streamState) {
      streamState.isActive = false;
      legacyTokenStreams.delete(token);
      return true;
    }
    return false;
  };

  const isStreamActiveLegacy = (token: string) => {
    return legacyTokenStreams.get(token)?.isActive ?? false;
  };

  // Stream statistics and management
  const getStreamStats = () => {
    return {
      activeUserStreams: activeStreams.size,
      activeLegacyStreams: legacyTokenStreams.size,
      totalActiveStreams: activeStreams.size + legacyTokenStreams.size,
    };
  };

  const getAllActiveStreamIds = () => {
    return {
      userStreams: Array.from(activeStreams.keys()),
      legacyStreams: Array.from(legacyTokenStreams.keys()),
    };
  };

  const cleanup = () => {
    // Close all active streams
    for (const [, streamState] of activeStreams) {
      if (streamState.isActive) {
        streamState.isActive = false;
      }
    }
    activeStreams.clear();
    legacyTokenStreams.clear();
  };

  // Unified API methods that handle both user streams and legacy token streams
  const addStreamUnified = (tokenOrUserId: string, stream?: SSEStreamingApi) => {
    if (stream) {
      // New API: addStream(userId, stream)
      return addStream(tokenOrUserId, stream);
    } else {
      // Legacy API: addStream(token)
      return addStreamLegacy(tokenOrUserId);
    }
  };

  const stopStreamUnified = (tokenOrUserId: string) => {
    // Try user streams first, then legacy
    return stopStream(tokenOrUserId) || stopStreamLegacy(tokenOrUserId);
  };

  const isStreamActiveUnified = (tokenOrUserId: string) => {
    // Try user streams first, then legacy
    return isStreamActive(tokenOrUserId) || isStreamActiveLegacy(tokenOrUserId);
  };

  return {
    // Unified API (handles both user streams and legacy token streams)
    addStream: addStreamUnified,
    stopStream: stopStreamUnified,
    isStreamActive: isStreamActiveUnified,

    // Core stream management methods
    sendToUser,
    broadcast,

    // Factory methods (from StreamService)
    createSender,
    createGridStreamSender,

    // Direct access methods (for specific use cases)
    addUserStream: addStream,
    stopUserStream: stopStream,
    isUserStreamActive: isStreamActive,
    addLegacyStream: addStreamLegacy,
    stopLegacyStream: stopStreamLegacy,
    isLegacyStreamActive: isStreamActiveLegacy,

    // Utility methods
    getStreamStats,
    getAllActiveStreamIds,
    cleanup,
  };
};

export const streamManager = createStreamManager();
