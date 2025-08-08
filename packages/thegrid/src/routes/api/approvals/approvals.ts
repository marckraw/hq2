import { Hono } from "hono";
import { serviceRegistry } from "../../../registry/service-registry";
import type { ApprovalStatus, PipelineMetadata } from "../../../schemas";
import { logger } from "../../../utils/logger";
import { approvalGrantedEventFunction } from "@/eda/events/event-handlers/approval.granted.event";

const approvalsRouter = new Hono();

// List all approvals with pagination and filtering
approvalsRouter.get("/", async (c) => {
  const statusParam = c.req.query("status");
  const riskParam = c.req.query("risk");
  const searchParam = c.req.query("search");
  const originParams = c.req.queries("origin") || [];
  const limitParam = Number(c.req.query("limit")) || 50;
  const offsetParam = Number(c.req.query("offset")) || 0;

  let status: ApprovalStatus | undefined = undefined;
  if (statusParam === "pending" || statusParam === "approved" || statusParam === "rejected") {
    status = statusParam;
  }

  // Temporarily not using risk variable until service layer is fixed
  // let risk: "low" | "medium" | "high" | undefined = undefined;
  // if (riskParam === "low" || riskParam === "medium" || riskParam === "high") {
  //   risk = riskParam;
  // }

  const approvalService = serviceRegistry.get("approval");
  const result = await approvalService.getApprovals({
    status,
    // Temporarily commenting out risk and search until service layer is fixed
    // risk,
    // search: searchParam,
    limit: limitParam,
    offset: offsetParam,
  });

  // Apply client-side filtering for now (will be moved to service layer later)
  let filteredData = result.data;

  if (originParams.length > 0) {
    filteredData = filteredData.filter((approval: any) => originParams.includes(approval.origin || "thehorizon"));
  }

  if (riskParam) {
    filteredData = filteredData.filter((approval: any) => approval.risk === riskParam);
  }

  if (searchParam) {
    const searchLower = searchParam.toLowerCase();
    filteredData = filteredData.filter(
      (approval: any) =>
        approval.pipeline?.name?.toLowerCase().includes(searchLower) ||
        approval.step?.name?.toLowerCase().includes(searchLower) ||
        approval.summary?.toLowerCase().includes(searchLower)
    );
  }

  const approvalsWithRisk = filteredData.map((a: any) => ({
    ...a,
    risk: a.risk || "low",
  }));

  return c.json({
    success: true,
    data: approvalsWithRisk,
    pagination: {
      limit: result.limit,
      offset: result.offset,
      total: result.total,
    },
  });
});

// Get a single approval by ID
approvalsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const approvalService = serviceRegistry.get("approval");
  const approval = await approvalService.getApprovalById(id);
  if (!approval) {
    return c.json({ success: false, error: { message: "Approval not found" } }, 404);
  }
  approval.risk = approval.risk || "low";
  return c.json({ success: true, data: approval });
});

