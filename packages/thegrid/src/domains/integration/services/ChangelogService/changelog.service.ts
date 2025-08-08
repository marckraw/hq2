import { logger } from "@/utils/logger";
import { db } from "@/db";
import { changelogs } from "@/db/schema/changelogs";
import { eq, desc } from "drizzle-orm";
import { PullRequestCommit } from "@/schemas";

export interface ChangelogData {
  repoOwner: string;
  repoName: string;
  prNumber: string;
  title?: string;
  summary?: string;
  commits?: PullRequestCommit[];
  releaseDate?: Date;
  createdBy?: string;
  published?: boolean;
}

export const createChangelogService = () => {
  // Public methods
  const createChangelog = async (data: ChangelogData) => {
    try {
      const result = await db
        .insert(changelogs)
        .values({
          repoOwner: data.repoOwner,
          repoName: data.repoName,
          prNumber: data.prNumber,
          title: data.title,
          summary: data.summary,
          commits: data.commits,
          releaseDate: data.releaseDate || new Date(),
          createdBy: data.createdBy,
          published: data.published || false,
        } as any)
        .returning();

      return result[0];
    } catch (error) {
      logger.error("Error creating changelog:", error);
      throw error;
    }
  };

  const getChangelogById = async (id: string) => {
    try {
      const result = await db
        .select()
        .from(changelogs)
        .where(eq(changelogs.id, id));
      return result[0];
    } catch (error) {
      logger.error("Error getting changelog by ID:", error);
      throw error;
    }
  };

  const getChangelogByPR = async (
    repoOwner: string,
    repoName: string,
    prNumber: string
  ) => {
    try {
      const result = await db
        .select()
        .from(changelogs)
        .where(
          eq(changelogs.repoOwner, repoOwner) &&
            eq(changelogs.repoName, repoName) &&
            eq(changelogs.prNumber, prNumber)
        );
      return result[0];
    } catch (error) {
      logger.error("Error getting changelog by PR:", error);
      throw error;
    }
  };

  const updateChangelog = async (id: string, data: Partial<ChangelogData>) => {
    try {
      const result = await db
        .update(changelogs)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(changelogs.id, id))
        .returning();

      return result[0];
    } catch (error) {
      logger.error("Error updating changelog:", error);
      throw error;
    }
  };

  const publishChangelog = async (id: string) => {
    try {
      const result = await db
        .update(changelogs)
        .set({
          published: true,
          updatedAt: new Date(),
        })
        .where(eq(changelogs.id, id))
        .returning();

      return result[0];
    } catch (error) {
      logger.error("Error publishing changelog:", error);
      throw error;
    }
  };

  const listChangelogs = async (options?: {
    limit?: number;
    offset?: number;
  }) => {
    try {
      return await db
        .select()
        .from(changelogs)
        .orderBy(desc(changelogs.createdAt))
        .limit(options?.limit || 50)
        .offset(options?.offset || 0);
    } catch (error) {
      logger.error("Error listing changelogs:", error);
      throw error;
    }
  };

  return {
    createChangelog,
    getChangelogById,
    getChangelogByPR,
    updateChangelog,
    publishChangelog,
    listChangelogs,
  };
};

export const changelogService = createChangelogService();

export type ChangelogService = typeof changelogService;
