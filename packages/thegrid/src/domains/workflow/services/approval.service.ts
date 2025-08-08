import { db } from "../../../db";
import { approvals } from "../../../db/schema/approvals";
import { eq, desc, and, count, like, or } from "drizzle-orm";
import { pipelineSteps, pipelines } from "../../../db/schema/pipelines";
import {
  type ApprovalStatus as _ApprovalStatus,
  type ApprovalRisk as _ApprovalRisk,
  type GetApprovalsInput,
  type ApprovalUpdateData,
  RejectApprovalInputSchema,
  GetApprovalsInputSchema,
} from "../../../schemas/services.schemas";
import {
  type CreateApprovalInput,
  CreateApprovalInputSchema,
} from "../../../schemas/approval-types.schemas";
export const approvalService = {
  async createApproval(input: CreateApprovalInput) {
    // Validate input
    const validatedInput = CreateApprovalInputSchema.parse(input);

    const [approval] = await db
      .insert(approvals)
      .values({
        pipelineStepId: validatedInput.pipelineStepId,
        status: "pending",
        risk: validatedInput.risk || "low",
        approvalType: validatedInput.approvalType,
      })
      .returning();
    return approval;
  },

  async approveApproval(id: string) {
    const [approval] = await db
      .update(approvals)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(approvals.id, id))
      .returning();
    return approval;
  },

  async rejectApproval(id: string, reason?: string) {
    // Validate input
    const validatedInput = RejectApprovalInputSchema.parse({ id, reason });

    const updateData: ApprovalUpdateData = {
      status: "rejected",
      rejectedAt: new Date(),
      reason: validatedInput.reason ?? null,
    };

    const [approval] = await db
      .update(approvals)
      .set(updateData)
      .where(eq(approvals.id, validatedInput.id))
      .returning();
    return approval;
  },

  async getApprovalById(id: string) {
    const [approval] = await db
      .select({
        id: approvals.id,
        pipelineStepId: approvals.pipelineStepId,
        status: approvals.status,
        risk: approvals.risk,
        reason: approvals.reason,
        createdAt: approvals.createdAt,
        approvedAt: approvals.approvedAt,
        rejectedAt: approvals.rejectedAt,
        step: {
          id: pipelineSteps.id,
          name: pipelineSteps.name,
          description: pipelineSteps.description,
          status: pipelineSteps.status,
          metadata: pipelineSteps.metadata,
        },
        pipeline: {
          id: pipelines.id,
          name: pipelines.name,
          description: pipelines.description,
          type: pipelines.type,
          metadata: pipelines.metadata,
        },
      })
      .from(approvals)
      .leftJoin(pipelineSteps, eq(approvals.pipelineStepId, pipelineSteps.id))
      .leftJoin(pipelines, eq(pipelineSteps.pipelineId, pipelines.id))
      .where(eq(approvals.id, id));

    if (approval) {
      const summary = (
        approval.step?.metadata as Record<string, any> | undefined
      )?.summary;
      return {
        ...approval,
        summary,
      };
    }
    return approval;
  },

  async getApprovals(options: GetApprovalsInput) {
    // Validate input
    const validatedOptions = GetApprovalsInputSchema.parse(options);

    // Build conditions array for filtering
    const conditions = [];

    if (validatedOptions.status) {
      conditions.push(eq(approvals.status, validatedOptions.status));
    }

    if (validatedOptions.risk) {
      conditions.push(eq(approvals.risk, validatedOptions.risk as any));
    }

    if (validatedOptions.approvalType) {
      conditions.push(
        eq(approvals.approvalType, validatedOptions.approvalType as any)
      );
    }

    // Add search functionality - search in pipeline name, step name, and summary
    if (validatedOptions.search) {
      const searchTerm = `%${validatedOptions.search}%`;
      conditions.push(
        or(
          like(pipelines.name, searchTerm),
          like(pipelineSteps.name, searchTerm),
          like(pipelineSteps.description, searchTerm)
        )
      );
    }

    // Add origin filtering
    if (validatedOptions.origin && validatedOptions.origin.length > 0) {
      const origins = validatedOptions.origin.map((o: string) =>
        eq(approvals.origin, o as any)
      );
      conditions.push(or(...origins));
    }

    // Get total count with same filters
    const countQuery = db
      .select({ count: count() })
      .from(approvals)
      .leftJoin(pipelineSteps, eq(approvals.pipelineStepId, pipelineSteps.id))
      .leftJoin(pipelines, eq(pipelineSteps.pipelineId, pipelines.id));

    const [totalCountResult] =
      conditions.length > 0
        ? await countQuery.where(and(...conditions))
        : await countQuery;

    const totalCount = totalCountResult?.count || 0;

    // Build the main query
    const baseQuery = db
      .select({
        id: approvals.id,
        pipelineStepId: approvals.pipelineStepId,
        status: approvals.status,
        risk: approvals.risk,
        reason: approvals.reason,
        createdAt: approvals.createdAt,
        approvedAt: approvals.approvedAt,
        rejectedAt: approvals.rejectedAt,
        step: {
          id: pipelineSteps.id,
          name: pipelineSteps.name,
          description: pipelineSteps.description,
          status: pipelineSteps.status,
          metadata: pipelineSteps.metadata,
        },
        pipeline: {
          id: pipelines.id,
          name: pipelines.name,
          description: pipelines.description,
          type: pipelines.type,
          metadata: pipelines.metadata,
        },
      })
      .from(approvals)
      .leftJoin(pipelineSteps, eq(approvals.pipelineStepId, pipelineSteps.id))
      .leftJoin(pipelines, eq(pipelineSteps.pipelineId, pipelines.id))
      .orderBy(desc(approvals.createdAt))
      .limit(validatedOptions.limit || 50)
      .offset(validatedOptions.offset || 0);

    // Apply filters to main query
    const results =
      conditions.length > 0
        ? await baseQuery.where(and(...conditions))
        : await baseQuery;

    return {
      data: results.map((approval) => {
        const summary = (
          approval.step?.metadata as Record<string, any> | undefined
        )?.summary;
        return {
          ...approval,
          summary,
        };
      }),
      total: totalCount,
      limit: validatedOptions.limit || 50,
      offset: validatedOptions.offset || 0,
    };
  },

  async getApprovalByStepId(pipelineStepId: string) {
    const [approval] = await db
      .select()
      .from(approvals)
      .where(eq(approvals.pipelineStepId, pipelineStepId));
    return approval;
  },
};

export type ApprovalService = typeof approvalService;
