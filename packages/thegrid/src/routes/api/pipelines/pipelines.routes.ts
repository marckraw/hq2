import { createRoute, z } from "@hono/zod-openapi";

// Schema definitions
const PipelineStatusEnum = z.enum(["pending", "running", "completed", "failed"]);

const CreatePipelineRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  source: z.string(),
  type: z.string(),
  metadata: z.record(z.any()).optional(),
});

const CreatePipelineStepRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdatePipelineStepRequestSchema = z.object({
  status: PipelineStatusEnum,
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdatePipelineStatusRequestSchema = z.object({
  status: PipelineStatusEnum,
});

const PipelineStepSchema = z.object({
  id: z.string(),
  pipelineId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: PipelineStatusEnum,
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  duration: z.number().nullable(),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  source: z.string(),
  type: z.string(),
  status: PipelineStatusEnum,
  metadata: z.record(z.any()),
  steps: z.array(PipelineStepSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
});

const PipelineSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: PipelineSchema,
});

const PipelineStepSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: PipelineStepSchema,
});

const PipelinesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PipelineSchema),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  }),
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

// Route definitions
export const createPipelineRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create a new pipeline",
  description: "Creates a new pipeline with the specified configuration",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePipelineRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pipeline created successfully",
      content: {
        "application/json": {
          schema: PipelineSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input - missing required fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error creating pipeline",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createPipelineStepRoute = createRoute({
  method: "post",
  path: "/{id}/steps",
  summary: "Create a pipeline step",
  description: "Adds a new step to an existing pipeline",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Pipeline ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreatePipelineStepRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pipeline step created successfully",
      content: {
        "application/json": {
          schema: PipelineStepSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input - missing required fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error creating pipeline step",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const updatePipelineStepRoute = createRoute({
  method: "patch",
  path: "/{id}/steps/{stepId}",
  summary: "Update a pipeline step",
  description: "Updates the status and metadata of a pipeline step",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Pipeline ID"),
      stepId: z.string().describe("Step ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdatePipelineStepRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pipeline step updated successfully",
      content: {
        "application/json": {
          schema: PipelineStepSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input - missing required fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error updating pipeline step",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const updatePipelineStatusRoute = createRoute({
  method: "patch",
  path: "/{id}",
  summary: "Update pipeline status",
  description: "Updates the status of a pipeline",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Pipeline ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdatePipelineStatusRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pipeline status updated successfully",
      content: {
        "application/json": {
          schema: PipelineSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input - missing required fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error updating pipeline status",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getPipelinesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all pipelines",
  description: "Retrieves all pipelines with optional pagination",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().describe("Number of items to return (default: 50)"),
      offset: z.string().optional().describe("Number of items to skip (default: 0)"),
    }),
  },
  responses: {
    200: {
      description: "List of pipelines with pagination info",
      content: {
        "application/json": {
          schema: PipelinesListResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving pipelines",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getPipelineByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a pipeline by ID",
  description: "Retrieves a single pipeline with all its steps",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Pipeline ID"),
    }),
  },
  responses: {
    200: {
      description: "Pipeline found",
      content: {
        "application/json": {
          schema: PipelineSuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Pipeline not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving pipeline",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const deletePipelineRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete a pipeline",
  description: "Deletes a pipeline and all its associated steps",
  tags: ["Pipelines"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Pipeline ID"),
    }),
  },
  responses: {
    200: {
      description: "Pipeline deleted successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    500: {
      description: "Error deleting pipeline",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});