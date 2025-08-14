import { createNamedTool } from "@mrck-labs/grid-core";
import { z } from "@hono/zod-openapi";
import { serviceRegistry } from "../../registry/service-registry";
import { logger, userLogger } from "../../utils/logger";

// Define the parameters schema separately for type inference
const analyzeYoutubeSchema = z.object({
  reasoning: z.string().describe("Why did you choose this tool?"),
  url: z.string().describe("The YouTube URL for the video you want to analyze."),
});

// Type for the parameters
type AnalyzeYoutubeParams = z.infer<typeof analyzeYoutubeSchema>;

export const analyzeYoutubeTool: any = createNamedTool({
  name: "analyze_youtube_video",
  description: "Download and transcribe a YouTube video to understand its contents.",
  inputSchema: analyzeYoutubeSchema,
  execute: async (params: AnalyzeYoutubeParams) => {
    userLogger.log("[analyzeYoutube.tool] 🎬 Using analyzeYoutube tool with params:", params);
    try {
      return await serviceRegistry.get("youtube").transcribeVideoFromUrl(params.url);
    } catch (error) {
      logger.error("Error analyzing YouTube video:", error);
      throw new Error("Failed to analyze YouTube video.");
    }
  },
});
