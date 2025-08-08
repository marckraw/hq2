import { OpenAPIHono } from "@hono/zod-openapi";
import { figmaService } from "../../../services/atoms/FigmaService/figma.service";
import { getFigmaFileRoute, getFigmaImageRoute } from "./figma.routes";

const figmaRouter = new OpenAPIHono();

figmaRouter.openapi(getFigmaFileRoute, async (c) => {
  try {
    const url = c.req.query("url");

    if (!url) {
      return c.json(
        {
          success: false,
          error: {
            message: "URL parameter is required",
            code: "MISSING_URL",
          },
        } as const,
        400
      );
    }

    const file = await figmaService.getFile(url);

    return c.json({
      success: true,
      data: {
        file,
      },
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "FIGMA_ERROR",
        },
      } as const,
      500
    );
  }
});

figmaRouter.openapi(getFigmaImageRoute, async (c) => {
  try {
    const keyFromUrl = c.req.query("key") || "vObm0XiNyOokbj7lfTOHmN";

    const file = await figmaService.getFileAsImage(keyFromUrl);

    return c.json({
      success: true,
      data: {
        file,
      },
    } as const, 200);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "FIGMA_ERROR",
        },
      } as const,
      500
    );
  }
});

export { figmaRouter };
