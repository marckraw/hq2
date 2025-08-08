import { serviceRegistry } from "../../../registry/service-registry";

// ✅ Modern ES module imports with proper types
import { notificationService } from "./notification.service";
import { slackService } from "./slack.service";
import { createAudioService } from "./AudioService";
import { createElevenLabsService } from "./ElevenLabsService";

// Register communication services
const registerCommunicationServices = () => {
  // ✅ Option 1: Register existing instances (eager loading)
  serviceRegistry.register("notification", () => notificationService);
  serviceRegistry.register("slack", () => slackService);

  // ✅ Option 2: Register factory functions (true lazy loading)
  serviceRegistry.registerLazy("audio", createAudioService);
  serviceRegistry.registerLazy("elevenlabs", createElevenLabsService);
};

// Domain-specific service accessors (functional style)
const createCommunicationServices = () => {
  const notification = () => serviceRegistry.get("notification");
  const slack = () => serviceRegistry.get("slack");
  const audio = () => serviceRegistry.get("audio");
  const elevenlabs = () => serviceRegistry.get("elevenlabs");

  return {
    notification,
    slack,
    audio,
    elevenlabs,
  };
};

// Initialize services on import
registerCommunicationServices();

// Export domain services
export const communicationServices = createCommunicationServices();

// Export individual service accessors for convenience
export const { notification, slack, audio, elevenlabs } = communicationServices;
