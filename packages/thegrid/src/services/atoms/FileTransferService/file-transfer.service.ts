import { logger } from "@/utils/logger";
import axios from "axios";

export const createFileTransferService = () => {
  /**
   * Downloads an image from a URL and returns it as a Buffer
   * @param url The URL of the image to download
   * @returns A Promise that resolves to a Buffer containing the image data
   */
  const downloadImage = async (url: string): Promise<Buffer> => {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });

      return Buffer.from(response.data);
    } catch (error) {
      logger.error("Error downloading image:", error);
      throw new Error(`Failed to download image from ${url}: ${error}`);
    }
  };

  return {
    downloadImage,
  };
};

export const fileTransferService = createFileTransferService();
