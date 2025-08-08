import { ComponentRegistryEntry } from "../irf-to-storyblok.service.types";
import { accordionItemTransformer } from "./accordion/transformer/accordion-item.irf-to-sb.transformer";
import { accordionTransformer } from "./accordion/transformer/accordion.irf-to-sb.transformer";
import { alertTransformer } from "./alert/transformer/alert.irf-to-sb.transformer";
import { blockquoteTransformer } from "./blockquote/transformer/blockquote.irf-to-sb.transformer";
import { buttonGroupTransformer } from "./button-group/transformer/button-group.irf-to-sb.transformer";
import { buttonTransformer } from "./button-group/transformer/button.irf-to-sb.transformer";
import { dividerTransformer } from "./divider/transformer/divider.irf-to-sb.transformer";
import { editorialCardTransformer } from "./editorial-card/transformer/editorial-card.irf-to-sb.transformer";
import { flexGroupTransformer } from "./flex-group/transformer/flex-group.irf-to-sb.transformer";
import { groupTransformer } from "./group/transformer/group.irf-to-sb.transformer";
import { headlineTransformer } from "./headline/transformer/headline.irf-to-sb.transformer";
import { imageTransformer } from "./image/transformer/image.irf-to-sb.transformer";
import { instanceTransformer } from "./instance/transformer/instance.irf-to-sb.transformer";
import { listItemTransformer } from "./list/transformer/list-item.irf-to-sb.transformer";
import { listTransformer } from "./list/transformer/list.irf-to-sb.transformer";
import { pageTransformer } from "./page/transformer/page.irf-to-sb.transformer";
import { sectionTransformer } from "./section/transformer/section.irf-to-sb.transformer";
import { shapeTransformer } from "./shape/transformer/shape.irf-to-sb.transformer";
import { tableCellTransformer } from "./table/transformer/table-cell.irf-to-sb.transformer";
import { tableRowTransformer } from "./table/transformer/table-row.irf-to-sb.transformer";
import { tableTransformer } from "./table/transformer/table.irf-to-sb.transformer";
import { textTransformer } from "./text/transformer/text.irf-to-sb.transformer";

export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  page: {
    defaultStoryblokComponent: "page",
    transform: pageTransformer,
  },

  section: {
    defaultStoryblokComponent: "sb-section",
    transform: sectionTransformer,
  },

  blockquote: {
    defaultStoryblokComponent: "sb-blockquote-section",
    transform: blockquoteTransformer,
  },

  text: {
    defaultStoryblokComponent: "sb-text-section",
    transform: textTransformer,
  },

  "flex-group": {
    defaultStoryblokComponent: "sb-flex-group",
    transform: flexGroupTransformer,
  },

  accordion: {
    defaultStoryblokComponent: "sb-accordion",
    transform: accordionTransformer,
  },

  "accordion-item": {
    defaultStoryblokComponent: "sb-accordion-item",
    transform: accordionItemTransformer,
  },

  alert: {
    defaultStoryblokComponent: "sb-alert-section",
    transform: alertTransformer,
  },

  headline: {
    defaultStoryblokComponent: "sb-headline",
    transform: headlineTransformer,
  },

  image: {
    defaultStoryblokComponent: "sb-image-section",
    transform: imageTransformer,
  },

  divider: {
    defaultStoryblokComponent: "sb-divider",
    transform: dividerTransformer,
  },

  "editorial-card": {
    defaultStoryblokComponent: "sb-editorial-card-section",
    transform: editorialCardTransformer,
  },

  list: {
    defaultStoryblokComponent: "sb-list-section",
    transform: listTransformer,
  },
  "list-item": {
    defaultStoryblokComponent: "sb-list-item",
    transform: listItemTransformer,
  },

  group: {
    defaultStoryblokComponent: "sb-group",
    transform: groupTransformer,
  },

  shape: {
    defaultStoryblokComponent: "sb-shape",
    transform: shapeTransformer,
  },

  instance: {
    defaultStoryblokComponent: "sb-component-instance",
    transform: instanceTransformer,
  },

  // Table components
  table: {
    defaultStoryblokComponent: "sb-table-section",
    transform: tableTransformer,
  },

  "table-row": {
    defaultStoryblokComponent: "sb-table-row",
    transform: tableRowTransformer,
  },

  "table-cell": {
    defaultStoryblokComponent: "sb-table-cell",
    transform: tableCellTransformer,
  },

  // Button components
  "button-group": {
    defaultStoryblokComponent: "sb-button-group-section",
    transform: buttonGroupTransformer,
  },

  button: {
    defaultStoryblokComponent: "sb-button",
    transform: buttonTransformer,
  },
};
