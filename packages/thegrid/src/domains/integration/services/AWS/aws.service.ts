// lib/uploadToS3.ts

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../../../../config.env";
import { fileService } from "../../../../services/atoms/FileService/file.service";

export const createAWSService = () => {
  // Private state
  const s3 = new S3Client({
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
  });

  const uploadFileToS3 = async (
    buffer: Buffer,
    filename: string,
    folder: string,
    contentType: string,
    uploadedBy?: string,
    tags?: string[]
  ): Promise<string> => {
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: config.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(command);

    // Store file information in the database
    await fileService.createFile({
      name: filename,
      s3Key: key,
      contentType,
      tags: tags || [],
      uploadedBy: uploadedBy || "",
    });

    return `https://${config.S3_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;
  };

  // Public methods
  const uploadImageToS3 = async (
    buffer: Buffer,
    filename: string,
    uploadedBy?: string,
    tags?: string[]
  ): Promise<string> => {
    const url = await uploadFileToS3(
      buffer,
      filename,
      "images",
      "image/png",
      uploadedBy,
      tags
    );

    return url;
  };

  const uploadBase64ImageToS3 = async (
    dataUrl: string,
    filename: string,
    uploadedBy?: string,
    tags?: string[]
  ): Promise<string> => {
    if (!dataUrl.startsWith("data:")) {
      throw new Error("Invalid dataUrl format. Must be a data URL.");
    }

    const parts = dataUrl.split(";base64,");
    if (parts.length !== 2) {
      throw new Error(
        "Invalid dataUrl format. Expected 'data:[content-type];base64,[data]'"
      );
    }

    const mimeTypePartRaw = parts[0];
    const base64Data = parts[1];

    if (!mimeTypePartRaw || !base64Data) {
      throw new Error(
        "Invalid dataUrl format. Could not extract mime-type or data."
      );
    }

    const mimeTypePart = mimeTypePartRaw.split(":")[1];

    if (!mimeTypePart) {
      throw new Error(
        "Invalid dataUrl format. Could not extract mime-type from the data part."
      );
    }

    const buffer = Buffer.from(base64Data, "base64");

    const url = await uploadFileToS3(
      buffer,
      `${filename}-${new Date().getTime()}`,
      "images",
      mimeTypePart,
      uploadedBy,
      tags
    );

    return url;
  };

  return {
    uploadImageToS3,
    uploadFileToS3,
    uploadBase64ImageToS3,
  };
};
export const awsService = createAWSService();
