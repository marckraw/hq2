import { beforeEach, describe, expect, it } from "vitest";
import { serviceRegistry } from "../../../../registry/service-registry";
import { IntermediateNode } from "../../schema.types";
import { registerIRFServices } from "../index";
import {
  // Slots layouts
  accordionLayoutData,
  // Design layouts
  basicDesignLayoutData,
  // Test-specific layouts
  cacheTestLayoutData,
  complexTableLayoutData,
  customClassLayoutData,
  deeplyNestedLayoutData,
  dividerLayoutData,
  dynamicListLayoutData,
  editorialCardLayoutData,
  emptyPageLayoutData,
  emptyTableLayoutData,
  emptyValuesLayoutData,
  // Complex layouts
  flexGroupLayoutData,
  globalVarsTestLayoutData,
  headlineLevelsLayoutData,
  imageLayoutData,
  incompleteTableLayoutData,
  listLayoutData,
  malformedLayoutData,
  malformedTableLayoutData,
  mixedContentLayoutData,
  multiSectionLayoutData,
  optionsTestLayoutData,
  // Basic layouts
  simplePageLayoutData,
  specialCharactersLayoutData,
  tableWithEmptyCellsLayoutData,
  // Edge cases
  unknownComponentLayoutData,
  veryLongContentLayoutData,
} from "./__fixtures__";
import { createIRFToStoryblokService } from "./irf-to-storyblok.service";

import {
  alertInFlexGroupData,
  alertInSectionData,
  multipleAlertsData,
  standaloneAlertData,
} from "./component-registry/alert/__fixtures__/alert.fixtures";

import {
  blockquoteInFlexGroup,
  blockquoteInFlexGroupWithPadding,
  blockquoteInSection,
  blockquoteInSectionWithPadding,
} from "./component-registry/blockquote/__fixtures__/blockquote.fixtures";

import {
  buttonGroupInFlexGroup,
  buttonGroupInSection,
  buttonGroupWithDrawer,
  buttonGroupWithDrawerBlockquote,
  buttonGroupWithVariousProps,
  minimalButtonGroup,
} from "./component-registry/button-group/__fixtures__/button-group.fixtures";

import { tableInFlexGroup, tableInSection } from "./component-registry/table/__fixtures__/table.fixtures";

