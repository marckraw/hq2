import { logger } from "@/utils/logger";
import { agentFactory } from "../../../agent/factories/agents.factory";
import { validateAgentActResponse } from "../../../agent/factories/agents.factory.types";
import { PullRequestCommit } from "../../../schemas";

export const createReleaseAgentService = () => {
  // Public methods
  const summarizeCommits = async (
    commits: PullRequestCommit[],
    prTitle: string
  ): Promise<string> => {
    try {
      // Create a formatted string of commits for the agent to analyze
      const commitsText = commits
        .map((commit) => {
          const author = commit.commit.author?.name || "Unknown";
          const date = commit.commit.author?.date || "Unknown date";
          return `- ${commit.commit.message} (by ${author} on ${date})`;
        })
        .join("\n");

      // Create a prompt for the agent
      const prompt = `
        Please summarize the following pull request commits for a release changelog.
        You have to follow exactly this format without any other deviations.

        <additional-data>
          Pull Request Title: ${prTitle}
          Today's Date: ${new Date().toLocaleDateString()}
        </additional-data>

        <format>
        Bi-Weekly Update – EF Code Library

Date: [Insert Date]

Version: [Insert Version Number]

This changelog includes recent updates and ongoing work across two areas:

EF Backpack UI

EF Site Builder

 

Backpack UI

Enhancements

New

Use for commits introducing new features or components.

Look for:

Type: feat

Keywords: add, introduce, implement, new component, initial, create, launch, support, enable
Format:
New – [Component Name]: [Rewritten plain-language summary]

Update

Use for improvements to existing components.

Look for:

Type: feat, refactor, chore

Keywords: update, improve, change, adjust, replace, enhance, optimize
Format:
Update – [Component Name]: [Rewritten plain-language summary]

Fixes

Use for bug fixes and corrections.

Look for:

Type: fix

Keywords: bug, fix, error, issue, broken, problem, correct
Format:
Fix – [Component Name]: [Rewritten plain-language summary]

 

Site Builder

(Include all commits with the two letters [SB] after the component name)

Enhancements

New

New – [Component Name]: [Rewritten plain-language summary]

Update

Update – [Component Name]: [Rewritten plain-language summary]

Fixes

Fix – [Component Name]: [Rewritten plain-language summary]
        </format>

        ### Notes & Guidelines
- If the commit message lacks proper formatting, infer intent using keywords:
  - fix, resolve, broken → Fix
  - add, new, initial → New
  - update, improve, refactor → Update

### Determine section:

- feat → New or Update (check context)
- fix → Fix
- refactor / chore → usually Update

If component name includes SB, include it under Site Builder. Otherwise, include under Backpack UI.
Rewrite technical language into clear, non-technical summaries.
Combine multiple commits referencing the same feature/component.
Skip commits that are non-user-facing (e.g., “update README”, “bump version”, “lint”).
If uncertain, default to Update but flag for review.
        
        <commits>
          ${commitsText}
        </commits>
        
        Never deviate from the <format> given above.
        Return always a valid markdown string. ALWAYS MARKDOWN NEVER ANYTHING ELSE.
        It should be written in a way that is easy to understand for non-technical people.        
      `;

      // Get the agent to summarize the commits
      const agent = await agentFactory.createAgent("scribe");
      const rawSummary = await agent.act({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // 🔥 VALIDATE SCRIBE AGENT RESPONSE WITH ZOD
      const validation = validateAgentActResponse(rawSummary, "scribe");
      const summary = validation.data;

      if (!validation.success) {
        logger.warn(
          "⚠️ Scribe agent returned invalid response in release summary generation:",
          validation.error
        );
      }

      logger.info("### This is summary from scribe agent: ###");
      logger.info(summary);

      // Extract content from ChatMessage response
      const summaryContent =
        typeof summary === "string" ? summary : summary.content;
      return summaryContent || "";
    } catch (error) {
      logger.error("Error summarizing commits:", error);
      throw error;
    }
  };

  return {
    summarizeCommits,
  };
};

export const releaseAgentService = createReleaseAgentService();
