import { serviceRegistry as _serviceRegistry } from "@/registry/service-registry";
import { logger, userLogger } from "@/utils/logger";
import { intermediateLayoutSchema } from "../../schema";
import { IntermediateLayout, IntermediateNode, IntermediateNodeType } from "../../schema.types";
import {
  ProseMirrorNode,
  ReverseComponentRegistryEntry,
  ReverseComponentTransformer,
  StoryblokAsset,
  StoryblokComponent,
  StoryblokStory,
  StoryblokToIRFOptions,
  StoryblokToIRFResult,
  TransformationContext,
  TransformationError,
  TransformationWarning,
} from "./storyblok-to-irf.service.types";

/**
 * Storyblok to IRF Transformer Service
 *
 * This service handles the reverse transformation of Storyblok CMS JSON format
 * into IRF (Intermediate Response Format) structures.
 */

const createStoryblokToIRFService = () => {
  // Get dependencies from service registry
  const storyblokDesignToIRFService = _serviceRegistry.get("storyblokDesignToIRF");

  // Private state
  const _transformationCache = new Map<string, StoryblokToIRFResult>();
  const _errors: TransformationError[] = [];
  const _warnings: TransformationWarning[] = [];

  // Reverse Component Registry - maps Storyblok components to IRF nodes
  const _reverseComponentRegistry: Record<string, ReverseComponentRegistryEntry> = {
    // Page component (root level)
    page: {
      targetIRFType: "page",
      confidence: 1.0,
      description: "Root page component containing all other components",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.body && Array.isArray(component.body)) {
          for (const childComponent of component.body) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform child component: ${error}`, "page");
            }
          }
        }

        return {
          type: "page",
          name: component.name || "Page",
          children,
          props: {
            noIndex: component.no_index,
            noFollow: component.no_follow,
            seoMetaFields: component.seo_meta_fields,
            structuredData: component.structured_data,
            backgroundColor: component.background_color?.selected,
          },
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Section component
    "sb-section": {
      targetIRFType: "section",
      confidence: 1.0,
      description: "Section component for organizing content",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.content && Array.isArray(component.content)) {
          for (const childComponent of component.content) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform section child: ${error}`, "sb-section");
            }
          }
        }

        return {
          type: "section",
          name: component.name !== undefined ? component.name : "Section",
          children,
          props: {
            customClassname: component.custom_classname,
            backpackAi: component.backpack_ai,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Text components (section and flex-group variants)
    "sb-text-section": {
      targetIRFType: "text",
      confidence: 1.0,
      description: "Text component within a section",
      transform: (component, options) => {
        const textContent = extractTextFromRichText(component.content);

        return {
          type: "text",
          name: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
          parentNodeTypeName: "section",
          props: {
            content: textContent,
            text: textContent,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-text-flex-group": {
      targetIRFType: "text",
      confidence: 1.0,
      description: "Text component within a flex group",
      transform: (component, options) => {
        const textContent = extractTextFromRichText(component.content);

        return {
          type: "text",
          name: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
          parentNodeTypeName: "flex-group",
          props: {
            content: textContent,
            text: textContent,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Headline components (section and flex-group variants)
    "sb-headline-section": {
      targetIRFType: "headline",
      confidence: 1.0,
      description: "Headline component within a section",
      transform: (component, options) => {
        return {
          type: "headline",
          name: component.content || "Headline",
          parentNodeTypeName: "section",
          props: {
            content: component.content,
            title: component.content,
            headline: component.content,
            as: component.as || "h4",
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-headline-flex-group": {
      targetIRFType: "headline",
      confidence: 1.0,
      description: "Headline component within a flex group",
      transform: (component, options) => {
        return {
          type: "headline",
          name: component.content || "Headline",
          parentNodeTypeName: "flex-group",
          props: {
            content: component.content,
            title: component.content,
            headline: component.content,
            as: component.as || "h4",
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Image component
    "sb-image-section": {
      targetIRFType: "image",
      confidence: 1.0,
      description: "Image component with asset handling",
      transform: (component, options) => {
        const imageAsset = component.image as StoryblokAsset;

        return {
          type: "image",
          name: imageAsset?.name || imageAsset?.alt || "Image",
          props: {
            alt: imageAsset?.alt,
            title: imageAsset?.title,
            source: imageAsset?.source,
            name: imageAsset?.name,
            focus: imageAsset?.focus,
            customClassname: component.custom_classname,
          },
          design: {
            appearance: {
              backgroundColor: imageAsset?.filename
                ? {
                    imageRef: imageAsset.filename,
                  }
                : undefined,
            },
          },
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
                assetId: imageAsset?.id,
              }
            : undefined,
        };
      },
    },

    // Accordion components
    "sb-accordion-section": {
      targetIRFType: "accordion",
      confidence: 1.0,
      description: "Accordion component within a section",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.items && Array.isArray(component.items)) {
          for (const childComponent of component.items) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform accordion item: ${error}`, "sb-accordion-section");
            }
          }
        }

        return {
          type: "accordion",
          name: "Accordion",
          parentNodeTypeName: "section",
          children,
          props: {
            type: component.type || "multiple",
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-accordion-item": {
      targetIRFType: "accordion-item",
      confidence: 1.0,
      description: "Accordion item with title and content slots",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        // Transform accordion item to use slots
        const slots: { [slotName: string]: IntermediateNode[] } = {};

        // Process title slot
        if (component.title && Array.isArray(component.title)) {
          slots.title = [];
          for (const titleComponent of component.title) {
            try {
              const titleNode = await transformStoryblokComponentToIRF(titleComponent, {
                ...context,
                depth: context.depth + 1,
              });
              slots.title.push(titleNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform accordion title: ${error}`, "sb-accordion-item");
            }
          }
        }

        // Process content slot
        if (component.content && Array.isArray(component.content)) {
          slots.content = [];
          for (const contentComponent of component.content) {
            try {
              const contentNode = await transformStoryblokComponentToIRF(contentComponent, {
                ...context,
                depth: context.depth + 1,
              });
              slots.content.push(contentNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform accordion content: ${error}`, "sb-accordion-item");
            }
          }
        }

        // Process icon slot if present
        if (component.icon && Array.isArray(component.icon)) {
          slots.icon = [];
          for (const iconComponent of component.icon) {
            try {
              const iconNode = await transformStoryblokComponentToIRF(iconComponent, {
                ...context,
                depth: context.depth + 1,
              });
              slots.icon.push(iconNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform accordion icon: ${error}`, "sb-accordion-item");
            }
          }
        }

        return {
          type: "accordion-item",
          name: "Accordion Item",
          parentNodeTypeName: "accordion",
          slots,
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Editorial card component
    "sb-editorial-card": {
      targetIRFType: "editorial-card",
      confidence: 1.0,
      description: "Editorial card with title, body, and image slots",
      transform: async (component, options) => {
        // Transform editorial card to use slots
        const slots: { [slotName: string]: IntermediateNode[] } = {};

        // Process card_title slot
        if (component.card_title && Array.isArray(component.card_title)) {
          slots.card_title = [];
          for (const titleComponent of component.card_title) {
            // Extract text from the sb-card-title component
            const textContent = extractTextFromRichText(titleComponent.content);
            slots.card_title.push({
              type: "headline",
              name: textContent || "Card Title",
              props: {
                text: textContent,
              },
            });
          }
        }

        // Process card_body slot
        if (component.card_body && Array.isArray(component.card_body)) {
          slots.card_body = [];
          for (const bodyComponent of component.card_body) {
            // Extract text from the sb-card-body component
            const textContent = extractTextFromRichText(bodyComponent.content);
            slots.card_body.push({
              type: "text",
              name: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
              props: {
                text: textContent,
              },
            });
          }
        }

        // Process card_image slot
        if (component.card_image && Array.isArray(component.card_image)) {
          slots.card_image = [];
          for (const imageComponent of component.card_image) {
            const imageAsset = imageComponent.image as StoryblokAsset;
            slots.card_image.push({
              type: "image",
              name: imageAsset?.name || imageAsset?.alt || "Card Image",
              props: {
                alt: imageAsset?.alt,
                name: imageAsset?.name,
              },
              design: {
                appearance: {
                  backgroundColor: imageAsset?.filename
                    ? {
                        imageRef: imageAsset.filename,
                      }
                    : undefined,
                },
              },
              aiInsights: {
                suggestedType: "image",
                confidence: 1.0,
                reasoning: "Component is an image within an editorial card",
                complexity: "simple",
              },
            });
          }
        }

        return {
          type: "editorial-card",
          name: "Editorial Card",
          slots,
          props: {
            card_link: component.card_link,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Flex group components
    "sb-flex-group-section": {
      targetIRFType: "flex-group",
      confidence: 1.0,
      description: "Flex group component within a section",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.content && Array.isArray(component.content)) {
          for (const childComponent of component.content) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform flex group child: ${error}`, "sb-flex-group-section");
            }
          }
        }

        return {
          type: "flex-group",
          name: component.name || "Flex Group",
          parentNodeTypeName: "section",
          children,
          props: {
            customClassname: component.custom_classname,
            backpackAi: component.backpack_ai,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Divider components
    "sb-divider-section": {
      targetIRFType: "divider",
      confidence: 1.0,
      description: "Divider component within a section",
      transform: (component, options) => {
        return {
          type: "divider",
          name: "Divider",
          parentNodeTypeName: "section",
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-divider": {
      targetIRFType: "divider",
      confidence: 1.0,
      description: "Divider component (generic)",
      transform: (component, options) => {
        return {
          type: "divider",
          name: "Divider",
          parentNodeTypeName: "accordion-item", // Default context
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // List components
    "sb-list-section": {
      targetIRFType: "list",
      confidence: 1.0,
      description: "List component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.items && Array.isArray(component.items)) {
          for (const childComponent of component.items) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform list item: ${error}`, "sb-list-section");
            }
          }
        }

        return {
          type: "list",
          name: "List",
          children,
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-list-item": {
      targetIRFType: "list-item",
      confidence: 1.0,
      description: "List item component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];

        // List items typically contain a flex group with content
        if (component.content && Array.isArray(component.content)) {
          for (const contentItem of component.content) {
            if (contentItem.component === "sb-flex-group" && contentItem.content) {
              // Extract children from the flex group
              for (const childComponent of contentItem.content) {
                try {
                  // Transform the headline/text components directly
                  let childNode: IntermediateNode;

                  if (childComponent.component === "sb-headline-flex-group") {
                    childNode = {
                      type: "headline",
                      name: childComponent.content || "List Item Headline",
                      props: {
                        title: childComponent.content,
                        text: childComponent.content,
                      },
                    };
                  } else if (childComponent.component === "sb-text-flex-group") {
                    const textContent = extractTextFromRichText(childComponent.content);
                    childNode = {
                      type: "text",
                      name: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
                      props: {
                        text: textContent,
                        paragraph: textContent,
                      },
                    };
                  } else {
                    childNode = await transformStoryblokComponentToIRF(childComponent, {
                      ...context,
                      depth: context.depth + 1,
                    });
                  }

                  children.push(childNode);
                } catch (error) {
                  _addError("PARSING_ERROR", `Failed to transform list item child: ${error}`, "sb-list-item");
                }
              }
            }
          }
        }

        return {
          type: "list-item",
          name: "List Item",
          children,
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Blockquote components
    "sb-blockquote-section": {
      targetIRFType: "blockquote",
      confidence: 1.0,
      description: "Blockquote component within a section",
      transform: (component, options) => {
        const content = extractTextFromRichText(component.content);
        const citation = extractTextFromRichText(component.citation);

        return {
          type: "blockquote",
          name: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          parentNodeTypeName: "section",
          props: {
            content,
            quote: content,
            text: content,
            citation,
            author: citation,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-blockquote-flex-group": {
      targetIRFType: "blockquote",
      confidence: 1.0,
      description: "Blockquote component within a flex group",
      transform: (component, options) => {
        const content = extractTextFromRichText(component.content);
        const citation = extractTextFromRichText(component.citation);

        return {
          type: "blockquote",
          name: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          parentNodeTypeName: "flex-group",
          props: {
            content,
            quote: content,
            text: content,
            citation,
            author: citation,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-blockquote": {
      targetIRFType: "blockquote",
      confidence: 1.0,
      description:
        "Generic blockquote component (accordion-item or drawer context)",
      transform: (component, options) => {
        const content = extractTextFromRichText(component.content);
        const citation = extractTextFromRichText(component.citation);

        return {
          type: "blockquote",
          name: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          parentNodeTypeName: "accordion-item",
          props: {
            content,
            quote: content,
            text: content,
            citation,
            author: citation,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Table components
    "sb-table-section": {
      targetIRFType: "table",
      confidence: 1.0,
      description: "Table component within a section",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.rows && Array.isArray(component.rows)) {
          for (const childComponent of component.rows) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform table row: ${error}`, "sb-table-section");
            }
          }
        }

        return {
          type: "table",
          name: "Table",
          parentNodeTypeName: "section",
          children,
          props: {
            filled: component.filled ?? false,
            striped: component.striped ?? false,
            bordered: component.bordered ?? false,
            enableHeader: component.enableHeader ?? true,
            enableFooter: component.enableFooter ?? false,
            layoutAuto: component.layoutAuto ?? false,
            alignCellsTop: component.alignCellsTop ?? false,
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-table-flex-group": {
      targetIRFType: "table",
      confidence: 1.0,
      description: "Table component within a flex group",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.rows && Array.isArray(component.rows)) {
          for (const childComponent of component.rows) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform table row: ${error}`, "sb-table-flex-group");
            }
          }
        }

        return {
          type: "table",
          name: "Table",
          parentNodeTypeName: "flex-group",
          children,
          props: {
            filled: component.filled ?? false,
            striped: component.striped ?? false,
            bordered: component.bordered ?? false,
            enableHeader: component.enableHeader ?? true,
            enableFooter: component.enableFooter ?? false,
            layoutAuto: component.layoutAuto ?? false,
            alignCellsTop: component.alignCellsTop ?? false,
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-table": {
      targetIRFType: "table",
      confidence: 1.0,
      description: "Generic table component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.rows && Array.isArray(component.rows)) {
          for (const childComponent of component.rows) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform table row: ${error}`, "sb-table");
            }
          }
        }

        return {
          type: "table",
          name: "Table",
          children,
          props: {
            filled: component.filled ?? false,
            striped: component.striped ?? false,
            bordered: component.bordered ?? false,
            enableHeader: component.enableHeader ?? true,
            enableFooter: component.enableFooter ?? false,
            layoutAuto: component.layoutAuto ?? false,
            alignCellsTop: component.alignCellsTop ?? false,
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-table-row": {
      targetIRFType: "table-row",
      confidence: 1.0,
      description: "Table row component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.cells && Array.isArray(component.cells)) {
          for (const childComponent of component.cells) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform table cell: ${error}`, "sb-table-row");
            }
          }
        }

        return {
          type: "table-row",
          name: component.is_header ? "Header Row" : component.is_footer ? "Footer Row" : "Table Row",
          children,
          props: {
            isHeader: component.is_header || false,
            isFooter: component.is_footer || false,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-table-cell": {
      targetIRFType: "table-cell",
      confidence: 1.0,
      description: "Table cell component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.content && Array.isArray(component.content)) {
          for (const childComponent of component.content) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform table cell content: ${error}`, "sb-table-cell");
            }
          }
        }

        return {
          type: "table-cell",
          name: "Table Cell",
          children,
          props: {
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Accordion flex group variant
    "sb-accordion-flex-group": {
      targetIRFType: "accordion",
      confidence: 1.0,
      description: "Accordion component within a flex group",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.items && Array.isArray(component.items)) {
          for (const childComponent of component.items) {
            try {
              const childNode = await transformStoryblokComponentToIRF(childComponent, {
                ...context,
                depth: context.depth + 1,
              });
              children.push(childNode);
            } catch (error) {
              _addError("PARSING_ERROR", `Failed to transform accordion item: ${error}`, "sb-accordion-flex-group");
            }
          }
        }

        return {
          type: "accordion",
          name: "Accordion",
          parentNodeTypeName: "flex-group",
          children,
          props: {
            type: component.type || "multiple",
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Generic components (used inside slots)
    "sb-headline": {
      targetIRFType: "headline",
      confidence: 1.0,
      description: "Generic headline component",
      transform: (component, options) => {
        return {
          type: "headline",
          name: component.content || "Headline",
          props: {
            content: component.content,
            text: component.content,
            as: component.as || "h4",
          },
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-text": {
      targetIRFType: "text",
      confidence: 1.0,
      description: "Generic text component",
      transform: (component, options) => {
        const textContent = extractTextFromRichText(component.content);

        return {
          type: "text",
          name: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
          props: {
            content: textContent,
            text: textContent,
          },
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-image": {
      targetIRFType: "image",
      confidence: 1.0,
      description: "Generic image component",
      transform: (component, options) => {
        const imageAsset = component.image as StoryblokAsset;

        return {
          type: "image",
          name: imageAsset?.name || imageAsset?.alt || "Image",
          props: {
            alt: imageAsset?.alt,
            title: imageAsset?.title,
            name: imageAsset?.name,
          },
          design: {
            appearance: {
              backgroundColor: imageAsset?.filename
                ? {
                    imageRef: imageAsset.filename,
                  }
                : undefined,
            },
          },
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Alert components
    "sb-alert-section": {
      targetIRFType: "alert",
      confidence: 1.0,
      description: "Alert component within a section",
      transform: (component, options) => {
        // Extract title and content from the nested components
        const titleText = component.title?.[0]?.content ? extractTextFromRichText(component.title[0].content) : "Alert";
        const contentText = component.content?.[0]?.content
          ? extractTextFromRichText(component.content[0].content)
          : "Alert content";

        return {
          type: "alert",
          name: titleText,
          parentNodeTypeName: "section",
          props: {
            title: titleText,
            content: contentText,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-alert": {
      targetIRFType: "alert",
      confidence: 1.0,
      description: "Standalone alert component",
      transform: (component, options) => {
        // Extract title and content from the nested components
        const titleText = component.title?.[0]?.content ? extractTextFromRichText(component.title[0].content) : "Alert";
        const contentText = component.content?.[0]?.content
          ? extractTextFromRichText(component.content[0].content)
          : "Alert content";

        return {
          type: "alert",
          name: titleText,
          props: {
            title: titleText,
            content: contentText,
            customClassname: component.custom_classname,
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    // Button Group components
    "sb-button-group-section": {
      targetIRFType: "button-group",
      confidence: 1.0,
      description: "Button group component within a section",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.buttons && Array.isArray(component.buttons)) {
          for (const childComponent of component.buttons) {
            try {
              const childNode = await transformStoryblokComponentToIRF(
                childComponent,
                { ...context, depth: context.depth + 1 }
              );
              children.push(childNode);
            } catch (error) {
              _addError(
                "PARSING_ERROR",
                `Failed to transform button: ${error}`,
                "sb-button-group-section"
              );
            }
          }
        }

        return {
          type: "button-group",
          name: "Button Group",
          parentNodeTypeName: "section",
          children,
          props: {
            layout: component.layout || "pack",
            align: component.align || "start",
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-button-group-flex-group": {
      targetIRFType: "button-group",
      confidence: 1.0,
      description: "Button group component within a flex group",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.buttons && Array.isArray(component.buttons)) {
          for (const childComponent of component.buttons) {
            try {
              const childNode = await transformStoryblokComponentToIRF(
                childComponent,
                { ...context, depth: context.depth + 1 }
              );
              children.push(childNode);
            } catch (error) {
              _addError(
                "PARSING_ERROR",
                `Failed to transform button: ${error}`,
                "sb-button-group-flex-group"
              );
            }
          }
        }

        return {
          type: "button-group",
          name: "Button Group",
          parentNodeTypeName: "flex-group",
          children,
          props: {
            layout: component.layout || "pack",
            align: component.align || "start",
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-button-group": {
      targetIRFType: "button-group",
      confidence: 1.0,
      description: "Generic button group component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        const children: IntermediateNode[] = [];
        if (component.buttons && Array.isArray(component.buttons)) {
          for (const childComponent of component.buttons) {
            try {
              const childNode = await transformStoryblokComponentToIRF(
                childComponent,
                { ...context, depth: context.depth + 1 }
              );
              children.push(childNode);
            } catch (error) {
              _addError(
                "PARSING_ERROR",
                `Failed to transform button: ${error}`,
                "sb-button-group"
              );
            }
          }
        }

        return {
          type: "button-group",
          name: "Button Group",
          children,
          props: {
            layout: component.layout || "pack",
            align: component.align || "start",
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-drawer": {
      targetIRFType: "drawer",
      confidence: 1.0,
      description: "Drawer component that slides in from screen edge",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        // Process drawer content
        const children: IntermediateNode[] = [];
        if (component.content && Array.isArray(component.content)) {
          for (const childComponent of component.content) {
            try {
              const childNode = await transformStoryblokComponentToIRF(
                childComponent,
                { ...context, depth: context.depth + 1 }
              );
              children.push(childNode);
            } catch (error) {
              _addError(
                "PARSING_ERROR",
                `Failed to transform drawer content: ${error}`,
                "sb-drawer"
              );
            }
          }
        }

        return {
          type: "drawer",
          name: component.title || component.drawerTitle || "Drawer",
          children,
          props: {
            title: component.title || component.drawerTitle || "",
            subtitle: component.subtitle || component.drawerSubtitle || "",
            direction: component.design?.direction || "bottom",
            customClassname: "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-drawer-button": {
      targetIRFType: "drawer",
      confidence: 1.0,
      description: "Legacy drawer button component (use sb-drawer instead)",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        // Process drawer content
        const children: IntermediateNode[] = [];
        if (component.content && Array.isArray(component.content)) {
          for (const childComponent of component.content) {
            try {
              const childNode = await transformStoryblokComponentToIRF(
                childComponent,
                { ...context, depth: context.depth + 1 }
              );
              children.push(childNode);
            } catch (error) {
              _addError(
                "PARSING_ERROR",
                `Failed to transform drawer-button content: ${error}`,
                "sb-drawer-button"
              );
            }
          }
        }

        return {
          type: "drawer",
          name: component.drawerTitle || "Drawer",
          children,
          props: {
            title: component.drawerTitle || "",
            subtitle: component.drawerSubtitle || "",
            direction: "bottom", // default for legacy
            customClassname: "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },

    "sb-button": {
      targetIRFType: "button",
      confidence: 1.0,
      description: "Individual button component",
      transform: async (component, options) => {
        const context = createTransformationContext(component, options);

        // Process rich content (text, icons, etc.)
        const children: IntermediateNode[] = [];
        if (component.content && Array.isArray(component.content)) {
          for (const childComponent of component.content) {
            try {
              const childNode = await transformStoryblokComponentToIRF(
                childComponent,
                { ...context, depth: context.depth + 1 }
              );
              children.push(childNode);
            } catch (error) {
              _addError(
                "PARSING_ERROR",
                `Failed to transform button content: ${error}`,
                "sb-button"
              );
            }
          }
        }

        // Extract action info for props and children
        const action = component.action?.[0];
        const isLinkButton = action?.component === "sb-link-button";
        const isDrawerButton =
          action?.component === "sb-drawer" ||
          action?.component === "sb-drawer-button";

        // If this is a drawer button, add the drawer as a child
        if (isDrawerButton && action) {
          try {
            const drawerNode = await transformStoryblokComponentToIRF(action, {
              ...context,
              depth: context.depth + 1,
            });
            children.push(drawerNode);
          } catch (error) {
            _addError(
              "PARSING_ERROR",
              `Failed to transform drawer action: ${error}`,
              "sb-button"
            );
          }
        }

        return {
          type: "button",
          name:
            component.aria_label ||
            (children.length > 0 ? children[0]?.name || "Button" : "Button"),
          children,
          props: {
            text:
              children.find((child) => child.type === "text")?.props?.text ||
              "",
            href: isLinkButton
              ? action?.link?.url ||
                action?.link?.id ||
                action?.link?.cached_url ||
                ""
              : "",
            target: isLinkButton ? action?.link?.target || "_self" : "_self",
            ariaLabel: component.aria_label || "",
            ariaLabelledby: component.aria_labelledby || "",
            customClassname: component.custom_classname || "",
          },
          design: storyblokDesignToIRFService.extractFromComponent(component),
          meta: options?.includeMetadata
            ? {
                source: "storyblok",
                storyblokId: component._uid,
              }
            : undefined,
        };
      },
    },
  };

  // Main transformation function
  const transformStoryblokToIRF = async (
    storyblokStory: StoryblokStory,
    options: StoryblokToIRFOptions = {}
  ): Promise<StoryblokToIRFResult> => {
    try {
      const startTime = Date.now();
      _clearErrorsAndWarnings();

      _log(`Starting Storyblok to IRF transformation for story: ${storyblokStory.name}`);

      // Transform the story content
      const context = createTransformationContext(storyblokStory.content, options);

      userLogger.log("[storyblok-to-irf.service.ts] transformStoryblokToIRF: [context]", {
        context,
      });

      const rootNode = await transformStoryblokComponentToIRF(storyblokStory.content, context);

      userLogger.log("[storyblok-to-irf.service.ts] transformStoryblokToIRF: [rootNode]", {
        rootNode,
      });

      // Create IRF layout
      const irfLayout: IntermediateLayout = {
        version: "1.0",
        name: storyblokStory.name,
        content: [rootNode],
        globalVars: options.globalVars || {},
      };

      // Validate the generated IRF
      const validationResult = intermediateLayoutSchema.safeParse(irfLayout);
      if (!validationResult.success) {
        userLogger.log("[storyblok-to-irf.service.ts] transformStoryblokToIRF: [validationResult]", {
          validationResult,
        });
        _addError("VALIDATION_ERROR", `Invalid IRF generated: ${validationResult.error.message}`);
        throw new Error(`Generated IRF failed validation: ${validationResult.error.message}`);
      }

      const totalComponents = countComponentsRecursively(rootNode);

      const result: StoryblokToIRFResult = {
        success: _errors.length === 0,
        irfLayout: validationResult.data,
        metadata: {
          sourceStory: storyblokStory.name,
          transformedAt: new Date().toISOString(),
          componentCount: 1,
          totalComponents,
          storyblokSlug: storyblokStory.slug,
          warnings: _warnings.length > 0 ? _warnings.map((w) => w.message) : undefined,
        },
        errors: _errors.length > 0 ? _errors.map((e) => e.message) : undefined,
        warnings: _warnings.length > 0 ? _warnings.map((w) => w.message) : undefined,
      };

      // Cache the result
      const cacheKey = generateCacheKey(storyblokStory, options);
      _transformationCache.set(cacheKey, result);

      _log(`Storyblok to IRF transformation completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      _log(`Storyblok to IRF transformation failed: ${error}`);
      throw new Error(`Storyblok to IRF transformation failed: ${error}`);
    }
  };

  // Transform individual Storyblok component to IRF node
  const transformStoryblokComponentToIRF = async (
    component: StoryblokComponent,
    context: TransformationContext
  ): Promise<IntermediateNode> => {
    const registryEntry = _reverseComponentRegistry[component.component];

    if (!registryEntry) {
      _addWarning(
        "UNSUPPORTED_COMPONENT",
        `Unknown Storyblok component: ${component.component}. Using fallback transformation.`,
        component.component,
        "medium"
      );

      // Fallback transformation for unknown components
      return createFallbackNode(component, context);
    }

    try {
      const node = await registryEntry.transform(component, context.globalOptions);

      // Add transformation context
      if (context.path.length > 0) {
        node.parentNodeName = context.path[context.path.length - 1];
      }

      return node;
    } catch (error) {
      _addError("PARSING_ERROR", `Failed to transform component ${component.component}: ${error}`);
      return createFallbackNode(component, context);
    }
  };

  // Utility functions
  const extractTextFromRichText = (richText: any): string => {
    if (!richText) return "";

    if (typeof richText === "string") return richText;

    if (richText.type === "doc" && richText.content) {
      return extractTextFromNodes(richText.content);
    }

    return "";
  };

  const extractTextFromNodes = (nodes: ProseMirrorNode[]): string => {
    return nodes
      .map((node) => {
        if (node.text) return node.text;
        if (node.content) return extractTextFromNodes(node.content);
        return "";
      })
      .join("");
  };

  const createFallbackNode = (component: StoryblokComponent, _context: TransformationContext): IntermediateNode => {
    // Log a warning for missing component
    _addWarning(
      "UNSUPPORTED_COMPONENT",
      `Component '${component.component}' is not registered in the reverse transformation registry. Using fallback transformation. This might cause issues when re-transforming to Storyblok.`,
      component.component,
      "high"
    );

    // Try to determine a better fallback type based on the component name
    let fallbackType: IntermediateNodeType = "group";
    const componentName = component.component?.toLowerCase() || "";

    if (componentName.includes("text")) {
      fallbackType = "text";
    } else if (componentName.includes("headline") || componentName.includes("title")) {
      fallbackType = "headline";
    } else if (componentName.includes("image") || componentName.includes("img")) {
      fallbackType = "image";
    } else if (componentName.includes("divider")) {
      fallbackType = "divider";
    }

    return {
      type: fallbackType,
      name: component.component || "Unknown Component",
      props: {
        ...(component.content && {
          content: extractTextFromRichText(component.content),
        }),
        ...(component.text && { text: component.text }),
        originalComponent: component.component,
        _fallbackData: component, // Preserve original data for debugging
      },
      meta: {
        source: "storyblok",
        storyblokId: component._uid,
        fallback: true,
        originalComponent: component.component,
        warning: `This node was created as a fallback for unregistered component: ${component.component}`,
      },
    };
  };

  const createTransformationContext = (
    _component: StoryblokComponent,
    options?: StoryblokToIRFOptions
  ): TransformationContext => {
    return {
      depth: 0,
      path: [],
      globalOptions: options || {},
    };
  };

  const countComponentsRecursively = (node: IntermediateNode): number => {
    let count = 1;

    // Count children if present
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + countComponentsRecursively(child), 0);
    }

    // Count nodes in slots if present
    if (node.slots) {
      for (const slotNodes of Object.values(node.slots)) {
        count += slotNodes.reduce((sum, child) => sum + countComponentsRecursively(child), 0);
      }
    }

    return count;
  };

  const generateCacheKey = (story: StoryblokStory, options: StoryblokToIRFOptions): string => {
    const storyHash = JSON.stringify(story).slice(0, 100);
    const optionsHash = JSON.stringify(options);
    return `${storyHash}-${optionsHash}`;
  };

  // Error and warning management
  const _addError = (type: TransformationError["type"], message: string, component?: string, path?: string) => {
    _errors.push({ type, message, component, path });
  };

  const _addWarning = (
    type: TransformationWarning["type"],
    message: string,
    component?: string,
    impact?: TransformationWarning["impact"]
  ) => {
    _warnings.push({ type, message, component, impact });
  };

  const _clearErrorsAndWarnings = () => {
    _errors.length = 0;
    _warnings.length = 0;
  };

  const _log = (message: string, data?: any) => {
    logger.user(`[STORYBLOK_TO_IRF_TRANSFORMER] ${message}`, data);
  };

  // Registry management
  const registerReverseComponent = (
    storyblokComponent: string,
    targetIRFType: string,
    transformer: ReverseComponentTransformer,
    confidence: number = 1.0,
    description?: string
  ): void => {
    _reverseComponentRegistry[storyblokComponent] = {
      targetIRFType,
      transform: transformer,
      confidence,
      description,
    };
    _log(`Registered reverse component: ${storyblokComponent} -> ${targetIRFType}`);
  };

  // Cache management
  const clearCache = (): void => {
    _transformationCache.clear();
    _log("Storyblok to IRF transformation cache cleared");
  };

  const getCacheStats = () => {
    return {
      size: _transformationCache.size,
      keys: Array.from(_transformationCache.keys()),
    };
  };

  // Health check
  const isHealthy = async (): Promise<boolean> => {
    try {
      // Test basic functionality with a simple Storyblok story
      const testStory: StoryblokStory = {
        name: "Test Story",
        slug: "test-story",
        content: {
          component: "page",
          _uid: "test-uid",
          body: [
            {
              component: "sb-section",
              _uid: "section-uid",
              name: "Test Section",
              content: [
                {
                  component: "sb-headline-section",
                  _uid: "headline-uid",
                  content: "Test Headline",
                },
              ],
            },
          ],
        },
        is_folder: false,
      };

      const result = await transformStoryblokToIRF(testStory);
      return result.success && result.irfLayout.content.length > 0;
    } catch (error) {
      _log(`Health check failed: ${error}`);
      return false;
    }
  };

  // Initialize the service
  _log("Storyblok to IRF Transformer service initialized with reverse component registry");

  // Public API
  return {
    // Core transformation functions
    transformStoryblokToIRF,
    transformStoryblokComponentToIRF,

    // Registry management
    registerReverseComponent,
    getReverseComponentRegistry: () => ({ ..._reverseComponentRegistry }),

    // Utility functions
    extractTextFromRichText,

    // Cache management
    clearCache,
    getCacheStats,

    // Error handling
    getErrors: () => [..._errors],
    getWarnings: () => [..._warnings],

    // Health check
    isHealthy,
  };
};

// Export the service factory
export { createStoryblokToIRFService };