// Approve an approval
approvalsRouter.post("/:id/approve", async (c) => {
  const id = c.req.param("id");

  // Parse request body for potential edited data and origin
  let editedData: { title?: string; summary?: string; storyblokContent?: string } | undefined;
  let origin: string = "unknown"; // Default fallback
  try {
    const body = await c.req.json();
    editedData = body.editedData;
    origin = body.origin || "thehorizon"; // Default to thehorizon if not provided
    console.log("🎯 Approval request from origin:", origin); // Log the origin for now
  } catch {
    // No body or invalid JSON - proceed with defaults
    origin = "thehorizon";
    console.log("🎯 Approval request from origin (default):", origin);
  }

  const approvalService = serviceRegistry.get("approval");
  const pipelineService = serviceRegistry.get("pipeline");
  const approval = await approvalService.approveApproval(id);
  if (!approval) {
    return c.json({ success: false, error: { message: "Approval not found" } }, 404);
  }
  approval.risk = approval.risk || "low";

  // Get the pipeline step and pipeline context
  const step = await pipelineService.getPipelineStepById(approval.pipelineStepId);
  if (!step) {
    return c.json({ success: false, error: { message: "Pipeline step not found" } }, 404);
  }
  const pipeline = await pipelineService.getPipeline(step.pipelineId);
  console.log("This is pipeline in approvals.ts");
  console.log(pipeline);
  const metadata = (pipeline?.metadata ?? {}) as PipelineMetadata;

  // Try to get summary, prDetails, and commits from step, pipeline, or previous steps
  let summary = (step.metadata as Record<string, any> | undefined)?.summary || metadata.summary;
  let prDetails = metadata.prDetails;
  let commits = metadata.commits;

  // Use edited data if provided
  if (editedData) {
    if (editedData.title && prDetails) {
      prDetails = { ...prDetails, title: editedData.title };
    }
    if (editedData.summary) {
      summary = editedData.summary;
    }
    // Handle edited Storyblok content
    if (editedData.storyblokContent && pipeline?.metadata) {
      try {
        const parsedContent = JSON.parse(editedData.storyblokContent);
        // Update the pipeline metadata with the edited Storyblok content
        (pipeline.metadata as any).editedStoryblok = parsedContent;

        // Persist the updated metadata to the database
        await pipelineService.updatePipelineMetadata(pipeline.id, pipeline.metadata as any);

        logger.info("Updated and persisted pipeline metadata with edited Storyblok content", {
          pipelineId: pipeline.id,
          contentKeys: Object.keys(parsedContent),
        });
      } catch (error) {
        logger.error("Failed to parse edited Storyblok content", {
          error: error instanceof Error ? error.message : "Unknown error",
          storyblokContent: editedData.storyblokContent?.substring(0, 100),
        });
      }
    }
  }

  if ((!summary || !prDetails || !commits) && pipeline?.steps) {
    for (const s of pipeline.steps) {
      const m = (s.metadata || {}) as Record<string, any>;
      if (!summary && m.summary) summary = m.summary;
      if (!prDetails && m.prDetails) prDetails = m.prDetails;
      if (!commits && m.commits) commits = m.commits;
    }
  }

  // eventBus.emit("approval.granted", {
  //   pipelineId: step.pipelineId,
  //   approvalStepId: step.id,
  //   repoOwner: metadata.repoOwner,
  //   repoName: metadata.repoName,
  //   prNumber: typeof metadata.prNumber === "number" ? metadata.prNumber.toString() : metadata.prNumber,
  //   summary: summary as string,
  //   commits,
  //   prDetails,
  // } as any);

  try {
    await approvalGrantedEventFunction({
      pipelineId: step.pipelineId,
      approvalStepId: step.id,
      repoOwner: metadata.repoOwner,
      repoName: metadata.repoName,
      prNumber: typeof metadata.prNumber === "number" ? metadata.prNumber.toString() : metadata.prNumber,
      summary: summary as string,
      commits,
      prDetails,
    });
  } catch (error) {
    logger.error("Failed to emit approval.granted event", { error });
    return c.json({ success: false, error: { message: "Failed in emitting approval.granted event" } }, 500);
  }

  return c.json({ success: true, data: approval });
});

// Reject an approval
approvalsRouter.post("/:id/reject", async (c) => {
  const id = c.req.param("id");
  const { reason, origin } = await c.req.json().catch(() => ({}));
  console.log("🎯 Rejection request from origin:", origin || "thehorizon"); // Log the origin for now
  const approvalService = serviceRegistry.get("approval");
  const pipelineService = serviceRegistry.get("pipeline");
  const approval = await approvalService.rejectApproval(id, reason);
  if (!approval) {
    return c.json({ success: false, error: { message: "Approval not found" } }, 404);
  }
  approval.risk = approval.risk || "low";
  // Mark the related pipeline step and pipeline as failed
  const step = await pipelineService.getPipelineStepById(approval.pipelineStepId);
  if (step) {
    await pipelineService.updatePipelineStep(step.id, {
      status: "failed",
      completedAt: new Date(),
    });
    await pipelineService.updatePipelineStatus(step.pipelineId, "failed");
  }
  return c.json({ success: true, data: approval });
});

// Delete an approval
approvalsRouter.delete("/:id", async (c) => {
  // const _id = c.req.param("id");
  // (Optional) implement delete logic in approvalService
  return c.json({ success: false, error: { message: "Not implemented" } }, 501);
});

export { approvalsRouter };
