import { readFileSync } from "fs";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import "dotenv/config";

export interface GitHubApp {
  appId: number;
  webhookSecret: string;
  getInstallationOctokit: (installationId: number) => Octokit;
}

function validateEnv() {
  const requiredEnvVars = {
    GITHUB_APP_ID: process.env.GITHUB_APP_ID,
    GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
    GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

function getPrivateKey(): string {
  // In production (Railway), use the environment variable
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("GITHUB_PRIVATE_KEY is required in production");
  }

  return privateKey;
}

export const createGitHubApp = (): GitHubApp => {
  validateEnv();

  const appId = Number(process.env.GITHUB_APP_ID);
  if (isNaN(appId)) {
    throw new Error("GITHUB_APP_ID must be a valid number");
  }

  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;
  let privateKey: string;

  try {
    privateKey = getPrivateKey();

    // Basic validation of private key format
    if (!privateKey.includes("-----BEGIN RSA PRIVATE KEY-----")) {
      throw new Error("Invalid private key format");
    }
  } catch (error) {
    throw new Error(
      `Failed to load private key: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const getInstallationOctokit = (installationId: number) => {
    if (!Number.isInteger(installationId) || installationId <= 0) {
      throw new Error("Invalid installation ID");
    }

    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    });
  };

  return { appId, webhookSecret, getInstallationOctokit };
};

export const githubApp = createGitHubApp();
