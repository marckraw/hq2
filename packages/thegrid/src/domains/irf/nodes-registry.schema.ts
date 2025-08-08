/**
 * This is the nodes registry, that defines the available component types and their properties.
 * Core for the IRF Architect Agent to understand what can be nested where, and how.
 *
 * Whenever we add additional component support, or any other extension to the schema validation
 * we should modify this file with changes. It is then used by Master prompt and help LLMs understand the intent.
 */

import { z } from "@hono/zod-openapi";

// Individual node schemas
const pageNodeSchema = z.object({
  name: z.literal("page"),
  description: z.literal("A page is the root component of a Storyblok page."),
  allowedChildren: z.tuple([
    z.literal("section"),
    z.literal("header"),
    z.literal("footer"),
  ]),
});

const sectionNodeSchema = z.object({
  name: z.literal("section"),
  description: z.literal(
    "A section is a primary container for organizing content within a page."
  ),
  allowedChildren: z.tuple([
    z.literal("headline"),
    z.literal("text"),
    z.literal("image"),
    z.literal("list"),
    z.literal("divider"),
    z.literal("editorial-card"),
    z.literal("flex-group"),
    z.literal("accordion"),
    z.literal("blockquote"),
    z.literal("table"),
    z.literal("alert"),
    z.literal("button-group"),
  ]),
});

const editorialCardNodeSchema = z.object({
  name: z.literal("editorial-card"),
  description: z.literal(
    "An editorial card is a container for a single piece of content with structured areas."
  ),
  allowedNamedSlots: z.object({
    card_title: z.object({
      description: z.literal("The card title/headline area"),
      allowedChildren: z.tuple([z.literal("headline")]),
      required: z.literal(false),
      maxItems: z.null(),
      minItems: z.literal(0),
    }),
    card_body: z.object({
      description: z.literal("The main content area of the card"),
      allowedChildren: z.tuple([z.literal("text")]),
      required: z.literal(false),
      maxItems: z.null(),
      minItems: z.literal(0),
    }),
    card_image: z.object({
      description: z.literal("Media area for the card"),
      allowedChildren: z.tuple([z.literal("image")]),
      required: z.literal(false),
      maxItems: z.null(),
      minItems: z.literal(0),
    }),
  }),
});

const headerNodeSchema = z.object({
  name: z.literal("header"),
  description: z.literal("Header section of a page or component."),
  allowedChildren: z.tuple([
    z.literal("headline"),
    z.literal("text"),
    z.literal("image"),
  ]),
});

const footerNodeSchema = z.object({
  name: z.literal("footer"),
  description: z.literal("Footer section of a page or component."),
  allowedChildren: z.tuple([
    z.literal("headline"),
    z.literal("text"),
    z.literal("image"),
    z.literal("list"),
  ]),
});

const listNodeSchema = z.object({
  name: z.literal("list"),
  description: z.literal("A list container component."),
  allowedChildren: z.tuple([z.literal("list-item")]),
});

const listItemNodeSchema = z.object({
  name: z.literal("list-item"),
  description: z.literal("An individual item within a list."),
  allowedChildren: z.tuple([z.literal("text"), z.literal("headline")]),
});

const headlineNodeSchema = z.object({
  name: z.literal("headline"),
  description: z.literal("A headline text component."),
  allowedChildren: z.tuple([]),
  props: z.object({
    text: z.literal("string"),
  }),
});

const textNodeSchema = z.object({
  name: z.literal("text"),
  description: z.literal("A text content component."),
  allowedChildren: z.tuple([]),
  props: z.object({
    text: z.literal("string"),
  }),
});

const imageNodeSchema = z.object({
  name: z.literal("image"),
  description: z.literal("An image component."),
  props: z.object({
    imageUrl: z.literal("string"),
  }),
  allowedChildren: z.tuple([]),
});

const dividerNodeSchema = z.object({
  name: z.literal("divider"),
  description: z.literal("A divider/separator component."),
  allowedChildren: z.tuple([]),
});

