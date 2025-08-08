import { OpenAPIHono } from "@hono/zod-openapi";
import { serviceRegistry } from "../../../registry/service-registry";
import { serializeRecord, serializeRecords } from "../shared/serializers";
import {
  createPipelineRoute,
  createPipelineStepRoute,
  updatePipelineStepRoute,
  updatePipelineStatusRoute,
  getPipelinesRoute,
  getPipelineByIdRoute,
  deletePipelineRoute,
} from "./pipelines.routes";

const pipelinesRouter = new OpenAPIHono();

// Create a new pipeline
// @ts-expect-error - OpenAPI type inference issue with response union types
pipelinesRouter.openapi(createPipelineRoute, async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, source, type, metadata } = body;

    if (!name || !source || !type) {
      return c.json(
        {
          success: false,
          error: {
            message:
              "Missing required fields: name, source, and type are required",
            code: "INVALID_INPUT",
          },
        } as const,
        400
      );
    }

    const pipelineService = serviceRegistry.get("pipeline");
    const pipeline = await pipelineService.createPipeline({
      name,
      description,
      source,
      type,
      metadata,
    });

    return c.json({
      success: true,
      data: serializeRecord(pipeline),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_ERROR",
        },
      } as const,
      500
    );
  }
});

// Create a new pipeline step
// @ts-expect-error - OpenAPI type inference issue with response union types
pipelinesRouter.openapi(createPipelineStepRoute, async (c) => {
  try {
    const pipelineId = c.req.param("id");
    const body = await c.req.json();
    const { name, description, metadata } = body;

    if (!name) {
      return c.json(
        {
          success: false,
          error: {
            message: "Missing required field: name is required",
            code: "INVALID_INPUT",
          },
        } as const,
        400
      );
    }

    const pipelineService = serviceRegistry.get("pipeline");
    const step = await pipelineService.createPipelineStep({
      pipelineId,
      name,
      description,
      metadata,
    });

    return c.json({
      success: true,
      data: serializeRecord(step),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_ERROR",
        },
      } as const,
      500
    );
  }
});

// Update a pipeline step
// @ts-expect-error - OpenAPI type inference issue with response union types
pipelinesRouter.openapi(updatePipelineStepRoute, async (c) => {
  try {
    const stepId = c.req.param("stepId");
    const body = await c.req.json();
    const { status, startedAt, completedAt, duration, metadata } = body;

    if (!status) {
      return c.json(
        {
          success: false,
          error: {
            message: "Missing required field: status is required",
            code: "INVALID_INPUT",
          },
        } as const,
        400
      );
    }

    const pipelineService = serviceRegistry.get("pipeline");
    const step = await pipelineService.updatePipelineStep(stepId, {
      status,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      duration,
      metadata,
    } as any);

    return c.json({
      success: true,
      data: serializeRecord(step),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_ERROR",
        },
      } as const,
      500
    );
  }
});

// Update pipeline status
// @ts-expect-error - OpenAPI type inference issue with response union types
pipelinesRouter.openapi(updatePipelineStatusRoute, async (c) => {
  try {
    const pipelineId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!status) {
      return c.json(
        {
          success: false,
          error: {
            message: "Missing required field: status is required",
            code: "INVALID_INPUT",
          },
        } as const,
        400
      );
    }

    const pipelineService = serviceRegistry.get("pipeline");
    const pipeline = await pipelineService.updatePipelineStatus(
      pipelineId,
      status
    );

    return c.json({
      success: true,
      data: serializeRecord(pipeline),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_ERROR",
        },
      } as const,
      500
    );
  }
});

// Get all pipelines with optional pagination
// @ts-expect-error - OpenAPI type inference issue with response union types
pipelinesRouter.openapi(getPipelinesRoute, async (c) => {
  try {
    const limit = Number(c.req.query("limit")) || 50;
    const offset = Number(c.req.query("offset")) || 0;

    const pipelineService = serviceRegistry.get("pipeline");
    const result = await pipelineService.listPipelines({
      limit,
      offset,
    });

    return c.json({
      success: true,
      data: serializeRecords(result.data),
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total,
      },
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_ERROR",
        },
      } as const,
      500
    );
  }
});

// Get a single pipeline by ID
// @ts-expect-error - OpenAPI type inference issue with response union types
pipelinesRouter.openapi(getPipelineByIdRoute, async (c) => {
  try {
    const pipelineId = c.req.param("id");

    const pipelineService = serviceRegistry.get("pipeline");
    const pipeline = await pipelineService.getPipeline(pipelineId);

    if (!pipeline) {
      return c.json(
        {
          success: false,
          error: {
            message: "Pipeline not found",
            code: "PIPELINE_NOT_FOUND",
          },
        } as const,
        404
      );
    }

    return c.json({
      success: true,
      data: serializeRecord(pipeline),
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_ERROR",
        },
      } as const,
      500
    );
  }
});

// Delete a pipeline by ID
pipelinesRouter.openapi(deletePipelineRoute, async (c) => {
  try {
    const pipelineId = c.req.param("id");
    const pipelineService = serviceRegistry.get("pipeline");
    await pipelineService.deletePipeline(pipelineId);
    return c.json({ success: true } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "PIPELINE_DELETE_ERROR",
        },
      } as const,
      500
    );
  }
});

export { pipelinesRouter };
