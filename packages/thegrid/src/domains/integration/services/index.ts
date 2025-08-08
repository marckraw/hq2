import { createStoryblokService } from "./StoryblokService/storyblok.service";
import { githubService } from "./GithubService/github.service";
import { changelogService } from "./ChangelogService/changelog.service";
import { youtubeService } from "./YoutubeService/youtube.service";
import { serviceRegistry } from "../../../registry/service-registry";

import type { StoryblokService } from "./StoryblokService/storyblok.service";
import type { GitHubService } from "./GithubService/github.service";
import type { ChangelogService } from "./ChangelogService/changelog.service";
import type { YoutubeService } from "./YoutubeService/youtube.service";
import { config } from "@/config.env";

// Register integration services with the service registry
const registerIntegrationServices = () => {
  // ✅ Register Storyblok service (eager loading - core service)
  serviceRegistry.register("storyblok", () =>
    createStoryblokService({
      oauthToken: config.STORYBLOK_OAUTH_TOKEN,
      accessToken: config.STORYBLOK_ACCESS_TOKEN,
      spaceId: "317084",
    })
  );
  serviceRegistry.register("github", () => githubService);
  serviceRegistry.register("changelog", () => changelogService);
  serviceRegistry.registerLazy("youtube", () => youtubeService);
};

// Domain-specific service accessors (functional style)
const createIntegrationServices = () => {
  return {
    storyblok: () =>
      createStoryblokService({
        oauthToken: config.STORYBLOK_OAUTH_TOKEN,
        accessToken: config.STORYBLOK_ACCESS_TOKEN,
        spaceId: "317084",
      }),
    github: () => githubService,
    changelog: () => changelogService,
    youtube: () => youtubeService,
  };
};

registerIntegrationServices();

export const integrationServices = createIntegrationServices();

// Individual exports for convenience
export const { storyblok, github, changelog, youtube } = integrationServices;

// Type exports
export type IntegrationServices = {
  storyblok: StoryblokService;
  github: GitHubService;
  changelog: ChangelogService;
  youtube: YoutubeService;
};
