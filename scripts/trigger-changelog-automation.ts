#!/usr/bin/env tsx

/**
 * Changelog Automation CLI Script
 *
 * Triggers changelog creation automation for merged PRs.
 * Used by GitHub Actions workflows.
 *
 * Usage:
 *   npx tsx scripts/trigger-changelog-automation.ts --pr-number 123 --repo-owner ef-global --repo-name hq
 *
 * Environment Variables:
 *   THEGRID_API_URL - The base URL for the API
 *   THEGRID_API_TOKEN - The authentication token
 */

import { parseArgs } from "node:util";

interface AutomationRequest {
  source: string;
  type: string;
  payload: {
    repoOwner: string;
    repoName: string;
    prNumber: string;
  };
  metadata: {
    userId: string;
  };
}

interface CliArgs {
  "pr-number": string;
  "repo-owner": string;
  "repo-name": string;
  "trigger-type"?: string;
}

async function main() {
  console.log("🚀 Changelog Automation CLI Script");
  console.log("==================================");

  try {
    // Parse command line arguments
    const { values } = parseArgs({
      options: {
        "pr-number": { type: "string" },
        "repo-owner": { type: "string" },
        "repo-name": { type: "string" },
        "trigger-type": { type: "string", default: "manual" },
      },
    }) as { values: CliArgs };

    // Validate required arguments
    if (!values["pr-number"] || !values["repo-owner"] || !values["repo-name"]) {
      console.error("❌ Missing required arguments");
      console.error(
        "Usage: npx tsx scripts/trigger-changelog-automation.ts --pr-number <num> --repo-owner <owner> --repo-name <name>"
      );
      process.exit(1);
    }

    // Check environment variables
    const apiUrl = process.env.THEGRID_API_URL;
    const apiToken = process.env.THEGRID_API_TOKEN;

    console.log("\n=== Environment Check ===");

    if (!apiUrl) {
      console.error("❌ THEGRID_API_URL environment variable is not set");
      process.exit(1);
    }
    console.log(`✅ THEGRID_API_URL: ${apiUrl.substring(0, 30)}...`);

    if (!apiToken) {
      console.error("❌ THEGRID_API_TOKEN environment variable is not set");
      process.exit(1);
    }
    console.log(`✅ THEGRID_API_TOKEN: ${apiToken.substring(0, 8)}...`);

    // Validate API URL format
    if (!apiUrl.match(/^https?:\/\//)) {
      console.error("❌ THEGRID_API_URL must start with http:// or https://");
      process.exit(1);
    }

    // Prepare request data
    const prNumber = values["pr-number"];
    const repoOwner = values["repo-owner"];
    const repoName = values["repo-name"];
    const triggerType = values["trigger-type"];

    console.log("\n=== Request Details ===");
    console.log(`PR Number: ${prNumber}`);
    console.log(`Repository: ${repoOwner}/${repoName}`);
    console.log(`Trigger Type: ${triggerType}`);

    const fullUrl = `${apiUrl}/api/signals`;
    console.log(`API Endpoint: ${fullUrl}`);

    const requestPayload: AutomationRequest = {
      source: "release",
      type: "ready",
      payload: {
        repoOwner,
        repoName,
        prNumber,
      },
      metadata: {
        userId: "1",
      },
    };

    console.log("\n=== Request Payload ===");
    console.log(JSON.stringify(requestPayload, null, 2));

    // Make the API request
    console.log("\n=== Making API Request ===");
    console.log("Sending request...");

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(requestPayload),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
      console.log("\n=== Response Body ===");
      console.log(JSON.stringify(responseData, null, 2));
    } catch {
      console.log("\n=== Response Body (Raw) ===");
      console.log(responseText);
      responseData = { raw: responseText };
    }

    // Handle response
    if (response.ok) {
      console.log("\n✅ SUCCESS: Automation triggered successfully!");
      console.log(
        `✅ PR #${prNumber} changelog automation has been initiated.`
      );
      process.exit(0);
    } else {
      console.log("\n❌ FAILED: Automation request failed");
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);

      if (responseData?.error) {
        console.log(
          `❌ Error: ${responseData.error.message || responseData.error}`
        );
      }

      process.exit(1);
    }
  } catch (error) {
    console.error("\n💥 UNEXPECTED ERROR:");
    console.error(error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
