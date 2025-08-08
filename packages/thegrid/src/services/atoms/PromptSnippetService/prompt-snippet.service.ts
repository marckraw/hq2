import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { promptSnippets } from "../../../db/schema/prompt-snippets";
import { pool } from "../../../db";

export const createPromptSnippetService = () => {
  const db = drizzle(pool);

  const getAll = async () => {
    return db.select().from(promptSnippets).orderBy(promptSnippets.title);
  };

  const createSnippet = async (data: {
    title: string;
    description?: string;
    insertText: string;
  }) => {
    const [snippet] = await db.insert(promptSnippets).values(data).returning();
    return snippet;
  };

  const updateSnippet = async (
    id: string,
    data: { title?: string; description?: string; insertText?: string }
  ) => {
    const [snippet] = await db
      .update(promptSnippets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promptSnippets.id, id))
      .returning();
    return snippet;
  };

  const deleteSnippet = async (id: string) => {
    const [deleted] = await db
      .delete(promptSnippets)
      .where(eq(promptSnippets.id, id))
      .returning();
    return deleted || null;
  };

  return { getAll, createSnippet, updateSnippet, deleteSnippet };
};

export type PromptSnippetService = ReturnType<
  typeof createPromptSnippetService
>;
export const promptSnippetService = createPromptSnippetService();
