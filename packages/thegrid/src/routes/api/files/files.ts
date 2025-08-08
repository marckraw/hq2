import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "../../../utils/logger";
import { prepareFileRoute } from "./files.routes";

export const filesRouter = new OpenAPIHono();

// POST /prepare route
filesRouter.openapi(prepareFileRoute, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json(
        {
          success: false,
          error: {
            message: "No file provided",
            code: "FILE_PREPARE_ERROR",
          },
        } as const,
        400
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return c.json(
        {
          success: false,
          error: {
            message: "Unsupported file type",
            code: "FILE_PREPARE_ERROR",
          },
        } as const,
        400
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json(
        {
          success: false,
          error: {
            message: "File size exceeds 10MB limit",
            code: "FILE_PREPARE_ERROR",
          },
        } as const,
        400
      );
    }

    // Convert file to base64 for later processing
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Store the file information (in memory for now - actual upload happens later)
    const fileInfo = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
    };

    logger.info("File prepared successfully", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileId: fileInfo.id,
    });

    return c.json(
      {
        success: true,
        data: fileInfo,
      } as const,
      200
    );
  } catch (error) {
    logger.error("File preparation error", { error });
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "FILE_PREPARE_ERROR",
        },
      } as const,
      500
    );
  }
});
