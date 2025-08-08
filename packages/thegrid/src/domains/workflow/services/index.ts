import { pipelineService } from "./pipeline.service";
import { approvalService } from "./approval.service";
import { signalService } from "./signal.service";
import { serviceRegistry } from "../../../registry/service-registry";

import type { PipelineService } from "./pipeline.service";
import type { ApprovalService } from "./approval.service";
import type { SignalService } from "./signal.service";

// Register workflow services with the service registry
serviceRegistry.register("pipeline", () => pipelineService);
serviceRegistry.register("approval", () => approvalService);
serviceRegistry.register("signal", () => signalService);

const createWorkflowServices = () => {
  return {
    pipeline: () => pipelineService,
    approval: () => approvalService,
    signal: () => signalService,
  };
};

export const workflowServices = createWorkflowServices();

// Individual exports for convenience
export const { pipeline, approval, signal } = workflowServices;

// Type exports
export type WorkflowServices = {
  pipeline: PipelineService;
  approval: ApprovalService;
  signal: SignalService;
};
