import { beforeAll, describe, expect, it } from "vitest";
import { serviceRegistry } from "../../registry/service-registry";
import { IntermediateLayout } from "./schema.types";
import { registerIRFServices } from "./services";
import { createIRFToStoryblokService } from "./services/IRFToStoryblokService/irf-to-storyblok.service";
import { irfTraversingService } from "./services/IRFTraversingService/irf-traversing.service";
import { createStoryblokToIRFService } from "./services/StoryblokToIRFService/storyblok-to-irf.service";
import { StoryblokStory } from "./services/StoryblokToIRFService/storyblok-to-irf.service.types";

// Mock dependencies
const createMockDesignIntentMapperService = () => ({
  map: (design: unknown, _componentType: string) => design,
});

const createMockAssetService = () => ({
  handleUpload: async (_imageRef: string, _name: string) =>
    "https://a.storyblok.com/f/test/image.jpg",
  prefetchImageFills: async (_fileKey: string) => {},
});

describe("IRF Slots Functionality", () => {
  let irfToStoryblokService: ReturnType<typeof createIRFToStoryblokService>;
  let storyblokToIRFService: ReturnType<typeof createStoryblokToIRFService>;

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

  describe("Accordion Item with Slots", () => {
    it("should transform accordion-item with slots to Storyblok format", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Accordion Test",
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
                        name: "FAQ Item 1",
                        slots: {
                          title: [
                            {
                              type: "headline",
                              name: "Question 1",
                              props: {
                                text: "What is IRF?",
                              },
                            },
                          ],
                          content: [
                            {
                              type: "text",
                              name: "Answer 1",
                              props: {
                                text: "IRF stands for Intermediate Representation Format",
                              },
                            },
                            {
                              type: "divider",
                              name: "Content Divider",
                            },
                            {
                              type: "text",
                              name: "Additional Info",
                              props: {
                                text: "It's used as an abstraction layer",
                              },
                            },
                          ],
                          icon: [
                            {
                              type: "image",
                              name: "FAQ Icon",
                              props: {
                                alt: "Question icon",
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

      const result =
        await irfToStoryblokService.transformIRFToStoryblok(testLayout);

      expect(result.success).toBe(true);
      const accordionItem = result.story.content.body[0].content[0].items[0];

      // Check that slots were properly transformed
      expect(accordionItem.component).toBe("sb-accordion-item");
      expect(accordionItem.title).toHaveLength(1);
      expect(accordionItem.content).toHaveLength(3);
      expect(accordionItem.icon).toHaveLength(1);

      // Verify title slot content
      expect(accordionItem.title[0].component).toBe("sb-headline");
      expect(accordionItem.title[0].content).toBe("What is IRF?");

      // Verify content slot items
      expect(accordionItem.content[0].component).toBe("sb-text");
      expect(accordionItem.content[1].component).toBe("sb-divider");
      expect(accordionItem.content[2].component).toBe("sb-text");
    });

    it("should handle accordion-item without slots (backward compatibility)", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Legacy Accordion Test",
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
                        name: "FAQ Item 1",
                        children: [
                          {
                            type: "text",
                            name: "Legacy Content",
                            props: {
                              text: "This is legacy content",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result =
        await irfToStoryblokService.transformIRFToStoryblok(testLayout);

      expect(result.success).toBe(true);
      const accordionItem = result.story.content.body[0].content[0].items[0];

      // Should fall back to content array when no slots
      expect(accordionItem.component).toBe("sb-accordion-item");
      expect(accordionItem.content).toHaveLength(1);
      expect(accordionItem.content[0].component).toBe("sb-text");
    });
  });

  describe("Editorial Card with Slots", () => {
    it("should transform editorial-card with slots to Storyblok format", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Editorial Card Test",
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
                    name: "Feature Card",
                    slots: {
                      card_title: [
                        {
                          type: "headline",
                          name: "Card Title",
                          props: {
                            text: "Amazing Feature",
                          },
                        },
                      ],
                      card_body: [
                        {
                          type: "text",
                          name: "Card Description",
                          props: {
                            text: "This feature is truly amazing",
                          },
                        },
                        {
                          type: "text",
                          name: "More Details",
                          props: {
                            text: "Here are more details about it",
                          },
                        },
                      ],
                      card_image: [
                        {
                          type: "image",
                          name: "Feature Image",
                          props: {
                            alt: "Feature illustration",
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

      const result =
        await irfToStoryblokService.transformIRFToStoryblok(testLayout);

      expect(result.success).toBe(true);
      const editorialCard = result.story.content.body[0].content[0];

      expect(editorialCard.component).toBe("sb-editorial-card");
      expect(editorialCard.card_title).toHaveLength(1);
      expect(editorialCard.card_body).toHaveLength(2);
      expect(editorialCard.card_image).toHaveLength(1);

      // Verify title transformation
      expect(editorialCard.card_title[0].component).toBe("sb-card-title");
      expect(editorialCard.card_title[0].content.type).toBe("doc");
      expect(editorialCard.card_title[0].content.content[0].type).toBe(
        "paragraph"
      );
      expect(
        editorialCard.card_title[0].content.content[0].content[0].text
      ).toBe("Amazing Feature");

      // Verify body transformation
      expect(editorialCard.card_body[0].component).toBe("sb-card-body");
      expect(editorialCard.card_body[1].component).toBe("sb-card-body");
    });
  });

  describe("IRF Traversing with Slots", () => {
    it("should properly traverse and enrich nodes with slots", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Traversal Test",
        content: [
          {
            type: "accordion-item",
            name: "Test Item",
            slots: {
              title: [
                {
                  type: "headline",
                  name: "Slot Title",
                  props: { text: "Title in slot" },
                },
              ],
              content: [
                {
                  type: "text",
                  name: "Slot Content",
                  props: { text: "Content in slot" },
                },
              ],
            },
          },
        ],
      };

      const result = await irfTraversingService.traverseAndEnrich(testLayout);

      expect(result.success).toBe(true);

      const accordionItem = result.enrichedLayout.content[0];
      expect(accordionItem.slots).toBeDefined();

      // Check that slot children have parent information
      expect(accordionItem.slots!.title[0].parentNodeName).toBe("Test Item");
      expect(accordionItem.slots!.title[0].parentNodeTypeName).toBe(
        "accordion-item"
      );

      expect(accordionItem.slots!.content[0].parentNodeName).toBe("Test Item");
      expect(accordionItem.slots!.content[0].parentNodeTypeName).toBe(
        "accordion-item"
      );
    });

    it("should find nodes in specific slots", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Slot Search Test",
        content: [
          {
            type: "accordion-item",
            name: "Item 1",
            slots: {
              title: [
                {
                  type: "headline",
                  name: "Title 1",
                  props: { text: "First title" },
                },
              ],
              content: [
                {
                  type: "text",
                  name: "Content 1",
                  props: { text: "First content" },
                },
              ],
            },
          },
          {
            type: "accordion-item",
            name: "Item 2",
            slots: {
              title: [
                {
                  type: "headline",
                  name: "Title 2",
                  props: { text: "Second title" },
                },
              ],
              content: [
                {
                  type: "text",
                  name: "Content 2",
                  props: { text: "Second content" },
                },
              ],
            },
          },
        ],
      };

      const titleNodes = await irfTraversingService.findNodesInSlot(
        testLayout,
        "title"
      );
      const contentNodes = await irfTraversingService.findNodesInSlot(
        testLayout,
        "content"
      );

      expect(titleNodes).toHaveLength(2);
      expect(titleNodes[0].name).toBe("Title 1");
      expect(titleNodes[1].name).toBe("Title 2");

      expect(contentNodes).toHaveLength(2);
      expect(contentNodes[0].name).toBe("Content 1");
      expect(contentNodes[1].name).toBe("Content 2");
    });

    it("should get all slot names used in layout", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Slot Names Test",
        content: [
          {
            type: "accordion-item",
            name: "Item 1",
            slots: {
              title: [],
              content: [],
              icon: [],
            },
          },
          {
            type: "editorial-card",
            name: "Card 1",
            slots: {
              card_title: [],
              card_body: [],
              card_image: [],
            },
          },
        ],
      };

      const slotNames = await irfTraversingService.getAllSlotNames(testLayout);

      expect(slotNames).toContain("title");
      expect(slotNames).toContain("content");
      expect(slotNames).toContain("icon");
      expect(slotNames).toContain("card_title");
      expect(slotNames).toContain("card_body");
      expect(slotNames).toContain("card_image");
    });
  });

  describe("Storyblok to IRF with Slots", () => {
    it("should transform Storyblok accordion-item back to IRF with slots", async () => {
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
              content: [
                {
                  component: "sb-accordion-section",
                  _uid: "accordion-uid",
                  items: [
                    {
                      component: "sb-accordion-item",
                      _uid: "item-uid",
                      title: [
                        {
                          component: "sb-headline-flex-group",
                          _uid: "title-uid",
                          content: "FAQ Question",
                        },
                      ],
                      content: [
                        {
                          component: "sb-text-flex-group",
                          _uid: "content-uid",
                          content: {
                            type: "doc",
                            content: [
                              {
                                type: "paragraph",
                                content: [
                                  {
                                    text: "FAQ Answer",
                                    type: "text",
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
              ],
            },
          ],
        },
        is_folder: false,
      };

      const result =
        await storyblokToIRFService.transformStoryblokToIRF(testStory);

      expect(result.success).toBe(true);

      const accordionItem =
        result.irfLayout.content[0].children![0].children![0].children![0];
      expect(accordionItem.type).toBe("accordion-item");
      expect(accordionItem.slots).toBeDefined();

      // Check slots were properly created
      expect(accordionItem.slots!.title).toHaveLength(1);
      expect(accordionItem.slots!.title[0].type).toBe("headline");
      expect(accordionItem.slots!.title[0].props?.content).toBe("FAQ Question");

      expect(accordionItem.slots!.content).toHaveLength(1);
      expect(accordionItem.slots!.content[0].type).toBe("text");
      expect(accordionItem.slots!.content[0].props?.text).toBe("FAQ Answer");
    });

    it("should transform Storyblok editorial-card back to IRF with slots", async () => {
      const testStory: StoryblokStory = {
        name: "Card Test Story",
        slug: "card-test",
        content: {
          component: "page",
          _uid: "page-uid",
          body: [
            {
              component: "sb-section",
              _uid: "section-uid",
              content: [
                {
                  component: "sb-editorial-card",
                  _uid: "card-uid",
                  card_title: [
                    {
                      component: "sb-card-title",
                      _uid: "title-uid",
                      content: {
                        type: "doc",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                text: "Card Title Text",
                                type: "text",
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                  card_body: [
                    {
                      component: "sb-card-body",
                      _uid: "body-uid",
                      content: {
                        type: "doc",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                text: "Card body content",
                                type: "text",
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                  card_image: [
                    {
                      component: "sb-image-card",
                      _uid: "image-uid",
                      image: {
                        filename: "https://example.com/image.jpg",
                        alt: "Card image",
                        name: "Image name",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        is_folder: false,
      };

      const result =
        await storyblokToIRFService.transformStoryblokToIRF(testStory);

      expect(result.success).toBe(true);

      const editorialCard =
        result.irfLayout.content[0].children![0].children![0];
      expect(editorialCard.type).toBe("editorial-card");
      expect(editorialCard.slots).toBeDefined();

      // Check card_title slot
      expect(editorialCard.slots!.card_title).toHaveLength(1);
      expect(editorialCard.slots!.card_title[0].type).toBe("headline");
      expect(editorialCard.slots!.card_title[0].props?.text).toBe(
        "Card Title Text"
      );

      // Check card_body slot
      expect(editorialCard.slots!.card_body).toHaveLength(1);
      expect(editorialCard.slots!.card_body[0].type).toBe("text");
      expect(editorialCard.slots!.card_body[0].props?.text).toBe(
        "Card body content"
      );

      // Check card_image slot
      expect(editorialCard.slots!.card_image).toHaveLength(1);
      expect(editorialCard.slots!.card_image[0].type).toBe("image");
      expect(editorialCard.slots!.card_image[0].props?.alt).toBe("Card image");
    });
  });

  describe("Slot Validation and Constraints", () => {
    it("should count nodes correctly including slots", async () => {
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Node Count Test",
        content: [
          {
            type: "accordion-item",
            name: "Item with slots",
            slots: {
              title: [
                {
                  type: "headline",
                  name: "Title 1",
                  props: { text: "Title" },
                },
              ],
              content: [
                {
                  type: "text",
                  name: "Text 1",
                  props: { text: "Content 1" },
                },
                {
                  type: "text",
                  name: "Text 2",
                  props: { text: "Content 2" },
                },
              ],
            },
          },
          {
            type: "section",
            name: "Regular section",
            children: [
              {
                type: "text",
                name: "Regular text",
                props: { text: "Some text" },
              },
            ],
          },
        ],
      };

      const nodeCount = await irfTraversingService.countNodes(testLayout);

      // Should count: 1 accordion-item + 1 headline + 2 texts in slots + 1 section + 1 text in children = 6 total
      expect(nodeCount).toBe(6);
    });
  });
});
