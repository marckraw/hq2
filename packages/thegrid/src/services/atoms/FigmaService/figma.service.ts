import fs from "fs";
import { config } from "../../../config.env";
import type {
  GetFileResponse,
  GetImageFillsResponse,
  GetImagesResponse,
} from "@figma/rest-api-spec";
import { FigmaError } from "../../../additional-types";
import { logger } from "../../../utils/logger";

const createFigmaService = ({
  figmaBaseUrl = "https://api.figma.com/v1",
}: {
  figmaBaseUrl?: string;
}) => {
  // Private function
  const writeLogs = (name: string, value: any) => {
    try {
      const logsDir = "logs";

      try {
        fs.accessSync(process.cwd(), fs.constants.W_OK);
      } catch (error) {
        logger.debug("Failed to write logs", { error });
        return;
      }

      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
      }
      fs.writeFileSync(`${logsDir}/${name}`, JSON.stringify(value, null, 2));
    } catch (error) {
      logger.debug("Failed to write logs", { error });
    }
  };

  const extractFileKeyFromUrl = (url: string): string => {
    // Handle different Figma URL formats
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/, // Standard file URL
      /figma\.com\/design\/([a-zA-Z0-9]+)/, // Design URL
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    throw new Error("Invalid Figma URL format");
  };

  const request = async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${figmaBaseUrl}${endpoint}`, {
        headers: {
          "X-Figma-Token": config.FIGMA_API_KEY,
        },
      });

      return response.json() as Promise<T>;
    } catch (error) {
      if ((error as FigmaError).status) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(
          `Failed to make request to Figma API: ${error.message}`
        );
      }
      throw new Error(`Failed to make request to Figma API: ${error}`);
    }
  };

  const getFile = async (
    fileKeyOrUrl: string,
    depth?: number
  ): Promise<GetFileResponse> => {
    try {
      const fileKey = fileKeyOrUrl.includes("figma.com")
        ? extractFileKeyFromUrl(fileKeyOrUrl)
        : fileKeyOrUrl;

      const endpoint = `/files/${fileKey}${depth ? `?depth=${depth}` : ""}`;
      logger.info(
        `Retrieving Figma file: ${fileKey} (depth: ${depth ?? "default"})`
      );
      const response = await request<GetFileResponse>(endpoint);
      writeLogs("figma-raw.json", response);
      return response;
    } catch (e) {
      logger.error("Failed to get file", { error: e });
      throw e;
    }
  };

  const getImageFills = async (
    fileKeyOrUrl: string
  ): Promise<GetImageFillsResponse> => {
    logger.debug("[FigmaService] getImageFills", { fileKeyOrUrl });
    try {
      const fileKey = fileKeyOrUrl.includes("figma.com")
        ? extractFileKeyFromUrl(fileKeyOrUrl)
        : fileKeyOrUrl;
      const endpoint = `/files/${fileKey}/images`;
      logger.info(`Retrieving image fills for Figma file: ${fileKey}`);
      const response = await request<GetImageFillsResponse>(endpoint);
      writeLogs("figma-image-fills.json", response);
      return response;
    } catch (e) {
      logger.error("Failed to get image fills", { error: e });
      throw e;
    }
  };

  const getImages = async (
    fileKeyOrUrl: string,
    ids: string[],
    format: "jpg" | "png" | "svg" | "pdf" = "png",
    scale?: number
  ): Promise<GetImagesResponse> => {
    try {
      const fileKey = fileKeyOrUrl.includes("figma.com")
        ? extractFileKeyFromUrl(fileKeyOrUrl)
        : fileKeyOrUrl;

      const idsParam = ids.join(",");
      let endpoint = `/images/${fileKey}?ids=${idsParam}&format=${format}`;
      if (scale) {
        endpoint += `&scale=${scale}`;
      }

      logger.info(
        `Rendering images for Figma file: ${fileKey}, nodes: ${idsParam}, format: ${format}, scale: ${
          scale ?? "default"
        }`
      );
      const response = await request<GetImagesResponse>(endpoint);
      writeLogs("figma-images.json", response);
      return response;
    } catch (e) {
      logger.error("Failed to get images", { error: e });
      throw e;
    }
  };

  const getFileAsImage = async (
    fileKeyOrUrl: string,
    format: "jpg" | "png" | "svg" | "pdf" = "png",
    scale?: number
  ): Promise<GetImagesResponse> => {
    try {
      const fileKey = fileKeyOrUrl.includes("figma.com")
        ? extractFileKeyFromUrl(fileKeyOrUrl)
        : fileKeyOrUrl;

      logger.info(`Getting file as image for: ${fileKey}`);

      // First, get the file data to extract canvas/page node IDs
      const fileData = await getFile(fileKey);

      if (!fileData.document || !fileData.document.children) {
        throw new Error("File has no document or children");
      }

      // Extract all canvas/page node IDs (top-level children of document)
      const canvasIds = fileData.document.children
        .filter((child: any) => child.type === "CANVAS")
        .map((canvas: any) => canvas.id);

      if (canvasIds.length === 0) {
        throw new Error("No canvas nodes found in file");
      }

      logger.info(
        `Rendering file as images: ${fileKey}, canvases: ${canvasIds.join(", ")}, format: ${format}, scale: ${
          scale ?? "default"
        }`
      );

      // Use the existing getImages function to render the canvas nodes
      const response = await getImages(fileKey, canvasIds, format, scale);
      writeLogs("figma-file-as-image.json", response);
      return response;
    } catch (e) {
      logger.error("Failed to get file as image", { error: e });
      throw e;
    }
  };

  // Return public interface
  return {
    getImages,
    getImageFills,
    getFile,
    getFileAsImage,
    figmaRequest: request,
  };
};

export { createFigmaService };
export const figmaService = createFigmaService({});
