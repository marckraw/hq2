import { logger } from "@/utils/logger";
import { serviceRegistry } from "../../../registry/service-registry";
import { releaseAgentService } from "../../../services/atoms/ReleaseAgentService/release-agent.service";
import { wait } from "../../../utils";

interface ReleaseReadyEventPayload {
  repoOwner: string;
  repoName: string;
  prNumber: string;
}

export const releaseReadyEventHandler = async (
  payload: ReleaseReadyEventPayload
) => {
  const { repoOwner, repoName, prNumber } = payload;

  // Get services from registry
  const pipelineService = serviceRegistry.get("pipeline");
  const githubService = serviceRegistry.get("github");
  const approvalService = serviceRegistry.get("approval");
  const notificationService = serviceRegistry.get("notification");
  const slackService = serviceRegistry.get("slack");

  try {
    // Create a pipeline for this release
    const pipeline = await pipelineService.createPipeline({
      name: `Release Pipeline for ${repoOwner}/${repoName} PR #${prNumber}`,
      description: "Creating and validating release changelog",
      source: "release",
      type: "changelog",
      metadata: { repoOwner, repoName, prNumber },
    });

    if (!pipeline) {
      throw new Error("Failed to create pipeline");
    }

    // Step 1: Get PR commits
    const getCommitsStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Get PR Commits",
      description: "Fetching commits from the pull request",
    });

    if (!getCommitsStep) {
      throw new Error("Failed to create get commits step");
    }

    await pipelineService.updatePipelineStep(getCommitsStep.id, {
      status: "in_progress",
      startedAt: new Date(),
    });
    await wait(3000);
    const commits = await githubService.getPullRequestCommits(
      repoOwner,
      repoName,
      prNumber
    );
    await pipelineService.updatePipelineStep(getCommitsStep.id, {
      status: "completed",
      completedAt: new Date(),
      duration: "1s",
    });

    // Step 2: Get PR details
    const getPRDetailsStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Get PR Details",
      description: "Fetching pull request details",
    });

    if (!getPRDetailsStep) {
      throw new Error("Failed to create get PR details step");
    }

    await pipelineService.updatePipelineStep(getPRDetailsStep.id, {
      status: "in_progress",
      startedAt: new Date(),
    });
    await wait(3000);
    const prDetails = await githubService.getPullRequestDetails(
      repoOwner,
      repoName,
      prNumber
    );
    await pipelineService.updatePipelineStep(getPRDetailsStep.id, {
      status: "completed",
      completedAt: new Date(),
      duration: "1s",
    });

    // Step 3: Summarize commits
    const summarizeStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Summarize Commits",
      description: "Using AI to summarize the changes",
    });

    if (!summarizeStep) {
      throw new Error("Failed to create summarize step");
    }

    await pipelineService.updatePipelineStep(summarizeStep.id, {
      status: "in_progress",
      startedAt: new Date(),
    });
    await wait(3000);
    const summary = await releaseAgentService.summarizeCommits(
      commits,
      prDetails.title
    );
    await pipelineService.updatePipelineStep(summarizeStep.id, {
      status: "completed",
      completedAt: new Date(),
      duration: "2s",
      metadata: { summary },
    });

    // Step 4: Approval required before changelog
    const approvalStep = await pipelineService.createPipelineStep({
      pipelineId: pipeline.id,
      name: "Approval: Changelog Creation",
      description:
        "Waiting for human approval before creating changelog entry.",
      metadata: { summary },
    });

    if (!approvalStep) {
      throw new Error("Failed to create approval step");
    }

    await pipelineService.updatePipelineStep(approvalStep.id, {
      status: "waiting_approval",
      startedAt: new Date(),
      metadata: { summary },
    });
    await approvalService.createApproval({
      pipelineStepId: approvalStep.id,
      approvalType: "changelog",
      risk: "low",
    });
    // PAUSE PIPELINE: Wait for approval.granted event to resume
    // (No further steps here)
  } catch (error: any) {
    logger.error("Error processing release.ready event", { error });
    const errorMessage = `Failed to create changelog for ${repoOwner}/${repoName} PR #${prNumber}: ${
      error.message || "Unknown error"
    }`;
    await notificationService.createNotification("1", {
      type: "alert",
      message: errorMessage,
    });
    await slackService.notify(`❌ ${errorMessage}`);
  }
};
