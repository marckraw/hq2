import { logger } from "@/utils/logger";
import { Octokit } from "@octokit/rest";
import { config } from "@/config.env";
import {
  type GitHubCommit as _GitHubCommit,
  type PullRequestCommit,
  type GetPullRequestCommitsInput as _GetPullRequestCommitsInput,
  type GetPullRequestDetailsInput as _GetPullRequestDetailsInput,
  GetPullRequestCommitsInputSchema,
  GetPullRequestDetailsInputSchema,
} from "@/schemas/services.schemas";

export const createGitHubService = (token?: string) => {
  // Private state
  const octokit = new Octokit({
    auth: token || config.GITHUB_TOKEN,
  });

  // Public methods
  const getPullRequestCommits = async (
    repoOwner: string,
    repoName: string,
    prNumber: string
  ): Promise<PullRequestCommit[]> => {
    // Validate input
    const validatedInput = GetPullRequestCommitsInputSchema.parse({
      repoOwner,
      repoName,
      prNumber,
    });

    try {
      const response = await octokit.pulls.listCommits({
        owner: validatedInput.repoOwner,
        repo: validatedInput.repoName,
        pull_number: parseInt(validatedInput.prNumber, 10),
      });

      return response.data;
    } catch (error) {
      logger.error("Error fetching PR commits:", error);
      throw error;
    }
  };

  const getPullRequestDetails = async (
    repoOwner: string,
    repoName: string,
    prNumber: string
  ) => {
    // Validate input
    const validatedInput = GetPullRequestDetailsInputSchema.parse({
      repoOwner,
      repoName,
      prNumber,
    });

    try {
      const response = await octokit.pulls.get({
        owner: validatedInput.repoOwner,
        repo: validatedInput.repoName,
        pull_number: parseInt(validatedInput.prNumber, 10),
      });

      return response.data;
    } catch (error) {
      logger.error("Error fetching PR details:", error);
      throw error;
    }
  };

  return {
    getPullRequestCommits,
    getPullRequestDetails,
  };
};

export const githubService = createGitHubService();

export type GitHubService = typeof githubService;
