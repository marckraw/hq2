import { serviceRegistry } from "../../../registry/service-registry";

// ✅ Modern ES module imports
import { databaseService } from "../../../services/atoms/DatabaseService/database.service";
import { sessionService } from "../../../services/atoms/SessionService/session.service";
import { streamManager } from "../../../services/atoms/StreamManagerService/stream.manager.service";
import { awsService } from "../../integration/services/AWS/aws.service";
import { imageService } from "../../../services/atoms/ImageService/image.service";
import { fileTransferService } from "../../../services/atoms/FileTransferService/file-transfer.service";
import { createSettingsService } from "../../../services/atoms/SettingsService/settings.service";
import { triggerService } from "../../../services/atoms/TriggerService/trigger.service";

// Agent services
import { agentService } from "../../../agent/services/AgentService/agent.service";
import { agentFlowService } from "../../../agent/services/AgentFlowService/agent-flow.service";
import { evaluationService } from "../../../services/EvaluationService/evaluation.service";
import { toolRunnerService } from "../../../services/atoms/ToolRunnerService/toolRunner.service";

// DiffService
import { createDiffService } from "../../../services/atoms/DiffService";

// Register core services
const registerCoreServices = () => {
  // Core infrastructure services
  serviceRegistry.register("database", () => databaseService);
  serviceRegistry.register("session", () => sessionService);
  serviceRegistry.register("stream", () => streamManager);
  serviceRegistry.register("streamManager", () => streamManager);
  serviceRegistry.register("aws", () => awsService);
  serviceRegistry.register("image", () => imageService);
  serviceRegistry.register("fileTransfer", () => fileTransferService);
  serviceRegistry.registerLazy("settings", createSettingsService);
  serviceRegistry.register("trigger", () => triggerService);

  // Agent services
  serviceRegistry.register("agent", () => agentService);
  serviceRegistry.register("agentFlow", () => agentFlowService);
  serviceRegistry.register("evaluation", () => evaluationService);
  serviceRegistry.register("toolRunner", () => toolRunnerService);
  serviceRegistry.registerLazy("diff", createDiffService);
};

// Domain-specific service accessors (functional style)
const createCoreServices = () => {
  return {
    database: () => databaseService,
    session: () => sessionService,
    stream: () => streamManager,
    aws: () => awsService,
    image: () => imageService as typeof imageService,
    fileTransfer: () => fileTransferService,
    settings: createSettingsService,
    trigger: () => triggerService,
    agent: () => agentService,
    agentFlow: () => agentFlowService,
    evaluation: () => evaluationService,
    toolRunner: () => toolRunnerService,
    diff: createDiffService,
  };
};

// Initialize services on import
registerCoreServices();

// Export domain services
export const coreServices = createCoreServices();

// Individual exports for convenience
export const {
  database,
  session,
  stream,
  aws,
  image,
  fileTransfer,
  settings,
  trigger,
  agent,
  agentFlow,
  evaluation,
  toolRunner,
  diff,
} = coreServices;

// Type exports
export type CoreServices = {
  database: typeof databaseService;
  session: typeof sessionService;
  stream: typeof streamManager;
  aws: typeof awsService;
  image: typeof imageService;
  fileTransfer: typeof fileTransferService;
  settings: ReturnType<typeof createSettingsService>;
  trigger: typeof triggerService;
  agent: typeof agentService;
  agentFlow: typeof agentFlowService;
  evaluation: typeof evaluationService;
  toolRunner: typeof toolRunnerService;
  diff: ReturnType<typeof createDiffService>;
};
