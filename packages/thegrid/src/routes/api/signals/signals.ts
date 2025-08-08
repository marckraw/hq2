import { OpenAPIHono } from "@hono/zod-openapi";
import { serviceRegistry } from "../../../registry/service-registry";
import { getSignalsRoute, getSignalByIdRoute, createSignalRoute } from "./signals.routes";

const signalsRouter = new OpenAPIHono();

// Get all signals with optional pagination and filtering
// @ts-expect-error - OpenAPI type inference issue with response union types
signalsRouter.openapi(getSignalsRoute, async (c) => {
  try {
    const limit = Number(c.req.query("limit")) || 50;
    const offset = Number(c.req.query("offset")) || 0;

    const signalService = serviceRegistry.get("signal");
    const signals = await signalService.listSignals({
      limit,
      offset,
    });

    return c.json({
      success: true,
      data: signals,
      pagination: {
        limit,
        offset,
      },
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SIGNAL_ERROR",
        },
      } as const,
      500
    );
  }
});

// Get a single signal by ID
// @ts-expect-error - OpenAPI type inference issue with response union types
signalsRouter.openapi(getSignalByIdRoute, async (c) => {
  try {
    const signalId = c.req.param("id");

    const signalService = serviceRegistry.get("signal");
    const signal = await signalService.findSignalById(signalId);

    if (!signal) {
      return c.json(
        {
          success: false,
          error: {
            message: "Signal not found",
            code: "SIGNAL_NOT_FOUND",
          },
        } as const,
        404
      );
    }

    return c.json({
      success: true,
      data: signal,
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SIGNAL_ERROR",
        },
      } as const,
      500
    );
  }
});

// Create a signal (existing endpoint)
// @ts-expect-error - OpenAPI type inference issue with response union types
signalsRouter.openapi(createSignalRoute, async (c) => {
  try {
    const requestData = c.req.valid("json");
    const signalService = serviceRegistry.get("signal");
    const signal = await signalService.storeSignal({
      source: requestData.source,
      type: requestData.type,
      payload: requestData.payload,
      metadata: requestData.metadata || {},
    } as any);

    return c.json({
      success: true,
      data: signal,
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SIGNAL_ERROR",
        },
      } as const,
      500
    );
  }
});

export { signalsRouter };
