import { describe, it, expect, beforeAll } from "vitest";
import { serviceRegistry } from "../../registry/service-registry.ts";
import { StoryblokStory } from "./services/StoryblokToIRFService/storyblok-to-irf.service.types";
import { createIRFToStoryblokService } from "./services/IRFToStoryblokService/irf-to-storyblok.service";
import { createStoryblokToIRFService } from "./services/StoryblokToIRFService/storyblok-to-irf.service";
import { irfTraversingService } from "./services/IRFTraversingService/irf-traversing.service";

// Import real design intent mapper service
import { createDesignIntentMapperService } from "./services/DesignIntentMapperService/design-intent-mapper.service";
import { createStoryblokDesignToIRFService } from "./services/StoryblokDesignToIRFService/storyblok-design-to-irf.service";

// Mock dependencies (only mock what we truly need to)
const createMockAssetService = () => ({
  handleUpload: async (_imageRef: string, _name: string) => "https://a.storyblok.com/f/test/image.jpg",
  prefetchImageFills: async (_fileKey: string) => {},
});

// Test data builders
const createSimpleStory = (): StoryblokStory => ({
  name: "Simple Test Story",
  slug: "simple-test-story",
  content: {
    component: "page",
    _uid: "page-123",
    body: [
      {
        component: "sb-section",
        _uid: "section-456",
        name: "Test Section",
        content: [
          {
            component: "sb-headline-section",
            _uid: "headline-789",
            content: "Test Headline",
            as: "h2",
            custom_classname: "test-headline-class",
          },
          {
            component: "sb-text-section",
            _uid: "text-012",
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "This is a test paragraph.",
                    },
                  ],
                },
              ],
            },
            custom_classname: "test-text-class",
          },
        ],
        backpack_ai: "test-ai-content",
        custom_classname: "test-section-class",
      },
    ],
    no_index: false,
    no_follow: false,
    seo_meta_fields: "test meta fields",
    structured_data: "test structured data",
  },
  is_folder: false,
  parent_id: 12345,
  group_id: "test-group",
  tag_list: ["test", "sample"],
  position: 10,
});

const createStoryWithDesignTokens = (): StoryblokStory => ({
  name: "Story with Design Tokens",
  slug: "story-with-design-tokens",
  content: {
    component: "page",
    _uid: "page-design-123",
    body: [
      {
        component: "sb-section",
        _uid: "section-design-456",
        name: "Designed Section",
        design: {
          fields: {
            gap: { type: "option", values: { s: "m" } },
            spacing: {
              type: "custom",
              values: { s: { pb: "xl", pt: "xl", pl: "m", pr: "m" } },
              field_type: "backpack-spacing",
            },
            text_color: {
              type: "custom",
              values: {
                s: {
                  selected: {
                    id: 11388533,
                    name: "Brand/Primary",
                    value: "#1a73e8",
                    dimension_value: null,
                  },
                },
              },
              field_type: "backpack-color-picker",
            },
            background_color: {
              type: "custom",
              values: {
                s: {
                  selected: {
                    id: 11388534,
                    name: "Surface/Light",
                    value: "#f8f9fa",
                    dimension_value: null,
                  },
                },
              },
              field_type: "backpack-color-picker",
            },
          },
          plugin: "backpack-breakpoints",
          version: "2.5.2",
        },
        content: [
          {
            component: "sb-headline-section",
            _uid: "headline-design-789",
            content: "Styled Headline",
            as: "h1",
            design: {
              fields: {
                variant: { type: "option", values: { s: "header1" } },
                text_align: {
                  type: "custom",
                  values: { s: "center" },
                  field_type: "backpack-toggle",
                },
              },
              plugin: "backpack-breakpoints",
              version: "2.5.2",
            },
          },
        ],
      },
    ],
  },
  is_folder: false,
});