const groupNodeSchema = z.object({
  name: z.literal("group"),
  description: z.literal("Just a placeholder for now"),
  allowedChildren: z.tuple([]),
});

const shapeNodeSchema = z.object({
  name: z.literal("shape"),
  description: z.literal("A shape component."),
  allowedChildren: z.tuple([]),
});

const flexGroupNodeSchema = z.object({
  name: z.literal("flex-group"),
  description: z.literal(
    "A flexible container component for organizing content with advanced layout options."
  ),
  allowedChildren: z.tuple([
    z.literal("headline"),
    z.literal("text"),
    z.literal("accordion"),
    z.literal("blockquote"),
    z.literal("table"),
    z.literal("alert"),
    z.literal("button-group"),
  ]),
});

const accordionNodeSchema = z.object({
  name: z.literal("accordion"),
  description: z.literal("An accordion component."),
  allowedChildren: z.tuple([z.literal("accordion-item")]),
});

const accordionItemNodeSchema = z.object({
  name: z.literal("accordion-item"),
  description: z.literal(
    "An accordion item component with title and content areas."
  ),
  allowedNamedSlots: z.object({
    title: z.object({
      description: z.literal(
        "The clickable title/header of the accordion item"
      ),
      allowedChildren: z.tuple([z.literal("text")]),
      required: z.literal(true),
      maxItems: z.literal(1),
      minItems: z.literal(1),
    }),
    content: z.object({
      description: z.literal("The collapsible content area"),
      allowedChildren: z.tuple([
        z.literal("text"),
        z.literal("divider"),
        z.literal("blockquote"),
      ]),
      required: z.literal(true),
      maxItems: z.null(),
      minItems: z.literal(1),
    }),
  }),
});

const blockquoteNodeSchema = z.object({
  name: z.literal("blockquote"),
  description: z.literal(
    "A blockquote component for quotations with optional citation."
  ),
  allowedChildren: z.tuple([]),
  props: z.object({
    content: z.literal("string"),
    quote: z.literal("string"),
    citation: z.literal("string"),
    author: z.literal("string"),
  }),
});

const tableNodeSchema = z.object({
  name: z.literal("table"),
  description: z.literal(
    "A table component for displaying structured data with rows and columns"
  ),
  allowedChildren: z.tuple([z.literal("table-row")]),
  props: z.object({
    filled: z.literal("boolean"),
    striped: z.literal("boolean"),
    bordered: z.literal("boolean"),
    enableHeader: z.literal("boolean"),
    enableFooter: z.literal("boolean"),
    layoutAuto: z.literal("boolean"),
    alignCellsTop: z.literal("boolean"),
    customClassname: z.literal("string"),
  }),
});

const tableRowNodeSchema = z.object({
  name: z.literal("table-row"),
  description: z.literal(
    "A table row that can be marked as header or footer row"
  ),
  allowedChildren: z.tuple([z.literal("table-cell")]),
  props: z.object({
    isHeader: z.literal("boolean"),
    isFooter: z.literal("boolean"),
    customClassname: z.literal("string"),
  }),
});

const tableCellNodeSchema = z.object({
  name: z.literal("table-cell"),
  description: z.literal("A table cell that can contain text content"),
  allowedChildren: z.tuple([z.literal("text")]),
  props: z.object({
    colspan: z.literal("number"),
    rowspan: z.literal("number"),
    customClassname: z.literal("string"),
  }),
});

const alertNodeSchema = z.object({
  name: z.literal("alert"),
  description: z.literal(
    "An alert component for displaying important messages with title and content. Supports different intents (info, warning, attention, success) and optional pointer arrow."
  ),
  allowedChildren: z.tuple([]),
  props: z.object({
    title: z.literal("string"),
    content: z.literal("string"),
    intent: z.literal("string"),
    withPointer: z.literal("boolean"),
    pointerSide: z.literal("string"),
    customClassname: z.literal("string"),
  }),
});

