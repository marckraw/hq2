import { db } from "../../../db";
import { files } from "../../../db/schema/files";
import { eq } from "drizzle-orm";

export const createFileService = () => {
  // Create a new file record in the database
  const createFile = async ({
    name,
    s3Key,
    contentType,
    tags = [],
    uploadedBy,
  }: {
    name: string;
    s3Key: string;
    contentType: string;
    tags?: string[];
    uploadedBy?: string;
  }) => {
    const result = await db
      .insert(files)
      .values({
        name,
        s3Key,
        contentType,
        tags,
        uploadedBy: uploadedBy || null,
      })
      .returning();

    return result[0];
  };

  // Get a file by its ID
  const getFileById = async (id: string) => {
    const result = await db.select().from(files).where(eq(files.id, id));
    return result[0];
  };

  // Get a file by its S3 key
  const getFileByS3Key = async (s3Key: string) => {
    const result = await db.select().from(files).where(eq(files.s3Key, s3Key));
    return result[0];
  };

  // Mark a file as deleted
  const markFileAsDeleted = async (id: string) => {
    const result = await db
      .update(files)
      .set({ deleted: true })
      .where(eq(files.id, id))
      .returning();

    return result[0];
  };

  return {
    createFile,
    getFileById,
    getFileByS3Key,
    markFileAsDeleted,
  };
};

export const fileService = createFileService();