describe("IRFToStoryblokService", () => {
  let service: ReturnType<typeof createIRFToStoryblokService>;

  beforeEach(() => {
    // Register the actual IRF services (just like in the real app)
    registerIRFServices();

    // Now create the service - it will use the actual registered services
    service = serviceRegistry.get("irfToStoryblok");
  });

  describe("Component Mapping", () => {
    // Button Group Component Tests
    it("should map Button Group component correctly in section context", async () => {
      const result = await service.transformIRFToStoryblok(buttonGroupInSection);
      expect(result.success).toBe(true);

      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const buttonGroup = section.content[0];
      expect(buttonGroup.component).toBe("sb-button-group-section");
      expect(buttonGroup.layout).toBe("pack");
      expect(buttonGroup.align).toBe("start");
      expect(buttonGroup.buttons).toHaveLength(2);

      // Check first button
      const primaryButton = buttonGroup.buttons[0];
      expect(primaryButton.component).toBe("sb-button");
      expect(primaryButton.content).toHaveLength(1);
      expect(primaryButton.content[0].component).toBe("sb-text-button");
      expect(primaryButton.content[0].text).toBe("Primary Button");
      expect(primaryButton.action).toHaveLength(1);
      expect(primaryButton.action[0].component).toBe("sb-submit-button");

      // Check second button
      const secondaryButton = buttonGroup.buttons[1];
      expect(secondaryButton.component).toBe("sb-button");
      expect(secondaryButton.content).toHaveLength(1);
      expect(secondaryButton.content[0].component).toBe("sb-text-button");
      expect(secondaryButton.content[0].text).toBe("Secondary Button");
      expect(secondaryButton.action).toHaveLength(1);
      expect(secondaryButton.action[0].component).toBe("sb-submit-button");
    });

    it("should map Button Group component correctly in flex-group context", async () => {
      const result = await service.transformIRFToStoryblok(buttonGroupInFlexGroup);
      expect(result.success).toBe(true);

      const section = result.story.content.body[0];
      const flexGroup = section.content[0];
      expect(flexGroup.component).toBe("sb-flex-group-section");

      const buttonGroup = flexGroup.content[0];
      expect(buttonGroup.component).toBe("sb-button-group-flex-group");
      expect(buttonGroup.layout).toBe("stack");
      expect(buttonGroup.align).toBe("center");
      expect(buttonGroup.buttons).toHaveLength(2);

      // Check action button
      const actionButton = buttonGroup.buttons[0];
      expect(actionButton.component).toBe("sb-button");
      expect(actionButton.content).toHaveLength(1);
      expect(actionButton.content[0].component).toBe("sb-text-button");
      expect(actionButton.content[0].text).toBe("Action Button");
      expect(actionButton.action).toHaveLength(1);
      expect(actionButton.action[0].component).toBe("sb-submit-button");

      // Check cancel button
      const cancelButton = buttonGroup.buttons[1];
      expect(cancelButton.component).toBe("sb-button");
      expect(cancelButton.content).toHaveLength(1);
      expect(cancelButton.content[0].component).toBe("sb-text-button");
      expect(cancelButton.content[0].text).toBe("Cancel");
      expect(cancelButton.action).toHaveLength(1);
      expect(cancelButton.action[0].component).toBe("sb-submit-button");
    });

    it("should map Button Group with comprehensive props correctly", async () => {
      const result = await service.transformIRFToStoryblok(buttonGroupWithVariousProps);
      expect(result.success).toBe(true);

      const section = result.story.content.body[0];
      const buttonGroup = section.content[0];

      expect(buttonGroup.component).toBe("sb-button-group-section");
      expect(buttonGroup.layout).toBe("pack");
      expect(buttonGroup.align).toBe("end");
      expect(buttonGroup.custom_classname).toBe("my-button-group");
      expect(buttonGroup.buttons).toHaveLength(3);

      // Check link button
      const linkButton = buttonGroup.buttons[0];
      expect(linkButton.component).toBe("sb-button");
      expect(linkButton.content).toHaveLength(1);
      expect(linkButton.content[0].component).toBe("sb-text-button");
      expect(linkButton.content[0].text).toBe("Visit Website");
      expect(linkButton.action).toHaveLength(1);
      expect(linkButton.action[0].component).toBe("sb-link-button");

      // Check complete multilink structure
      const link = linkButton.action[0].link;
      expect(link.id).toBe("");
      expect(link.url).toBe("https://example.com");
      expect(link.linktype).toBe("url");
      expect(link.fieldtype).toBe("multilink");
      expect(link.cached_url).toBe("https://example.com");
      expect(link.target).toBe("_blank");

      // Check disabled button
      const disabledButton = buttonGroup.buttons[1];
      expect(disabledButton.component).toBe("sb-button");
      expect(disabledButton.content).toHaveLength(1);
      expect(disabledButton.content[0].component).toBe("sb-text-button");
      expect(disabledButton.content[0].text).toBe("Disabled");
      expect(disabledButton.action).toHaveLength(1);
      expect(disabledButton.action[0].component).toBe("sb-submit-button");

      // Check loading button
      const loadingButton = buttonGroup.buttons[2];
      expect(loadingButton.component).toBe("sb-button");
      expect(loadingButton.content).toHaveLength(1);
      expect(loadingButton.content[0].component).toBe("sb-text-button");
      expect(loadingButton.content[0].text).toBe("Loading...");
      expect(loadingButton.action).toHaveLength(1);
      expect(loadingButton.action[0].component).toBe("sb-submit-button");
      expect(loadingButton.custom_classname).toBe("loading-btn");
    });

    it("should map minimal Button Group with defaults correctly", async () => {
      const result = await service.transformIRFToStoryblok(minimalButtonGroup);
      expect(result.success).toBe(true);

      const section = result.story.content.body[0];
      const buttonGroup = section.content[0];

      expect(buttonGroup.component).toBe("sb-button-group-section");
      expect(buttonGroup.layout).toBe("pack"); // default
      expect(buttonGroup.align).toBe("start"); // default
      expect(buttonGroup.buttons).toHaveLength(1);

      // Check button with defaults
      const button = buttonGroup.buttons[0];
      expect(button.component).toBe("sb-button");
      expect(button.content).toHaveLength(1);
      expect(button.content[0].component).toBe("sb-text-button");
      expect(button.content[0].text).toBe("Simple Button"); // Gets name from fixture
      expect(button.action).toHaveLength(1);
      expect(button.action[0].component).toBe("sb-submit-button");
      expect(button.aria_label).toBe(""); // default
      expect(button.custom_classname).toBe(""); // default
    });

    it("should map Button Group with Drawer Action correctly", async () => {
      const result = await service.transformIRFToStoryblok(buttonGroupWithDrawer);
      expect(result.success).toBe(true);

      expect(result.story.content.body).toHaveLength(1);
      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const buttonGroup = section.content[0];
      expect(buttonGroup.component).toBe("sb-button-group-section");
      expect(buttonGroup.layout).toBe("pack");
      expect(buttonGroup.align).toBe("center");
      expect(buttonGroup.buttons).toHaveLength(1);

      // Check drawer button
      const drawerButton = buttonGroup.buttons[0];
      expect(drawerButton.component).toBe("sb-button");
      expect(drawerButton.content).toHaveLength(1);
      expect(drawerButton.content[0].component).toBe("sb-text-button");
      expect(drawerButton.content[0].text).toBe("Open Details");

      // Check drawer action
      expect(drawerButton.action).toHaveLength(1);
      expect(drawerButton.action[0].component).toBe("sb-drawer");
      expect(drawerButton.action[0].title).toBe("Product Details");
      expect(drawerButton.action[0].subtitle).toBe("Learn more about this product");

      // Check drawer content
      expect(drawerButton.action[0].content).toHaveLength(2);
      expect(drawerButton.action[0].content[0].component).toBe("sb-headline");
      expect(drawerButton.action[0].content[0].content).toBe("Welcome to the Drawer");
      expect(drawerButton.action[0].content[1].component).toBe("sb-text");
    });

    it("should map Button Group with Drawer containing Blockquote correctly", async () => {
      const result = await service.transformIRFToStoryblok(buttonGroupWithDrawerBlockquote);
      expect(result.success).toBe(true);

      expect(result.story.content.body).toHaveLength(1);
      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const buttonGroup = section.content[0];
      expect(buttonGroup.component).toBe("sb-button-group-section");
      expect(buttonGroup.layout).toBe("pack");
      expect(buttonGroup.align).toBe("start");
      expect(buttonGroup.buttons).toHaveLength(1);

      // Check drawer button
      const drawerButton = buttonGroup.buttons[0];
      expect(drawerButton.component).toBe("sb-button");
      expect(drawerButton.content).toHaveLength(1);
      expect(drawerButton.content[0].component).toBe("sb-text-button");
      expect(drawerButton.content[0].text).toBe("TEST");

      // Check drawer action
      expect(drawerButton.action).toHaveLength(1);
      const drawerAction = drawerButton.action[0];
      expect(drawerAction.component).toBe("sb-drawer");
      expect(drawerAction.title).toBe("Inspirational Quote");
      expect(drawerAction.subtitle).toBe("Words of wisdom");

      // Check drawer content contains blockquote WITHOUT error
      expect(drawerAction.content).toHaveLength(1);
      const blockquote = drawerAction.content[0];
      expect(blockquote.component).toBe("sb-blockquote");
      expect(blockquote.error).toBeUndefined(); // ✅ No error should be present

      // Verify blockquote content structure
      expect(blockquote.content).toBeDefined();
      expect(blockquote.content.type).toBe("doc");
      expect(blockquote.content.content[0].content[0].text).toBe("Imagination is more important than knowledge.");

      // Verify blockquote citation
      expect(blockquote.citation).toBeDefined();
      expect(blockquote.citation.type).toBe("doc");
      expect(blockquote.citation.content[0].content[0].text).toBe("Albert Einstein");
    });

    it("should map Blockquote component correctly in section", async () => {
      const result = await service.transformIRFToStoryblok(blockquoteInSection);
      expect(result.success).toBe(true);

      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];

      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const blockquote = section.content[0];

      expect(blockquote.component).toBe("sb-blockquote-section");
      expect(blockquote.content).toBeDefined(); // is content defined
      expect(blockquote.citation).toBeDefined(); // is citation defined
      expect(blockquote.content.type).toBe("doc"); // is content a rich text doc
      expect(blockquote.citation.type).toBe("doc"); // is citation a rich text doc
    });

    it("should map Blockquote component correctly in flex group", async () => {
      const result = await service.transformIRFToStoryblok(blockquoteInFlexGroup);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const flexGroup = section.content[0];
      expect(flexGroup.component).toBe("sb-flex-group-section");
      expect(flexGroup.content).toHaveLength(1);

      const blockquote = flexGroup.content[0];
      expect(blockquote.component).toBe("sb-blockquote-flex-group");
      expect(blockquote.content).toBeDefined(); // is content defined
      expect(blockquote.citation).toBeDefined(); // is citation defined
      expect(blockquote.content.type).toBe("doc"); // is content a rich text doc
      expect(blockquote.citation.type).toBe("doc"); // is citation a rich text doc
    });

    it("should map Blockquote component correctly in Section with padding design", async () => {
      const result = await service.transformIRFToStoryblok(blockquoteInSectionWithPadding);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const blockquote = section.content[0];

      expect(blockquote.component).toBe("sb-blockquote-section");
      expect(blockquote.content).toBeDefined(); // is content defined
      expect(blockquote.citation).toBeDefined(); // is citation defined
      expect(blockquote.content.type).toBe("doc"); // is content a rich text doc
      expect(blockquote.citation.type).toBe("doc"); // is citation a rich text doc

      // expect padding design to be applied
      expect(blockquote.design).toHaveProperty("plugin");
      expect(blockquote.design.plugin).toBe("backpack-breakpoints");
      expect(blockquote.design).toHaveProperty("fields");
      expect(blockquote.design.fields).toHaveProperty("spacing");
      expect(blockquote.design.fields.spacing).toHaveProperty("field_type");
      expect(blockquote.design.fields.spacing.field_type).toBe("backpack-spacing");
      expect(blockquote.design.fields.spacing.values).toHaveProperty("s");
      expect(blockquote.design.fields.spacing.values.s).toHaveProperty("pt");
      expect(blockquote.design.fields.spacing.values.s.pt).toBe("l");
    });

    it("should map Blockquote component correctly in Flex Group with padding design", async () => {
      const result = await service.transformIRFToStoryblok(blockquoteInFlexGroupWithPadding);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const flexGroup = section.content[0];
      expect(flexGroup.component).toBe("sb-flex-group-section");
      expect(flexGroup.content).toHaveLength(1);

      const blockquote = flexGroup.content[0];

      expect(blockquote.component).toBe("sb-blockquote-flex-group");
      expect(blockquote.content).toBeDefined(); // is content defined
      expect(blockquote.citation).toBeDefined(); // is citation defined
      expect(blockquote.content.type).toBe("doc"); // is content a rich text doc
      expect(blockquote.citation.type).toBe("doc"); // is citation a rich text doc

      // expect padding design to be applied
      expect(blockquote.design).toHaveProperty("plugin");
      expect(blockquote.design.plugin).toBe("backpack-breakpoints");
      expect(blockquote.design).toHaveProperty("fields");
      expect(blockquote.design.fields).toHaveProperty("spacing");
      expect(blockquote.design.fields.spacing).toHaveProperty("field_type");
      expect(blockquote.design.fields.spacing.field_type).toBe("backpack-spacing");
      expect(blockquote.design.fields.spacing.values).toHaveProperty("s");
      expect(blockquote.design.fields.spacing.values.s).toHaveProperty("pt");
      expect(blockquote.design.fields.spacing.values.s.pt).toBe("l");
    });

    it("should map Alert component correctly in section", async () => {
      const result = await service.transformIRFToStoryblok(alertInSectionData);
      expect(result.success).toBe(true);

      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const alert = section.content[0];
      expect(alert.component).toBe("sb-alert-section");
      expect(alert.title).toHaveLength(1);
      expect(alert.content).toHaveLength(1);
      expect(alert.title[0].component).toBe("sb-body-text");
      expect(alert.content[0].component).toBe("sb-body-text");
      expect(alert.title[0].content.content[0].content[0].text).toBe("Important Notice");
      expect(alert.content[0].content.content[0].content[0].text).toBe(
        "This is an important message that users should be aware of."
      );
      expect(alert.custom_classname).toBe("custom-alert-class");
    });

    it("should map Alert component correctly in flex group", async () => {
      const result = await service.transformIRFToStoryblok(alertInFlexGroupData);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const flexGroup = section.content[0];
      expect(flexGroup.component).toBe("sb-flex-group-section");
      expect(flexGroup.content).toHaveLength(1);

      const alert = flexGroup.content[0];
      // For flex-group, we use the section variant as there's no specific flex-group variant
      expect(alert.component).toBe("sb-alert-section");
      expect(alert.title).toHaveLength(1);
      expect(alert.content).toHaveLength(1);
      expect(alert.title[0].content.content[0].content[0].text).toBe("Warning Alert");
      expect(alert.content[0].content.content[0].content[0].text).toBe(
        "This is a warning message displayed in a flex group."
      );
    });

    it("should map multiple Alert components correctly", async () => {
      const result = await service.transformIRFToStoryblok(multipleAlertsData);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(3); // 2 alerts + 1 text

      const successAlert = section.content[0];
      expect(successAlert.component).toBe("sb-alert-section");
      expect(successAlert.title[0].content.content[0].content[0].text).toBe("Success!");

      const errorAlert = section.content[1];
      expect(errorAlert.component).toBe("sb-alert-section");
      expect(errorAlert.title[0].content.content[0].content[0].text).toBe("Error");

      const textComponent = section.content[2];
      expect(textComponent.component).toBe("sb-text-section");
    });

    // TODO: How do we handle design?
    // it("should map Alert component with design correctly", async () => {
    //   const result = await service.transformIRFToStoryblok(alertWithDesignData);
    //   expect(result.success).toBe(true);
    //   expect(result.story.content.body).toHaveLength(1);

    //   const section = result.story.content.body[0];
    //   const alert = section.content[0];

    //   expect(alert.component).toBe("sb-alert-section");
    //   expect(alert.design).toBeDefined();
    //   expect(alert.design).toHaveProperty("plugin");
    //   expect(alert.design.plugin).toBe("backpack-breakpoints");
    // });

    it("should map standalone Alert component correctly", async () => {
      const result = await service.transformIRFToStoryblok(standaloneAlertData);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const alert = result.story.content.body[0];
      expect(alert.component).toBe("sb-alert");
      expect(alert.title).toHaveLength(1);
      expect(alert.content).toHaveLength(1);
      expect(alert.title[0].content.content[0].content[0].text).toBe("Standalone Alert");
    });
  });

  describe("Core Component Transformations", () => {
    it("should transform a simple IRF layout with page, section, headline, and text", async () => {
      const result = await service.transformIRFToStoryblok(simplePageLayoutData);

      expect(result.success).toBe(true);
      expect(result.story.name).toBe("Simple Page Layout");
      expect(result.story.content.component).toBe("page");
      expect(result.story.content.body).toHaveLength(1);

      const sectionComponent = result.story.content.body[0];
      expect(sectionComponent.component).toBe("sb-section");
      expect(sectionComponent.name).toBe("Hero Section");
      expect(sectionComponent.content).toHaveLength(2);

      const headlineComponent = sectionComponent.content[0];
      expect(headlineComponent.component).toBe("sb-headline-section");
      expect(headlineComponent.content).toBe("Welcome to Our Site");

      const textComponent = sectionComponent.content[1];
      expect(textComponent.component).toBe("sb-text-section");
      expect(textComponent.content.type).toBe("doc");
      expect(textComponent.content.content[0].content[0].text).toBe("This is a welcome message for our visitors.");
    });

    it("should transform multiple sections", async () => {
      const result = await service.transformIRFToStoryblok(multiSectionLayoutData);

      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(3);

      const sections = result.story.content.body;
      expect(sections[0].name).toBe("Header Section");
      expect(sections[1].name).toBe("Content Section");
      expect(sections[2].name).toBe("Footer Section");
    });

    it("should transform image components", async () => {
      const result = await service.transformIRFToStoryblok(imageLayoutData);

      expect(result.success).toBe(true);
      const imageComponent = result.story.content.body[0];
      expect(imageComponent.component).toBe("sb-image-section");
      expect(imageComponent.image.alt).toBe("Beautiful landscape");
      expect(imageComponent.image.title).toBe("A Beautiful Landscape");
      expect(imageComponent.image.name).toBe("landscape.jpg");
    });

    it("should transform list components with list items", async () => {
      const result = await service.transformIRFToStoryblok(listLayoutData);

      expect(result.success).toBe(true);
      const sectionComponent = result.story.content.body[0];
      const listComponent = sectionComponent.content[0];
      expect(listComponent.component).toBe("sb-list-section");
      expect(listComponent.items).toHaveLength(3);

      const firstListItem = listComponent.items[0];
      expect(firstListItem.component).toBe("sb-list-item");
      expect(firstListItem.content[0].component).toBe("sb-flex-group");
    });

    it("should transform divider components", async () => {
      const result = await service.transformIRFToStoryblok(dividerLayoutData);

      expect(result.success).toBe(true);
      const sectionComponent = result.story.content.body[0];
      expect(sectionComponent.content).toHaveLength(5);

      const dividers = sectionComponent.content.filter((c: any) => c.component === "sb-divider-section");
      expect(dividers).toHaveLength(2);
    });

    it("should handle empty content gracefully", async () => {
      const result = await service.transformIRFToStoryblok(emptyPageLayoutData);

      expect(result.success).toBe(true);
      expect(result.story.content.component).toBe("page");
      expect(result.story.content.body).toHaveLength(0);
    });

    it("should transform flex-group components", async () => {
      const result = await service.transformIRFToStoryblok(flexGroupLayoutData);

      expect(result.success).toBe(true);
      const sectionComponent = result.story.content.body[0];
      expect(sectionComponent.component).toBe("sb-section");

      const flexGroupComponent = sectionComponent.content[0];
      expect(flexGroupComponent.component).toBe("sb-flex-group-section");
      expect(flexGroupComponent.content).toHaveLength(2);

      const headlineComponent = flexGroupComponent.content[0];
      expect(headlineComponent.component).toBe("sb-headline-flex-group");
      expect(headlineComponent.content).toBe("Grouped Content");

      const textComponent = flexGroupComponent.content[1];
      expect(textComponent.component).toBe("sb-text-flex-group");
    });

    it("should transform editorial card components", async () => {
      const result = await service.transformIRFToStoryblok(editorialCardLayoutData);

      expect(result.success).toBe(true);
      const cardComponent = result.story.content.body[0];
      expect(cardComponent.component).toBe("sb-editorial-card");
      expect(cardComponent.card_title).toHaveLength(1);
      expect(cardComponent.card_body).toHaveLength(2);
      expect(cardComponent.card_image).toHaveLength(1);
      expect(cardComponent.card_title[0].component).toBe("sb-card-title");
      expect(cardComponent.card_body[0].component).toBe("sb-card-body");
    });

    it("should transform complex table with header, data, and footer rows", async () => {
      const result = await service.transformIRFToStoryblok(complexTableLayoutData);

      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(2); // headline + table

      const table = section.content[1];
      expect(table.component).toBe("sb-table-section");
      expect(table.rows).toHaveLength(5); // 1 header + 3 data + 1 footer

      // Check header row
      const headerRow = table.rows[0];
      expect(headerRow.component).toBe("sb-table-row");
      expect(headerRow.is_header).toBe(true);
      expect(headerRow.cells).toHaveLength(3);

      // Check data rows
      const dataRow1 = table.rows[1];
      expect(dataRow1.component).toBe("sb-table-row");
      expect(dataRow1.is_header).toBe(false);
      expect(dataRow1.is_footer).toBe(false);

      // Check footer row
      const footerRow = table.rows[4];
      expect(footerRow.component).toBe("sb-table-row");
      expect(footerRow.is_footer).toBe(true);
      expect(footerRow.cells).toHaveLength(1);
      expect(footerRow.cells[0].colspan).toBe(3);
    });

    it("should handle empty table gracefully", async () => {
      const result = await service.transformIRFToStoryblok(emptyTableLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      const table = section.content[0];
      expect(table.component).toBe("sb-table-section");
      expect(table.rows).toHaveLength(0);
    });

    it("should handle incomplete table structure", async () => {
      const result = await service.transformIRFToStoryblok(incompleteTableLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      const table = section.content[0];
      expect(table.component).toBe("sb-table-section");
      expect(table.rows).toHaveLength(2);

      // First row should have 1 cell
      const firstRow = table.rows[0];
      expect(firstRow.cells).toHaveLength(1);

      // Second row should be empty
      const secondRow = table.rows[1];
      expect(secondRow.cells).toHaveLength(0);
    });

    it("should handle table with empty cells", async () => {
      const result = await service.transformIRFToStoryblok(tableWithEmptyCellsLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      const table = section.content[0];
      expect(table.component).toBe("sb-table-section");
      expect(table.rows).toHaveLength(2);

      // Data row should have 2 cells, second one empty
      const dataRow = table.rows[1];
      expect(dataRow.cells).toHaveLength(2);
      expect(dataRow.cells[0].content).toHaveLength(1);
      expect(dataRow.cells[1].content).toHaveLength(0); // Empty cell
    });

    it("should handle malformed table with invalid props", async () => {
      const result = await service.transformIRFToStoryblok(malformedTableLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      const table = section.content[0];
      expect(table.component).toBe("sb-table-section");
      expect(table.rows).toHaveLength(1);

      // Should still transform despite invalid props
      const row = table.rows[0];
      expect(row.component).toBe("sb-table-row");
      expect(row.cells).toHaveLength(1);
    });

    it("should handle unknown IRF components with fallback", async () => {
      const result = await service.transformIRFToStoryblok(unknownComponentLayoutData);

      expect(result.success).toBe(true);
      const unknownComponent = result.story.content.body[0];
      expect(unknownComponent.component).toBe("sb-unknown_component");
      expect(unknownComponent.customProperty).toBe("custom value");
    });

    it("should preserve custom classnames", async () => {
      const result = await service.transformIRFToStoryblok(customClassLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      expect(section.custom_classname).toBe("custom-section-class");

      const headline = section.content[0];
      expect(headline.custom_classname).toBe("custom-headline-class");

      const text = section.content[1];
      expect(text.custom_classname).toBe("custom-text-class");
    });

    it("should handle all headline levels", async () => {
      const result = await service.transformIRFToStoryblok(headlineLevelsLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      const headlines = section.content;

      expect(headlines[0].as).toBe("h1");
      expect(headlines[1].as).toBe("h2");
      expect(headlines[2].as).toBe("h3");
      expect(headlines[3].as).toBe("h4");
      expect(headlines[4].as).toBe("h5");
      expect(headlines[5].as).toBe("h6");
    });

    it("should map Table component correctly in section", async () => {
      const result = await service.transformIRFToStoryblok(tableInSection);
      expect(result.success).toBe(true);

      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const table = section.content[0];
      expect(table.component).toBe("sb-table-section");
      expect(table.rows).toHaveLength(2); // header + data row

      // Check header row
      const headerRow = table.rows[0];
      expect(headerRow.component).toBe("sb-table-row");
      expect(headerRow.is_header).toBe(true);
      expect(headerRow.cells).toHaveLength(2);

      // Check data row
      const dataRow = table.rows[1];
      expect(dataRow.component).toBe("sb-table-row");
      expect(dataRow.is_header).toBe(false);
      expect(dataRow.cells).toHaveLength(2);

      // Check cell structure
      const firstCell = headerRow.cells[0];
      expect(firstCell.component).toBe("sb-table-cell");
      expect(firstCell.content).toHaveLength(1);
      expect(firstCell.content[0].component).toBe("sb-text");
    });

    it("should map Table component correctly in flex group", async () => {
      const result = await service.transformIRFToStoryblok(tableInFlexGroup);
      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(1);

      const section = result.story.content.body[0];
      expect(section.component).toBe("sb-section");
      expect(section.content).toHaveLength(1);

      const flexGroup = section.content[0];
      expect(flexGroup.component).toBe("sb-flex-group-section");
      expect(flexGroup.content).toHaveLength(1);

      const table = flexGroup.content[0];
      expect(table.component).toBe("sb-table-flex-group");
      expect(table.rows).toHaveLength(2); // header + data row

      // Check header row
      const headerRow = table.rows[0];
      expect(headerRow.component).toBe("sb-table-row");
      expect(headerRow.is_header).toBe(true);
      expect(headerRow.cells).toHaveLength(2);

      // Check data row
      const dataRow = table.rows[1];
      expect(dataRow.component).toBe("sb-table-row");
      expect(dataRow.is_header).toBe(false);
      expect(dataRow.cells).toHaveLength(2);

      // Check cell structure
      const firstCell = headerRow.cells[0];
      expect(firstCell.component).toBe("sb-table-cell");
      expect(firstCell.content).toHaveLength(1);
      expect(firstCell.content[0].component).toBe("sb-text");
    });
  });

  describe("Slots Handling", () => {
    it("should transform accordion components with slots", async () => {
      const result = await service.transformIRFToStoryblok(accordionLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];
      const accordion = section.content[0];

      expect(accordion.component).toBe("sb-accordion-section");
      expect(accordion.type).toBe("multiple");
      expect(accordion.items).toHaveLength(2);

      const firstItem = accordion.items[0];
      expect(firstItem.component).toBe("sb-accordion-item");
      expect(firstItem.title).toHaveLength(1);
      expect(firstItem.content).toHaveLength(3);

      expect(firstItem.title[0].component).toBe("sb-headline");
      expect(firstItem.title[0].content).toBe("What is your return policy?");

      expect(firstItem.content[0].component).toBe("sb-text");
      expect(firstItem.content[1].component).toBe("sb-divider");
      expect(firstItem.content[2].component).toBe("sb-text");
    });
  });

  describe("Design Intent Handling", () => {
    it("should preserve design intent from IRF nodes", async () => {
      const result = await service.transformIRFToStoryblok(basicDesignLayoutData);

      expect(result.success).toBe(true);
      const sectionComponent = result.story.content.body[0];
      expect(sectionComponent.component).toBe("sb-section");
      expect(sectionComponent.design).toBeDefined();
    });
  });

  describe("Service Health and Management", () => {
    it("should pass health check", async () => {
      const isHealthy = await service.isHealthy();
      expect(isHealthy).toBe(true);
    });

    it("should validate Storyblok stories correctly", () => {
      const validStory = {
        name: "Valid Story",
        slug: "valid-story",
        content: {
          component: "page",
          _uid: "test-uid",
          body: [],
        },
        is_folder: false,
      };

      const invalidStory = {
        name: "",
        slug: "",
        content: {},
      };

      expect(service.validateStoryblokStory(validStory as any)).toBe(true);
      expect(service.validateStoryblokStory(invalidStory as any)).toBe(false);
    });

    it("should manage component registry", () => {
      const initialMappings = service.getComponentMappings();
      expect(initialMappings.page).toBe("page");
      expect(initialMappings.section).toBe("sb-section");

      // Test adding a new component mapping
      service.addComponentMapping("custom-component", "sb-custom");
      const updatedMappings = service.getComponentMappings();
      expect(updatedMappings["custom-component"]).toBe("sb-custom");
    });

    it("should register new components with custom transformers", () => {
      const mockTransformer = (_node: IntermediateNode) => ({
        component: "sb-test-component",
        testProperty: "test value",
      });

      service.registerComponent("test", "sb-test-component", mockTransformer);
      const registry = service.getComponentRegistry();
      expect(registry.test).toBeDefined();
      expect(registry.test.defaultStoryblokComponent).toBe("sb-test-component");
    });
  });

  describe("Cache Management", () => {
    it("should manage cache correctly", async () => {
      const testLayout = cacheTestLayoutData;

      let stats = service.getCacheStats();
      const initialSize = stats.size;

      await service.transformIRFToStoryblok(testLayout);

      stats = service.getCacheStats();
      expect(stats.size).toBe(initialSize + 1);

      service.clearCache();
      stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe("Metadata and Options", () => {
    it("should handle transformation options correctly", async () => {
      const testLayout = optionsTestLayoutData;

      const result = await service.transformIRFToStoryblok(testLayout, {
        storyName: "Custom Story Name",
        storySlug: "custom-story-slug",
        includeMetadata: true,
        parentId: 123,
        groupId: "test-group",
      });

      expect(result.success).toBe(true);
      expect(result.story.name).toBe("Custom Story Name");
      expect(result.story.slug).toBe("custom-story-slug");
      expect(result.story.parent_id).toBe(123);
      expect(result.story.group_id).toBe("test-group");
      expect(result.metadata.sourceLayout).toBe("Options Test Layout");
    });

    it("should handle global variables", async () => {
      const testLayout = globalVarsTestLayoutData;

      const result = await service.transformIRFToStoryblok(testLayout, {
        includeMetadata: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed IRF layouts gracefully", async () => {
      const result = await service.transformIRFToStoryblok(malformedLayoutData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.story).toBeDefined(); // Should still create a story structure
    });

    it("should handle special characters correctly", async () => {
      const result = await service.transformIRFToStoryblok(specialCharactersLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];

      // Check emoji headline
      expect(section.content[0].content).toBe("🚀 Rocket Launch! 🎉");

      // Check special characters are preserved
      const specialCharsText = section.content[1];
      expect(specialCharsText.content.content[0].content[0].text).toContain("<>&\"'`");
    });

    it("should handle very long content", async () => {
      const result = await service.transformIRFToStoryblok(veryLongContentLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];

      // Check that long content is preserved
      const headline = section.content[0];
      expect(headline.content.length).toBe(500);

      const text = section.content[1];
      expect(text.content.content[0].content[0].text).toContain("Lorem ipsum");
    });

    it("should handle empty values", async () => {
      const result = await service.transformIRFToStoryblok(emptyValuesLayoutData);

      expect(result.success).toBe(true);
      const section = result.story.content.body[0];

      // Empty names should be preserved
      expect(section.name).toBe("");

      // Empty content should be handled
      const headline = section.content[0];
      expect(headline.content).toBe("");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle deeply nested layouts", async () => {
      const result = await service.transformIRFToStoryblok(deeplyNestedLayoutData);

      expect(result.success).toBe(true);

      // Navigate through the nested structure
      let current = result.story.content.body[0];
      expect(current.component).toBe("sb-section");

      current = current.content[1]; // flex group
      expect(current.component).toBe("sb-flex-group-section");

      current = current.content[1]; // nested list
      expect(current.component).toBe("sb-list-flex-group");
    });

    it("should handle mixed content types", async () => {
      const result = await service.transformIRFToStoryblok(mixedContentLayoutData);

      expect(result.success).toBe(true);
      expect(result.story.content.body).toHaveLength(2); // 2 sections + 1 divider

      const heroSection = result.story.content.body[0];
      expect(heroSection.content).toHaveLength(3); // headline, text, image

      const featuresSection = result.story.content.body[1];
      expect(featuresSection.content[0].component).toBe("sb-headline-section");

      const featuresGroup = featuresSection.content[1]; // flex group
      expect(featuresGroup.component).toBe("sb-flex-group-section");
      expect(featuresGroup.content[0].component).toBe("sb-headline-flex-group"); // headline in flex group
      expect(featuresGroup.content).toHaveLength(1);
    });

    it("should handle dynamic list generation", async () => {
      // Use predefined dynamic list fixture
      const result = await service.transformIRFToStoryblok(dynamicListLayoutData);

      expect(result.success).toBe(true);
      const list = result.story.content.body[0].content[0];
      expect(list.items).toHaveLength(5);

      list.items.forEach((item: any, index: number) => {
        expect(item.content[0].content[0].content).toBe(`Dynamic Item ${index + 1}`);
      });
    });
  });
});
