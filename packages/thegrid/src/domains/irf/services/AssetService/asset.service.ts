import { logger } from "@/utils/logger";
import { figmaService } from "@/services/atoms/FigmaService/figma.service";
import { serviceRegistry } from "@/registry/service-registry";

/**
 * Asset Service
 *
 * This service handles the fetching of asset URLs from Figma and uploading them to Storyblok.
 * It acts as a bridge between the Figma API and the Storyblok CMS for asset management.
 */
export const createAssetService = () => {
  let imageFillsMap: Record<string, string> = {};

  /**
   * Fetches all image fill references from a Figma file and caches them.
   * This is intended to be called once per transformation to avoid redundant API calls.
   * @param fileKey The Figma file key.
   */
  const prefetchImageFills = async (fileKey: string): Promise<void> => {
    try {
      const response = await figmaService.getImageFills(fileKey);
      if (response.meta?.images) {
        imageFillsMap = response.meta.images;
        logger.info(
          `[AssetService] Prefetched ${Object.keys(imageFillsMap).length} image fills.`
        );
      }
    } catch (error) {
      logger.error("[AssetService] Failed to prefetch image fills:", error);
      // Ensure the map is clear on failure
      imageFillsMap = {};
    }
  };

  /**
   * Gets the actual image URL for a given Figma image reference.
   * @param imageRef The image reference from a Figma node's fill.
   * @returns The public URL of the image, or undefined if not found.
   */
  const getImageUrl = (imageRef: string): string | undefined => {
    return imageFillsMap[imageRef];
  };

  /**
   * Handles the end-to-end process of taking a Figma image reference,
   * getting its URL, and uploading it to Storyblok.
   * @param imageRef The image reference from a Figma node's fill.
   * @param nodeName The name of the IRF node, used for generating a filename.
   * @returns The URL of the uploaded asset in Storyblok, or a fallback URL.
   */
  const handleUpload = async (
    imageRef: string,
    nodeName: string
  ): Promise<string> => {
    const defaultImageFallback =
      "https://a.storyblok.com/f/226550/3740x1720/d32d60ca28/woods.jpg";
    const imageUrl = getImageUrl(imageRef);

    if (!imageUrl) {
      logger.warn(
        `[AssetService] Image URL not found for ref: ${imageRef}. Using fallback.`
      );
      return defaultImageFallback; // Fallback
    }

    if (imageUrl.includes("storyblok.com")) {
      // It's already a Storyblok asset, no need to re-upload
      return imageUrl;
    }

    try {
      const filename = `figma-${nodeName.replace(/[^a-zA-Z0-9-]/g, "-")}-${Date.now()}.png`;
      const storyblokService = serviceRegistry.get("storyblok");
      const storyblokUrl = await storyblokService.uploadAsset(
        imageUrl,
        filename
      );
      logger.info(
        `[AssetService] Successfully uploaded ${filename} to Storyblok.`
      );
      return storyblokUrl;
    } catch (error) {
      logger.error(
        `[AssetService] Failed to upload image from ${imageUrl} to Storyblok:`,
        error
      );
      // Return the original Figma URL as a fallback so it's not completely broken
      return imageUrl;
    }
  };

  return {
    prefetchImageFills,
    getImageUrl,
    handleUpload,
  };
};

export const assetService = createAssetService();