describe("Storyblok Round-Trip Data Integrity", () => {
  let irfToStoryblokService: ReturnType<typeof createIRFToStoryblokService>;
  let storyblokToIRFService: ReturnType<typeof createStoryblokToIRFService>;

  beforeAll(() => {
    // Register real design intent mapper service
    serviceRegistry.register("designIntentMapper", createDesignIntentMapperService);
    serviceRegistry.register("storyblokDesignToIRF", createStoryblokDesignToIRFService);
    // @ts-expect-error - Mock asset service
    serviceRegistry.register("asset", createMockAssetService);
    serviceRegistry.register("irfTraversing", () => irfTraversingService);
    serviceRegistry.register("irfToStoryblok", createIRFToStoryblokService);
    serviceRegistry.register("storyblokToIRF", createStoryblokToIRFService);

    irfToStoryblokService = serviceRegistry.get("irfToStoryblok");
    storyblokToIRFService = serviceRegistry.get("storyblokToIRF");
  });

  describe("Simple Components", () => {
    it("should preserve data through Storyblok → IRF → Storyblok transformation", async () => {
      const originalStory = createSimpleStory();

      // Transform to IRF
      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(originalStory);
      expect(irfResult.success).toBe(true);

      // Transform back to Storyblok
      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout, {
        storyName: originalStory.name,
        storySlug: originalStory.slug,
        parentId: originalStory.parent_id,
        groupId: originalStory.group_id,
      });
      expect(storyblokResult.success).toBe(true);

      // Check critical fields are preserved
      expect(storyblokResult.story.name).toBe(originalStory.name);
      expect(storyblokResult.story.slug).toBe(originalStory.slug);
      expect(storyblokResult.story.parent_id).toBe(originalStory.parent_id);
      expect(storyblokResult.story.group_id).toBe(originalStory.group_id);

      // Check content structure
      const transformedContent = storyblokResult.story.content;
      expect(transformedContent.component).toBe("page");
      expect(transformedContent.body).toHaveLength(1);

      const section = transformedContent.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.name).toBe("Test Section");
      expect(section.custom_classname).toBe("test-section-class");
      expect(section.backpack_ai).toBe("test-ai-content");
      expect(section.content).toHaveLength(2);

      // Check headline
      const headline = section.content[0];
      expect(headline.component).toBe("sb-headline-section");
      expect(headline.content).toBe("Test Headline");
      expect(headline.as).toBe("h2");
      expect(headline.custom_classname).toBe("test-headline-class");

      // Check text
      const text = section.content[1];
      expect(text.component).toBe("sb-text-section");
      expect(text.custom_classname).toBe("test-text-class");
      expect(text.content.content[0].content[0].text).toBe("This is a test paragraph.");
    });

    it("should handle empty values correctly", async () => {
      const storyWithEmptyValues: StoryblokStory = {
        name: "Empty Values Test",
        slug: "empty-values-test",
        content: {
          component: "page",
          _uid: "page-empty",
          body: [
            {
              component: "sb-section",
              _uid: "section-empty",
              name: "",
              content: [],
              custom_classname: "",
              backpack_ai: "",
            },
          ],
        },
        is_folder: false,
      };

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(storyWithEmptyValues);
      expect(irfResult.success).toBe(true);

      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout);
      expect(storyblokResult.success).toBe(true);

      const section = storyblokResult.story.content.body[0];
      expect(section.name).toBe("");
      expect(section.content).toEqual([]);
      expect(section.custom_classname).toBe("");
      expect(section.backpack_ai).toBe("");
    });
  });

  describe("Complex Components", () => {
    it("should preserve design tokens through transformation", async () => {
      const originalStory = createStoryWithDesignTokens();

      // Transform to IRF
      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(originalStory);
      expect(irfResult.success).toBe(true);

      // Check design was captured in IRF
      const irfSection = irfResult.irfLayout.content[0].children![0];
      expect(irfSection.design).toBeDefined();

      // Transform back to Storyblok
      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout, {
        storyName: originalStory.name,
        storySlug: originalStory.slug,
      });
      expect(storyblokResult.success).toBe(true);

      // Check design tokens are preserved
      const transformedSection = storyblokResult.story.content.body[0];
      expect(transformedSection.design).toBeDefined();
      expect(transformedSection.design.fields).toBeDefined();
      expect(transformedSection.design.fields.gap).toEqual(originalStory.content.body[0].design.fields.gap);
      expect(transformedSection.design.fields.spacing).toEqual(originalStory.content.body[0].design.fields.spacing);
      expect(transformedSection.design.plugin).toBe("backpack-breakpoints");

      // Check headline design
      const transformedHeadline = transformedSection.content[0];
      expect(transformedHeadline.design).toBeDefined();
      expect(transformedHeadline.design.fields.variant).toEqual(
        originalStory.content.body[0].content[0].design.fields.variant
      );
    });
  });

  describe("Design Transformation", () => {
    it("should transform design through IRF DesignIntent format", async () => {
      const storyWithDesign: StoryblokStory = {
        name: "Design Transformation Test",
        slug: "design-transformation-test",
        content: {
          component: "page",
          _uid: "page-design-test",
          body: [
            {
              component: "sb-section",
              _uid: "section-design-test",
              name: "Test Section",
              design: {
                fields: {
                  spacing: {
                    type: "custom",
                    field_type: "backpack-spacing",
                    values: { s: { pt: "xl", pb: "xl", pl: "m", pr: "m" } },
                  },
                  gap: {
                    type: "option",
                    values: { s: "m" },
                  },
                  text_color: {
                    type: "custom",
                    field_type: "backpack-color-picker",
                    values: {
                      s: {
                        selected: {
                          id: 11388533,
                          name: "Brand/Primary",
                          value: "#1a73e8",
                          dimension_value: null,
                        },
                      },
                    },
                  },
                },
                plugin: "backpack-breakpoints",
                version: "2.5.2",
              },
              content: [],
            },
          ],
        },
        is_folder: false,
      };

      // Transform to IRF
      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(storyWithDesign);
      expect(irfResult.success).toBe(true);

      // Check design was transformed to IRF DesignIntent format
      const irfSection = irfResult.irfLayout.content[0].children![0];
      expect(irfSection.design).toBeDefined();
      expect(irfSection.design.layout).toBeDefined();
      expect(irfSection.design.layout.padding).toEqual({
        top: "xl",
        bottom: "xl",
        left: "m",
        right: "m",
      });
      expect(irfSection.design.layout.gap).toBe("m");
      expect(irfSection.design.appearance).toBeDefined();
      expect(irfSection.design.appearance.textColor).toBe("#1a73e8");
      expect(irfSection.design.typography).toBeDefined();
      expect(irfSection.design.typography.color).toBe("#1a73e8");

      // Transform back to Storyblok
      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout, {
        storyName: storyWithDesign.name,
        storySlug: storyWithDesign.slug,
      });
      expect(storyblokResult.success).toBe(true);

      // Check design was transformed back to Storyblok format
      const transformedSection = storyblokResult.story.content.body[0];
      expect(transformedSection.design).toBeDefined();
      expect(transformedSection.design.fields).toBeDefined();

      // These should be preserved through the transformation
      expect(transformedSection.design.fields.spacing).toEqual({
        type: "custom",
        field_type: "backpack-spacing",
        values: { s: { pt: "xl", pb: "xl", pl: "m", pr: "m" } },
      });
      expect(transformedSection.design.fields.gap).toEqual({
        type: "option",
        values: { s: "m" },
      });

      // Color should be preserved (though the mapper returns a placeholder structure)
      expect(transformedSection.design.fields.text_color).toBeDefined();
      expect(transformedSection.design.fields.text_color.values.s.selected.value).toBe("#1a73e8");
    });
  });

  describe("Edge Cases", () => {
    it("should handle unknown components gracefully", async () => {
      const storyWithUnknown: StoryblokStory = {
        name: "Unknown Component Story",
        slug: "unknown-component-story",
        content: {
          component: "page",
          _uid: "page-unknown",
          body: [
            {
              component: "sb-future-component",
              _uid: "future-123",
              futureProperty: "future value",
              nested: {
                deepProperty: "deep value",
              },
            },
          ],
        },
        is_folder: false,
      };

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(storyWithUnknown);
      expect(irfResult.success).toBe(true);
      expect(irfResult.warnings).toBeDefined();
      expect(irfResult.warnings!.length).toBeGreaterThan(0);

      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout);
      expect(storyblokResult.success).toBe(true);

      // The unknown component should be preserved in some form
      const transformedBody = storyblokResult.story.content.body;
      expect(transformedBody.length).toBeGreaterThan(0);
    });
  });

  describe("Data Preservation", () => {
    it("should generate _uid fields when missing", async () => {
      const storyWithoutUids: StoryblokStory = {
        name: "No UIDs Story",
        slug: "no-uids-story",
        content: {
          component: "page",
          body: [
            {
              component: "sb-section",
              name: "Section without UID",
              content: [],
            },
          ],
        },
        is_folder: false,
      };

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(storyWithoutUids);
      expect(irfResult.success).toBe(true);

      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout);
      expect(storyblokResult.success).toBe(true);

      // Check that UIDs were generated
      expect(storyblokResult.story.content._uid).toBeDefined();
      expect(storyblokResult.story.content.body[0]._uid).toBeDefined();
    });
  });

  describe("Nested Structures", () => {
    it("should preserve accordion with slots through transformation", async () => {
      const storyWithAccordion: StoryblokStory = {
        name: "Accordion Story",
        slug: "accordion-story",
        content: {
          component: "page",
          _uid: "page-accordion",
          body: [
            {
              component: "sb-section",
              _uid: "section-accordion",
              name: "FAQ Section",
              content: [
                {
                  component: "sb-accordion-section",
                  _uid: "accordion-main",
                  type: "multiple",
                  custom_classname: "faq-accordion",
                  items: [
                    {
                      component: "sb-accordion-item",
                      _uid: "accordion-item-1",
                      title: [
                        {
                          component: "sb-headline",
                          _uid: "accordion-title-1",
                          content: "What is IRF?",
                          as: "h3",
                        },
                      ],
                      content: [
                        {
                          component: "sb-text",
                          _uid: "accordion-text-1",
                          content: {
                            type: "doc",
                            content: [
                              {
                                type: "paragraph",
                                content: [
                                  {
                                    type: "text",
                                    text: "IRF stands for Intermediate Representation Format.",
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        {
                          component: "sb-divider",
                          _uid: "accordion-divider-1",
                        },
                        {
                          component: "sb-text",
                          _uid: "accordion-text-2",
                          content: {
                            type: "doc",
                            content: [
                              {
                                type: "paragraph",
                                content: [
                                  {
                                    type: "text",
                                    text: "It bridges Figma designs and Storyblok content.",
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

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(storyWithAccordion);
      expect(irfResult.success).toBe(true);

      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout, {
        storyName: storyWithAccordion.name,
        storySlug: storyWithAccordion.slug,
      });
      expect(storyblokResult.success).toBe(true);

      // Verify structure is preserved
      const accordion = storyblokResult.story.content.body[0].content[0];
      expect(accordion.component).toBe("sb-accordion-section");
      expect(accordion.type).toBe("multiple");
      expect(accordion.custom_classname).toBe("faq-accordion");
      expect(accordion.items).toHaveLength(1);

      const accordionItem = accordion.items[0];
      expect(accordionItem.component).toBe("sb-accordion-item");
      expect(accordionItem.title).toHaveLength(1);
      expect(accordionItem.content).toHaveLength(3);

      // Check slot content
      expect(accordionItem.title[0].component).toBe("sb-headline");
      expect(accordionItem.title[0].content).toBe("What is IRF?");
      expect(accordionItem.content[0].component).toBe("sb-text");
      expect(accordionItem.content[1].component).toBe("sb-divider");
      expect(accordionItem.content[2].component).toBe("sb-text");
    });

    it("should preserve editorial card with slots through transformation", async () => {
      const storyWithEditorialCard: StoryblokStory = {
        name: "Editorial Card Story",
        slug: "editorial-card-story",
        content: {
          component: "page",
          _uid: "page-editorial",
          body: [
            {
              component: "sb-section",
              _uid: "section-editorial",
              name: "Card Section",
              content: [
                {
                  component: "sb-editorial-card",
                  _uid: "card-main",
                  card_title: [
                    {
                      component: "sb-card-title",
                      _uid: "card-title-1",
                      content: {
                        type: "doc",
                        content: [
                          {
                            type: "paragraph",
                            content: [{ text: "Feature Spotlight", type: "text" }],
                          },
                        ],
                      },
                    },
                  ],
                  card_body: [
                    {
                      component: "sb-card-body",
                      _uid: "card-body-1",
                      content: {
                        type: "doc",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                text: "Learn about our latest features.",
                                type: "text",
                              },
                            ],
                          },
                        ],
                      },
                    },
                    {
                      component: "sb-card-body",
                      _uid: "card-body-2",
                      content: {
                        type: "doc",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                text: "Experience the power of automation.",
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
                      _uid: "card-image-1",
                      image: {
                        filename: "https://a.storyblok.com/f/test/feature.jpg",
                        alt: "Feature Image",
                        title: "Our Latest Feature",
                        fieldtype: "asset",
                      },
                    },
                  ],
                  card_link: {
                    id: "",
                    url: "/features",
                    linktype: "url",
                    fieldtype: "multilink",
                    cached_url: "/features",
                  },
                },
              ],
            },
          ],
        },
        is_folder: false,
      };

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(storyWithEditorialCard);
      expect(irfResult.success).toBe(true);

      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout, {
        storyName: storyWithEditorialCard.name,
        storySlug: storyWithEditorialCard.slug,
      });
      expect(storyblokResult.success).toBe(true);

      // Verify editorial card structure
      const editorialCard = storyblokResult.story.content.body[0].content[0];
      expect(editorialCard.component).toBe("sb-editorial-card");

      // Check slots
      expect(editorialCard.card_title).toHaveLength(1);
      expect(editorialCard.card_body).toHaveLength(2);
      expect(editorialCard.card_image).toHaveLength(1);

      // Verify slot content
      expect(editorialCard.card_title[0].component).toBe("sb-card-title");
      expect(editorialCard.card_body[0].component).toBe("sb-card-body");
      expect(editorialCard.card_body[1].component).toBe("sb-card-body");
      expect(editorialCard.card_image[0].component).toBe("sb-image-card");

      // Check link preservation
      expect(editorialCard.card_link).toBeDefined();
      expect(editorialCard.card_link.url).toBe("/features");
      expect(editorialCard.card_link.linktype).toBe("url");
    });

    it("should handle deeply nested structures", async () => {
      const deeplyNestedStory: StoryblokStory = {
        name: "Deeply Nested Story",
        slug: "deeply-nested-story",
        content: {
          component: "page",
          _uid: "page-deep",
          body: [
            {
              component: "sb-section",
              _uid: "section-outer",
              name: "Outer Section",
              content: [
                {
                  component: "sb-flex-group-section",
                  _uid: "flex-outer",
                  name: "Outer Flex",
                  content: [
                    {
                      component: "sb-headline-flex-group",
                      _uid: "headline-flex",
                      content: "Nested Headline",
                      as: "h3",
                    },
                    {
                      component: "sb-accordion-flex-group",
                      _uid: "accordion-flex",
                      type: "single",
                      items: [
                        {
                          component: "sb-accordion-item",
                          _uid: "accordion-item-nested",
                          title: [
                            {
                              component: "sb-headline",
                              _uid: "accordion-title-nested",
                              content: "Nested Question",
                              as: "h4",
                            },
                          ],
                          content: [
                            {
                              component: "sb-blockquote",
                              _uid: "blockquote-nested",
                              content: {
                                type: "doc",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "A quote within an accordion within a flex group.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              citation: {
                                type: "doc",
                                content: [
                                  {
                                    type: "paragraph",
                                    content: [
                                      {
                                        type: "text",
                                        text: "Deep Nester",
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
          ],
        },
        is_folder: false,
      };

      const irfResult = await storyblokToIRFService.transformStoryblokToIRF(deeplyNestedStory);
      expect(irfResult.success).toBe(true);

      const storyblokResult = await irfToStoryblokService.transformIRFToStoryblok(irfResult.irfLayout, {
        storyName: deeplyNestedStory.name,
        storySlug: deeplyNestedStory.slug,
      });
      expect(storyblokResult.success).toBe(true);

      // Navigate through the nested structure
      const flexGroup = storyblokResult.story.content.body[0].content[0];
      expect(flexGroup.component).toBe("sb-flex-group-section");
      expect(flexGroup.content).toHaveLength(2);

      const nestedAccordion = flexGroup.content[1];
      expect(nestedAccordion.component).toBe("sb-accordion-flex-group");
      expect(nestedAccordion.type).toBe("single");

      const accordionItem = nestedAccordion.items[0];
      expect(accordionItem.content[0].component).toBe("sb-blockquote");

      // Verify blockquote content
      const blockquote = accordionItem.content[0];
      expect(blockquote.content.content[0].content[0].text).toBe("A quote within an accordion within a flex group.");
      expect(blockquote.citation.content[0].content[0].text).toBe("Deep Nester");
    });
  });
});
