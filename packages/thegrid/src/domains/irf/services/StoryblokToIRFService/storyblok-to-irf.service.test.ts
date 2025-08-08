import { describe, it, expect, beforeEach } from "vitest";
import { createStoryblokToIRFService } from "./storyblok-to-irf.service";
import { StoryblokStory } from "./storyblok-to-irf.service.types";
import { registerIRFServices } from "../index";
import { serviceRegistry } from "../../../../registry/service-registry";

describe("StoryblokToIRFService", () => {
  let service: ReturnType<typeof createStoryblokToIRFService>;

  beforeEach(() => {
    // Register the actual IRF services (just like in the real app)
    registerIRFServices();

    // Get the service through the registry (same pattern as IRF-to-Storyblok tests)
    service = serviceRegistry.get("storyblokToIRF");
  });

  describe("Core Component Transformations", () => {
    it("should transform a simple page with section, headline, and text", async () => {
      const testStory: StoryblokStory = {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [
            {
              component: "sb-section",
              _uid: "section-uid",
              name: "Hero Section",
              content: [
                {
                  component: "sb-headline-section",
                  _uid: "headline-uid",
                  content: "Welcome to Our Site",
                  as: "h1",
                },
                {
                  component: "sb-text-section",
                  _uid: "text-uid",
                  content: {
                    type: "doc",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "This is a welcome message for our visitors.",
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        is_folder: false,
      };

      const result = await service.transformStoryblokToIRF(testStory);

      expect(result.success).toBe(true);
      expect(result.irfLayout.name).toBe("Test Story");
      expect(result.irfLayout.content).toHaveLength(1);

      const rootNode = result.irfLayout.content[0];
      expect(rootNode.type).toBe("page");
      expect(rootNode.children).toHaveLength(1);

      const sectionNode = rootNode.children![0];
      expect(sectionNode.type).toBe("section");
      expect(sectionNode.name).toBe("Hero Section");
      expect(sectionNode.children).toHaveLength(2);

      const headlineNode = sectionNode.children![0];
      expect(headlineNode.type).toBe("headline");
      expect(headlineNode.props?.content).toBe("Welcome to Our Site");
      expect(headlineNode.parentNodeTypeName).toBe("section");

      const textNode = sectionNode.children![1];
      expect(textNode.type).toBe("text");
      expect(textNode.props?.content).toBe(
        "This is a welcome message for our visitors."
      );
      expect(textNode.parentNodeTypeName).toBe("section");
    });

    it("should transform image components", async () => {
      const testStory: StoryblokStory = {
        name: "Image Test",
        slug: "image-test",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [
            {
              component: "sb-image-section",
              _uid: "image-uid",
              image: {
                filename: "https://a.storyblok.com/f/12345/image.jpg",
                alt: "Test Image",
                title: "A Beautiful Image",
                fieldtype: "asset",
              },
            },
          ],
        },
        is_folder: false,
      };

      const result = await service.transformStoryblokToIRF(testStory);

      expect(result.success).toBe(true);
      const imageNode = result.irfLayout.content[0].children![0];
      expect(imageNode.type).toBe("image");
      expect(imageNode.props?.alt).toBe("Test Image");
      expect(imageNode.props?.title).toBe("A Beautiful Image");
      expect(imageNode.design?.appearance?.backgroundColor?.imageRef).toBe(
        "https://a.storyblok.com/f/12345/image.jpg"
      );
    });

    it("should handle unknown components with fallback", async () => {
      const testStory: StoryblokStory = {
        name: "Unknown Component Test",
        slug: "unknown-test",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [
            {
              component: "sb-unknown-component",
              _uid: "unknown-uid",
              someProperty: "some value",
            },
          ],
        },
        is_folder: false,
      };

      const result = await service.transformStoryblokToIRF(testStory);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      expect(result.warnings![0]).toContain("Unknown Storyblok component");

      const fallbackNode = result.irfLayout.content[0].children![0];
      expect(fallbackNode.type).toBe("group");
      expect(fallbackNode.meta?.fallback).toBe(true);
      expect(fallbackNode.meta?.originalComponent).toBe("sb-unknown-component");
    });

    it("should extract text from rich text fields", () => {
      const richTextContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Hello ",
              },
              {
                type: "text",
                text: "world!",
                marks: [{ type: "bold" }],
              },
            ],
          },
        ],
      };

      const extractedText = service.extractTextFromRichText(richTextContent);
      expect(extractedText).toBe("Hello world!");
    });

    it("should handle empty content gracefully", async () => {
      const testStory: StoryblokStory = {
        name: "Empty Test",
        slug: "empty-test",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [],
        },
        is_folder: false,
      };

      const result = await service.transformStoryblokToIRF(testStory);

      expect(result.success).toBe(true);
      expect(result.irfLayout.content[0].children).toHaveLength(0);
    });
  });

  describe("Service Health", () => {
    it("should pass health check", async () => {
      const isHealthy = await service.isHealthy();
      expect(isHealthy).toBe(true);
    });
  });

  describe("Registry Management", () => {
    it("should register new reverse components", () => {
      const mockTransformer = (_component: any) => ({
        type: "test" as any,
        name: "Test Component",
      });

      service.registerReverseComponent(
        "sb-test-component",
        "test",
        mockTransformer,
        0.9,
        "Test component transformer"
      );

      const registry = service.getReverseComponentRegistry();
      expect(registry["sb-test-component"]).toBeDefined();
      expect(registry["sb-test-component"].targetIRFType).toBe("test");
      expect(registry["sb-test-component"].confidence).toBe(0.9);
    });
  });

  describe("Cache Management", () => {
    it("should manage cache correctly", async () => {
      const testStory: StoryblokStory = {
        name: "Cache Test",
        slug: "cache-test",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [],
        },
        is_folder: false,
      };

      // Initial stats
      let stats = service.getCacheStats();
      const initialSize = stats.size;

      // Transform (should cache)
      await service.transformStoryblokToIRF(testStory);

      // Check cache grew
      stats = service.getCacheStats();
      expect(stats.size).toBe(initialSize + 1);

      // Clear cache
      service.clearCache();
      stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });
});
