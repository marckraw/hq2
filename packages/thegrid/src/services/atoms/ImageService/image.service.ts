import { logger } from "@/utils/logger";
import { AntonSDK } from "@mrck-labs/anton-sdk";
import { config } from "../../../config.env";
import { Langfuse } from "langfuse";

interface ImageGenerationOptions {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_images?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  modelId?: string;
}

interface ImageResponse {
  imageUrl: string;
  generationId: string;
}

const createImageService = () => {
  // Private variable using closure
  const imageGenerator = (() => {
    console.log("Creating image generator with anton");
    const generator = AntonSDK.create({
      model: "gpt-4o-mini",
      apiKey: config.OPENAI_API_KEY,
      type: "openai",
      supportedModelsApiKeys: {
        leonardoAI: config.LEONARDOAI_API_KEY,
      },
    });

    return generator;
  })();

  const imageContentFromBase64 = async (base64Image: string, company: string) => {
    if (company === "openai") {
      return {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
          detail: "high",
        },
      };
    } else if (company === "anthropic") {
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64Image,
        },
      };
    }

    return {
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${base64Image}`,
        detail: "high",
      },
    };
  };

  const imageContent = async ({ imageUrl, company }: { imageUrl: string; company: string }) => {
    if (company === "openai") {
      return {
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      };
    } else if (company === "anthropic") {
      const convertedBase64Image = await getImageAsBase64(imageUrl as string);
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: convertedBase64Image,
        },
      };
    }

    return {
      type: "image_url",
      image_url: {
        url: imageUrl,
      },
    };
  };

  const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  };

  // Public methods
  const generateImage = async (options: ImageGenerationOptions): Promise<ImageResponse> => {
    const langfuse = new Langfuse();
    const trace = langfuse.trace({
      name: "image-generation",
    });

    const generation = trace.generation({
      name: "leonardo-image",
      model: "leonardo-diffusion",
      input: options,
    });

    try {
      const response = await imageGenerator.createImageWithLeonardo({
        prompt: options.prompt,
        // @ts-ignore
        negative_prompt: options.negative_prompt || "",
        nsfw: true,
        num_images: options.num_images || 1,
        width: options.width || 1280,
        height: options.height || 1920,
        num_inference_steps: options.num_inference_steps || 10,
        contrast: 3.5,
        guidance_scale: options.guidance_scale || 15,
        sd_version: "PHOENIX",
        modelId: options.modelId || "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
        presetStyle: "LEONARDO",
        scheduler: "LEONARDO",
        public: false,
        tiling: false,
        alchemy: true,
        highResolution: false,
        contrastRatio: 0.5,
        weighting: 0.75,
        highContrast: false,
        expandedDomain: false,
        photoReal: false,
        transparency: "disabled",
        styleUUID: "a5632c7c-ddbb-4e2f-ba34-8456ab3ac436",
        enhancePrompt: false,
        ultra: false,
      });

      generation.end({
        output: response,
      });

      return {
        // @ts-ignore
        imageUrl: response.imageUrl,
        // @ts-ignore
        generationId: response.generationId,
      };
    } catch (error) {
      logger.error("Error generating image:", error);
      generation.end({
        // @ts-ignore
        error: error instanceof Error ? error : new Error("Unknown error occurred"),
      });
      throw error;
    }
  };

  const generateImageWithLeonardo = generateImage;

  // Return public interface
  return {
    generateImage,
    generateImageWithLeonardo,
    getImageAsBase64,
    imageContentFromBase64,
    imageContent,
    debug: imageGenerator.debug(),
  };
};

export { createImageService };
export const imageService = createImageService();
export type { ImageGenerationOptions, ImageResponse };
