import { describe, expect, it } from "vitest";
import { zodIntrospectionService } from "./zod-introspection.service";

describe("ZodIntrospectionService", () => {
  describe("getNodeSchemaInfo", () => {
    it("should return correct info for page node", () => {
      const pageInfo = zodIntrospectionService.getNodeSchemaInfo("page");

      expect(pageInfo).toEqual({
        name: "page",
        description: "A page is the root component of a Storyblok page.",
        allowedChildren: ["section", "header", "footer"],
        allowedNamedSlots: null,
        props: {},
        hasChildren: true,
        hasNamedSlots: false,
      });
    });

    it("should return correct info for editorial-card node with named slots", () => {
      const editorialCardInfo =
        zodIntrospectionService.getNodeSchemaInfo("editorial-card");

      expect(editorialCardInfo).toEqual({
        name: "editorial-card",
        description:
          "An editorial card is a container for a single piece of content with structured areas.",
        allowedChildren: [],
        allowedNamedSlots: {
          card_title: {
            description: "The card title/headline area",
            allowedChildren: ["headline"],
            required: false,
            maxItems: null,
            minItems: 0,
          },
          card_body: {
            description: "The main content area of the card",
            allowedChildren: ["text"],
            required: false,
            maxItems: null,
            minItems: 0,
          },
          card_image: {
            description: "Media area for the card",
            allowedChildren: ["image"],
            required: false,
            maxItems: null,
            minItems: 0,
          },
        },
        props: {},
        hasChildren: false,
        hasNamedSlots: true,
      });
    });

    it("should return correct info for node with props", () => {
      const blockquoteInfo =
        zodIntrospectionService.getNodeSchemaInfo("blockquote");

      expect(blockquoteInfo).toEqual({
        name: "blockquote",
        description:
          "A blockquote component for quotations with optional citation.",
        allowedChildren: [],
        allowedNamedSlots: null,
        props: {
          content: "string",
          quote: "string",
          citation: "string",
          author: "string",
        },
        hasChildren: false,
        hasNamedSlots: false,
      });
    });

    it("should return correct info for accordion-item with required named slots", () => {
      const accordionItemInfo =
        zodIntrospectionService.getNodeSchemaInfo("accordion-item");

      expect(accordionItemInfo?.allowedNamedSlots).toEqual({
        title: {
          description: "The clickable title/header of the accordion item",
          allowedChildren: ["text"],
          required: true,
          maxItems: 1,
          minItems: 1,
        },
        content: {
          description: "The collapsible content area",
          allowedChildren: ["text", "divider", "blockquote"],
          required: true,
          maxItems: null,
          minItems: 1,
        },
      });
    });

    it("should return null for unknown node type", () => {
      const unknownInfo =
        zodIntrospectionService.getNodeSchemaInfo("unknown-type");
      expect(unknownInfo).toBeNull();
    });
  });

  describe("getAvailableNodeTypes", () => {
    it("should return all available node types", () => {
      const nodeTypes = zodIntrospectionService.getAvailableNodeTypes();

      expect(nodeTypes).toContain("page");
      expect(nodeTypes).toContain("section");
      expect(nodeTypes).toContain("editorial-card");
      expect(nodeTypes).toContain("headline");
      expect(nodeTypes).toContain("text");
      expect(nodeTypes).toContain("image");
      expect(nodeTypes).toContain("accordion-item");
      expect(nodeTypes).toContain("blockquote");
      expect(nodeTypes).toContain("table");
      expect(nodeTypes).toContain("alert");

      // Should be array of strings
      expect(Array.isArray(nodeTypes)).toBe(true);
      expect(nodeTypes.length).toBeGreaterThan(10);
    });
  });

  describe("isValidNodeType", () => {
    it("should return true for valid node types", () => {
      expect(zodIntrospectionService.isValidNodeType("page")).toBe(true);
      expect(zodIntrospectionService.isValidNodeType("section")).toBe(true);
      expect(zodIntrospectionService.isValidNodeType("editorial-card")).toBe(
        true
      );
      expect(zodIntrospectionService.isValidNodeType("headline")).toBe(true);
      expect(zodIntrospectionService.isValidNodeType("text")).toBe(true);
    });

    it("should return false for invalid node types", () => {
      expect(zodIntrospectionService.isValidNodeType("unknown-type")).toBe(
        false
      );
      expect(zodIntrospectionService.isValidNodeType("invalid")).toBe(false);
      expect(zodIntrospectionService.isValidNodeType("")).toBe(false);
    });
  });

  describe("getAllowedChildren", () => {
    it("should return correct allowed children for page", () => {
      const allowedChildren =
        zodIntrospectionService.getAllowedChildren("page");
      expect(allowedChildren).toEqual(["section", "header", "footer"]);
    });

    it("should return correct allowed children for section", () => {
      const allowedChildren =
        zodIntrospectionService.getAllowedChildren("section");
      expect(allowedChildren).toContain("headline");
      expect(allowedChildren).toContain("text");
      expect(allowedChildren).toContain("image");
      expect(allowedChildren).toContain("editorial-card");
    });

    it("should return empty array for leaf nodes", () => {
      const allowedChildren =
        zodIntrospectionService.getAllowedChildren("headline");
      expect(allowedChildren).toEqual([]);
    });

    it("should return empty array for nodes with named slots", () => {
      const allowedChildren =
        zodIntrospectionService.getAllowedChildren("editorial-card");
      expect(allowedChildren).toEqual([]);
    });

    it("should return empty array for unknown node type", () => {
      const allowedChildren =
        zodIntrospectionService.getAllowedChildren("unknown-type");
      expect(allowedChildren).toEqual([]);
    });
  });

  describe("getNamedSlots", () => {
    it("should return null for nodes without named slots", () => {
      const namedSlots = zodIntrospectionService.getNamedSlots("page");
      expect(namedSlots).toBeNull();
    });

    it("should return correct named slots for editorial-card", () => {
      const namedSlots =
        zodIntrospectionService.getNamedSlots("editorial-card");

      expect(namedSlots).not.toBeNull();
      expect(Object.keys(namedSlots!)).toEqual([
        "card_title",
        "card_body",
        "card_image",
      ]);

      expect(namedSlots!.card_title).toEqual({
        description: "The card title/headline area",
        allowedChildren: ["headline"],
        required: false,
        maxItems: null,
        minItems: 0,
      });
    });

    it("should return correct named slots for accordion-item", () => {
      const namedSlots =
        zodIntrospectionService.getNamedSlots("accordion-item");

      expect(namedSlots).not.toBeNull();
      expect(Object.keys(namedSlots!)).toEqual(["title", "content"]);

      expect(namedSlots!.title).toEqual({
        description: "The clickable title/header of the accordion item",
        allowedChildren: ["text"],
        required: true,
        maxItems: 1,
        minItems: 1,
      });
    });

    it("should return null for unknown node type", () => {
      const namedSlots = zodIntrospectionService.getNamedSlots("unknown-type");
      expect(namedSlots).toBeNull();
    });
  });

  describe("getProps", () => {
    it("should return empty object for nodes without props", () => {
      const props = zodIntrospectionService.getProps("page");
      expect(props).toEqual({});
    });

    it("should return correct props for headline", () => {
      const props = zodIntrospectionService.getProps("headline");
      expect(props).toEqual({
        text: "string",
      });
    });

    it("should return correct props for text", () => {
      const props = zodIntrospectionService.getProps("text");
      expect(props).toEqual({
        text: "string",
      });
    });

    it("should return correct props for image", () => {
      const props = zodIntrospectionService.getProps("image");
      expect(props).toEqual({
        imageUrl: "string",
      });
    });

    it("should return correct props for blockquote", () => {
      const props = zodIntrospectionService.getProps("blockquote");
      expect(props).toEqual({
        content: "string",
        quote: "string",
        citation: "string",
        author: "string",
      });
    });

    it("should return correct props for table", () => {
      const props = zodIntrospectionService.getProps("table");
      expect(props).toEqual({
        filled: "boolean",
        striped: "boolean",
        bordered: "boolean",
        enableHeader: "boolean",
        enableFooter: "boolean",
        layoutAuto: "boolean",
        alignCellsTop: "boolean",
        customClassname: "string",
      });
    });

    it("should return empty object for unknown node type", () => {
      const props = zodIntrospectionService.getProps("unknown-type");
      expect(props).toEqual({});
    });
  });

  describe("isChildAllowed", () => {
    it("should return true for valid parent-child relationships", () => {
      expect(zodIntrospectionService.isChildAllowed("page", "section")).toBe(
        true
      );
      expect(zodIntrospectionService.isChildAllowed("page", "header")).toBe(
        true
      );
      expect(zodIntrospectionService.isChildAllowed("page", "footer")).toBe(
        true
      );
      expect(
        zodIntrospectionService.isChildAllowed("section", "headline")
      ).toBe(true);
      expect(zodIntrospectionService.isChildAllowed("section", "text")).toBe(
        true
      );
      expect(zodIntrospectionService.isChildAllowed("list", "list-item")).toBe(
        true
      );
    });

    it("should return false for invalid parent-child relationships", () => {
      expect(zodIntrospectionService.isChildAllowed("page", "text")).toBe(
        false
      );
      expect(zodIntrospectionService.isChildAllowed("page", "headline")).toBe(
        false
      );
      expect(zodIntrospectionService.isChildAllowed("headline", "text")).toBe(
        false
      );
      expect(zodIntrospectionService.isChildAllowed("text", "headline")).toBe(
        false
      );
    });

    it("should return false for nodes with named slots", () => {
      expect(
        zodIntrospectionService.isChildAllowed("editorial-card", "headline")
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowed("editorial-card", "text")
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowed("accordion-item", "text")
      ).toBe(false);
    });

    it("should return false for unknown node types", () => {
      expect(
        zodIntrospectionService.isChildAllowed("unknown-parent", "text")
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowed("page", "unknown-child")
      ).toBe(false);
    });
  });

  describe("isChildAllowedInSlot", () => {
    it("should return true for valid slot-child relationships", () => {
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_title",
          "headline"
        )
      ).toBe(true);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_body",
          "text"
        )
      ).toBe(true);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_image",
          "image"
        )
      ).toBe(true);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "accordion-item",
          "title",
          "text"
        )
      ).toBe(true);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "accordion-item",
          "content",
          "text"
        )
      ).toBe(true);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "accordion-item",
          "content",
          "divider"
        )
      ).toBe(true);
    });

    it("should return false for invalid slot-child relationships", () => {
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_title",
          "text"
        )
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_body",
          "headline"
        )
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_image",
          "text"
        )
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "accordion-item",
          "title",
          "headline"
        )
      ).toBe(false);
    });

    it("should return false for unknown slots", () => {
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "unknown_slot",
          "text"
        )
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "accordion-item",
          "unknown_slot",
          "text"
        )
      ).toBe(false);
    });

    it("should return false for nodes without named slots", () => {
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "page",
          "some_slot",
          "text"
        )
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "section",
          "some_slot",
          "text"
        )
      ).toBe(false);
    });

    it("should return false for unknown node types", () => {
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "unknown-type",
          "slot",
          "text"
        )
      ).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings gracefully", () => {
      expect(zodIntrospectionService.getNodeSchemaInfo("")).toBeNull();
      expect(zodIntrospectionService.isValidNodeType("")).toBe(false);
      expect(zodIntrospectionService.getAllowedChildren("")).toEqual([]);
      expect(zodIntrospectionService.getNamedSlots("")).toBeNull();
      expect(zodIntrospectionService.getProps("")).toEqual({});
    });

    it("should handle null/undefined inputs gracefully", () => {
      expect(zodIntrospectionService.isChildAllowed("page", "")).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "",
          "text"
        )
      ).toBe(false);
      expect(
        zodIntrospectionService.isChildAllowedInSlot(
          "editorial-card",
          "card_title",
          ""
        )
      ).toBe(false);
    });

    it("should work with hyphenated node names", () => {
      expect(zodIntrospectionService.isValidNodeType("editorial-card")).toBe(
        true
      );
      expect(zodIntrospectionService.isValidNodeType("list-item")).toBe(true);
      expect(zodIntrospectionService.isValidNodeType("accordion-item")).toBe(
        true
      );
      expect(zodIntrospectionService.isValidNodeType("table-row")).toBe(true);
      expect(zodIntrospectionService.isValidNodeType("table-cell")).toBe(true);
      expect(zodIntrospectionService.isValidNodeType("flex-group")).toBe(true);
    });
  });
});
