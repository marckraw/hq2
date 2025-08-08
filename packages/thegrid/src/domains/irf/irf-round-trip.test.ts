import { describe, it, expect, beforeAll } from "vitest";
import { serviceRegistry } from "@/registry/service-registry";
import { IntermediateLayout } from "./schema.types";
import { IRFToStoryblokService } from "./services/IRFToStoryblokService/irf-to-storyblok.service.types";
import { StoryblokToIRFService } from "./services/StoryblokToIRFService/storyblok-to-irf.service.types";
import { registerIRFServices } from "./services";

// Mock dependencies
const createMockDesignIntentMapperService = () => ({
  map: (design: unknown, _componentType: string) => design,
});

const createMockAssetService = () => ({
  handleUpload: async (_imageRef: string, _name: string) =>
    "https://a.storyblok.com/f/test/image.jpg",
  prefetchImageFills: async (_fileKey: string) => {},
});

describe("IRF Round-Trip Transformation", () => {
  let irfToStoryblokService: IRFToStoryblokService;
  let storyblokToIRFService: StoryblokToIRFService;

  beforeAll(() => {
    // Register all IRF services first
    registerIRFServices();

    // Override with mock services as needed
    serviceRegistry.mock(
      "designIntentMapper",
      createMockDesignIntentMapperService()
    );
    serviceRegistry.mock("asset", createMockAssetService());

    irfToStoryblokService = serviceRegistry.get("irfToStoryblok");
    storyblokToIRFService = serviceRegistry.get("storyblokToIRF");
  });

  describe("Accordion Item Round-Trip", () => {
    it("should maintain slot structure through round-trip transformation", async () => {
      const originalIRF: IntermediateLayout = {
        version: "1.0",
        name: "Round-Trip Test",
        content: [
          {
            type: "page",
            name: "Test Page",
            children: [
              {
                type: "section",
                name: "FAQ Section",
                children: [
                  {
                    type: "accordion",
                    name: "FAQ Accordion",
                    children: [
                      {
                        type: "accordion-item",
                        name: "FAQ Item",
                        slots: {
                          title: [
                            {
                              type: "headline",
                              name: "Question",
                              props: {
                                text: "What is round-trip transformation?",
                              },
                            },
                          ],
                          content: [
                            {
                              type: "text",
                              name: "Answer Part 1",
                              props: {
                                text: "It's the process of converting IRF to Storyblok and back.",
                              },
                            },
                            {
                              type: "divider",
                              name: "Separator",
                            },
                            {
                              type: "text",
                              name: "Answer Part 2",
                              props: {
                                text: "The structure should remain intact.",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Transform IRF to Storyblok
      const storyblokResult =
        await irfToStoryblokService.transformIRFToStoryblok(originalIRF);
      expect(storyblokResult.success).toBe(true);

      // Extract the accordion item from Storyblok structure
      const accordionItem =
        storyblokResult.story.content.body[0].content[0].items[0];
      expect(accordionItem.component).toBe("sb-accordion-item");
      expect(accordionItem.title).toHaveLength(1);
      expect(accordionItem.content).toHaveLength(3);

      // Transform back to IRF
      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(
        storyblokResult.story
      );
      expect(irfResult.success).toBe(true);

      // Check that no warnings about missing components were generated
      const warnings = storyblokToIRFService.getWarnings();
      const missingComponentWarnings = warnings.filter(
        (w) => w.type === "MISSING_COMPONENT"
      );
      expect(missingComponentWarnings).toHaveLength(0);

      // Verify the structure is maintained
      const roundTripAccordionItem =
        irfResult.irfLayout.content[0].children![0].children![0].children![0];
      expect(roundTripAccordionItem.type).toBe("accordion-item");
      expect(roundTripAccordionItem.slots).toBeDefined();

      // Check title slot
      expect(roundTripAccordionItem.slots!.title).toHaveLength(1);
      expect(roundTripAccordionItem.slots!.title[0].type).toBe("headline");
      expect(roundTripAccordionItem.slots!.title[0].props.text).toBe(
        "What is round-trip transformation?"
      );

      // Check content slot
      expect(roundTripAccordionItem.slots!.content).toHaveLength(3);
      expect(roundTripAccordionItem.slots!.content[0].type).toBe("text");
      expect(roundTripAccordionItem.slots!.content[0].props.text).toBe(
        "It's the process of converting IRF to Storyblok and back."
      );
      expect(roundTripAccordionItem.slots!.content[1].type).toBe("divider");
      expect(roundTripAccordionItem.slots!.content[2].type).toBe("text");
      expect(roundTripAccordionItem.slots!.content[2].props.text).toBe(
        "The structure should remain intact."
      );

      // Ensure no "group" nodes were created
      const findGroupNodes = (node: any): boolean => {
        if (node.type === "group") return true;
        if (node.children) {
          return node.children.some(findGroupNodes);
        }
        if (node.slots) {
          return Object.values(node.slots).some((slotNodes: any) =>
            slotNodes.some(findGroupNodes)
          );
        }
        return false;
      };

      const hasGroupNodes = irfResult.irfLayout.content.some(findGroupNodes);
      expect(hasGroupNodes).toBe(false);
    });

    it("should handle unknown components gracefully", async () => {
      // Create a Storyblok story with an unknown component
      const storyWithUnknown = {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [
            {
              component: "sb-section",
              _uid: "section-uid",
              content: [
                {
                  component: "sb-unknown-component",
                  _uid: "unknown-uid",
                  text: "This is unknown",
                },
              ],
            },
          ],
        },
        is_folder: false,
      };

      const result =
        await storyblokToIRFService.transformStoryblokToIRF(storyWithUnknown);
      expect(result.success).toBe(true);

      // Check that a warning was generated
      const warnings = storyblokToIRFService.getWarnings();
      const unknownWarnings = warnings.filter(
        (w) =>
          w.type === "UNSUPPORTED_COMPONENT" &&
          w.component === "sb-unknown-component"
      );
      expect(unknownWarnings.length).toBeGreaterThan(0);
      expect(unknownWarnings[0].impact).toBe("medium");

      // Check that fallback was used
      const unknownNode = result.irfLayout.content[0].children![0].children![0];
      expect(unknownNode.meta?.fallback).toBe(true);
      expect(unknownNode.meta?.originalComponent).toBe("sb-unknown-component");
      expect(unknownNode.props?.originalComponent).toBe("sb-unknown-component");
    });
  });

  describe("Editorial Card Round-Trip", () => {
    it("should maintain editorial card slots through round-trip", async () => {
      const originalIRF: IntermediateLayout = {
        version: "1.0",
        name: "Editorial Card Round-Trip",
        content: [
          {
            type: "page",
            name: "Test Page",
            children: [
              {
                type: "section",
                name: "Card Section",
                children: [
                  {
                    type: "editorial-card",
                    name: "Test Card",
                    slots: {
                      card_title: [
                        {
                          type: "headline",
                          name: "Card Title",
                          props: {
                            text: "Feature Headline",
                          },
                        },
                      ],
                      card_body: [
                        {
                          type: "text",
                          name: "Body Text",
                          props: {
                            text: "Feature description here",
                          },
                        },
                      ],
                      card_image: [
                        {
                          type: "image",
                          name: "Card Image",
                          props: {
                            alt: "Feature image",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      // Transform to Storyblok and back
      const storyblokResult =
        await irfToStoryblokService.transformIRFToStoryblok(originalIRF);
      expect(storyblokResult.success).toBe(true);

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(
        storyblokResult.story
      );
      expect(irfResult.success).toBe(true);

      // Verify editorial card structure
      const editorialCard =
        irfResult.irfLayout.content[0].children![0].children![0];
      expect(editorialCard.type).toBe("editorial-card");
      expect(editorialCard.slots).toBeDefined();
      expect(editorialCard.slots!.card_title).toHaveLength(1);
      expect(editorialCard.slots!.card_body).toHaveLength(1);
      expect(editorialCard.slots!.card_image).toHaveLength(1);
    });
  });
});