const buttonGroupNodeSchema = z.object({
  name: z.literal("button-group"),
  description: z.literal(
    "Container component for buttons that provides consistent spacing, alignment, and accessibility. Required as the immediate parent for all button components in the design system."
  ),
  allowedChildren: z.tuple([z.literal("button")]),
  props: z.object({
    layout: z.literal("string"), // stretch, pack, stack, stack-stretch
    align: z.literal("string"), // start, center, end
    customClassname: z.literal("string"),
  }),
});

const buttonNodeSchema = z.object({
  name: z.literal("button"),
  description: z.literal(
    "An interactive button component with various styles, sizes, and states. Contains visual content (text, icons) and can define actions (drawer, links). CRITICAL RULE: Button components must ALWAYS have button-group as their immediate parent - no exceptions. This applies to ALL contexts: sections, flex-groups, drawers, modals, etc."
  ),
  allowedChildren: z.tuple([
    z.literal("text"), // Visual content
    z.literal("icon"), // Visual content
    z.literal("drawer"), // Action definition: creates a drawer action when button is clicked
  ]),
  props: z.object({
    text: z.literal("string"),
    variant: z.literal("string"), // primary, secondary, link
    size: z.literal("string"), // xSmall, small, regular, large, xLarge
    mono: z.literal("string"), // dark, light - for colored backgrounds
    shape: z.literal("string"), // round, square
    multiline: z.literal("boolean"), // multi-line text support
    disabled: z.literal("boolean"),
    isLoading: z.literal("boolean"), // matches actual prop name
    as: z.literal("string"), // button, a, div, span
    href: z.literal("string"), // for link buttons (alternative to drawer action)
    target: z.literal("string"), // _blank, _self
    ariaLabel: z.literal("string"), // accessibility
    ariaLabelledby: z.literal("string"), // accessibility
    bgClassName: z.literal("string"), // custom background styling
    contentClassName: z.literal("string"), // custom content styling
    customClassname: z.literal("string"),
  }),
});

const drawerNodeSchema = z.object({
  name: z.literal("drawer"),
  description: z.literal(
    "A drawer component that slides in from a screen edge. Contains rich content and is typically triggered by a button action. Supports all four directions (top, bottom, left, right)."
  ),
  allowedChildren: z.tuple([
    z.literal("text"),
    z.literal("headline"),
    z.literal("image"),
    z.literal("button-group"),
    z.literal("flex-group"),
    z.literal("divider"),
    z.literal("list"),
    z.literal("blockquote"),
    z.literal("table"),
  ]),
  props: z.object({
    title: z.literal("string"), // drawer title
    subtitle: z.literal("string"), // drawer subtitle
    direction: z.literal("string"), // right, left, top, bottom
    customClassname: z.literal("string"),
  }),
});

// Combined registry schema
export const nodesRegistrySchema = z.object({
  page: pageNodeSchema,
  section: sectionNodeSchema,
  "editorial-card": editorialCardNodeSchema,
  header: headerNodeSchema,
  footer: footerNodeSchema,
  list: listNodeSchema,
  "list-item": listItemNodeSchema,
  headline: headlineNodeSchema,
  text: textNodeSchema,
  image: imageNodeSchema,
  divider: dividerNodeSchema,
  group: groupNodeSchema,
  shape: shapeNodeSchema,
  "flex-group": flexGroupNodeSchema,
  accordion: accordionNodeSchema,
  "accordion-item": accordionItemNodeSchema,
  blockquote: blockquoteNodeSchema,
  table: tableNodeSchema,
  "table-row": tableRowNodeSchema,
  "table-cell": tableCellNodeSchema,
  alert: alertNodeSchema,
  "button-group": buttonGroupNodeSchema,
  button: buttonNodeSchema,
  drawer: drawerNodeSchema,
});

// Type for the schema (can be used for type checking)
export type NodesRegistrySchema = z.infer<typeof nodesRegistrySchema>;
