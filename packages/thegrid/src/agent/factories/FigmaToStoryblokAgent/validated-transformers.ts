import { logger } from "@/utils/logger";
/**
 * Validated Transformers Registry
 *
 * This file contains validated transformers that use Zod schemas to ensure
 * type safety and proper Storyblok component structure.
 */

import { IntermediateNode } from "../../../domains/irf/schema.types";
import { IRFToStoryblokOptions } from "../../../domains/irf/services/IRFToStoryblokService/irf-to-storyblok.service.types";
import {
  PageSchema,
  SectionSchema,
  BlockquoteSectionSchema,
  TextSectionSchema,
  HeadlineSectionSchema,
  HeroSectionSchema,
  EditorialCardSchema,
  ButtonSchema,
  createValidatedTransformer,
} from "./storyblok-schemas";

// Generate UID function (you might want to import this from the service)
const generateUID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to convert text to Storyblok richtext format
const convertToRichtext = (text: string) => {
  if (!text) return undefined;
  return {
    type: "doc" as const,
    content: [
      {
        type: "paragraph",
        content: [
          {
            text,
            type: "text" as const,
          },
        ],
      },
    ],
  };
};

// Helper to convert IRF design tokens to Storyblok values
const resolveDesignValue = (tokenRef: string | any, globalVars?: any, fallback?: any) => {
  if (typeof tokenRef !== "string") return tokenRef || fallback;

  const resolved = globalVars?.styles?.[tokenRef];
  return resolved !== undefined ? resolved : fallback;
};

// Helper to create Backpack design object
const createBackpackDesign = (designProps: any = {}, globalVars?: any) => {
  const fields: any = {};

  // Map common design properties to Backpack fields
  if (designProps.spacing) {
    fields.spacing = {
      type: "custom",
      values: resolveDesignValue(designProps.spacing, globalVars, {}),
      field_type: "backpack-spacing",
    };
  }

  if (designProps.position) {
    fields.position = {
      type: "custom",
      values: resolveDesignValue(designProps.position, globalVars, {}),
      field_type: "backpack-layout",
    };
  }

  if (designProps.textColor) {
    fields.text_color = {
      type: "custom",
      values: resolveDesignValue(designProps.textColor, globalVars, {}),
      field_type: "backpack-color-picker",
    };
  }

  if (designProps.visibility) {
    fields.visibility = {
      type: "custom",
      values: resolveDesignValue(designProps.visibility, globalVars, {}),
      field_type: "backpack-toggle",
    };
  }

  if (designProps.variant) {
    fields.variant = {
      type: "option",
      values: {
        s: resolveDesignValue(designProps.variant, globalVars, "body"),
      },
    };
  }

  if (designProps.textAlign) {
    fields.text_align = {
      type: "custom",
      values: {
        s: resolveDesignValue(designProps.textAlign, globalVars, "start"),
      },
      field_type: "backpack-toggle",
    };
  }

  // Add order field for all components
  fields.order = {
    type: "number",
    values: {},
  };

  // Add transitions field
  fields.transitionsOnEnter = {
    type: "boolean",
    values: {},
  };

  return {
    fields,
    plugin: "backpack-breakpoints",
    version: "2.5.2",
  };
};

//
// VALIDATED TRANSFORMERS
//

// Page Transformer (root level)
export const pageTransformer = createValidatedTransformer(
  PageSchema,
  (node: IntermediateNode, _options?: IRFToStoryblokOptions) => {
    const props = node.props || {};

    return {
      component: "page" as const,
      _uid: generateUID(),
      body: (node.children || []).map(
        (child) =>
          // Recursively transform children - this would be handled by the service
          child
      ),
      no_index: Boolean(props.noIndex),
      canonical: props.canonical
        ? {
            id: props.canonical.id || "",
            url: props.canonical.url || "",
            linktype: props.canonical.linktype || "story",
            fieldtype: "multilink",
            cached_url: props.canonical.cached_url || "",
          }
        : {
            id: "",
            url: "",
            linktype: "story",
            fieldtype: "multilink",
            cached_url: "",
          },
      no_follow: Boolean(props.noFollow),
      seo_meta_fields: props.seoMetaFields || "",
      structured_data: props.structuredData || "",
      background_color: props.backgroundColor
        ? {
            _uid: generateUID(),
            title: "Standalone Backpack Color Picker",
            plugin: "backpack-color-picker",
            selected: {
              name: props.backgroundColor.name || "",
              value: props.backgroundColor.value || "",
            },
            description: "Standalone Backpack Color Picker",
          }
        : undefined,
    };
  }
);

// Section Transformer
export const sectionTransformer = createValidatedTransformer(
  SectionSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    return {
      component: "sb-section" as const,
      _uid: generateUID(),
      name: props.name || "",
      design: createBackpackDesign(design, globalVars),
      content: (node.children || []).map(
        (child) =>
          // Recursively transform children - this would be handled by the service
          child
      ),
      backpack_ai: props.backpackAi || "",
      custom_classname: props.customClassname || "",
    };
  }
);

// Blockquote Section Transformer
export const blockquoteSectionTransformer = createValidatedTransformer(
  BlockquoteSectionSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    return {
      component: "sb-blockquote-section" as const,
      _uid: generateUID(),
      design: createBackpackDesign(design, globalVars),
      content: convertToRichtext(props.content || props.quote || props.text || node.name),
      citation: convertToRichtext(props.citation || props.author),
      custom_classname: props.customClassname || "",
    };
  }
);

// Text Section Transformer
export const textSectionTransformer = createValidatedTransformer(
  TextSectionSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    return {
      component: "sb-text-section" as const,
      _uid: generateUID(),
      design: createBackpackDesign(design, globalVars),
      content: convertToRichtext(props.content || props.text || node.name),
      custom_classname: props.customClassname || "",
    };
  }
);

// Headline Section Transformer
export const headlineSectionTransformer = createValidatedTransformer(
  HeadlineSectionSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    return {
      component: "sb-headline-section" as const,
      _uid: generateUID(),
      design: createBackpackDesign(design, globalVars),
      content: convertToRichtext(props.content || props.title || props.headline || node.name),
      custom_classname: props.customClassname || "",
    };
  }
);

// Hero Section Transformer
export const heroSectionTransformer = createValidatedTransformer(
  HeroSectionSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    // Resolve design tokens
    const backgroundImage = resolveDesignValue(design.fills, globalVars);
    const alignment = resolveDesignValue(design.alignment, globalVars, "center");

    return {
      component: "sb-hero-section" as const,
      _uid: generateUID(),
      title: props.title || props.text || node.name || undefined,
      subtitle: props.subtitle || undefined,
      description: props.description ? convertToRichtext(props.description) : undefined,
      background_image:
        backgroundImage && typeof backgroundImage === "object" && backgroundImage.filename
          ? {
              filename: backgroundImage.filename,
              alt: props.title || "",
              fieldtype: "asset" as const,
            }
          : undefined,
      cta_button: props.ctaLink
        ? {
            url: props.ctaLink,
            linktype: "url" as const,
            fieldtype: "link" as const,
          }
        : undefined,
      cta_text: props.ctaText || undefined,
      alignment: (["left", "center", "right"].includes(alignment) ? alignment : "center") as
        | "left"
        | "center"
        | "right",
      show_cta: Boolean(props.showCta || props.ctaText),
    };
  }
);

// Editorial Card Transformer
export const editorialCardTransformer = createValidatedTransformer(
  EditorialCardSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    // Resolve design tokens
    const imageData = resolveDesignValue(design.fills, globalVars);
    const aspectRatio = resolveDesignValue(design.aspectRatio, globalVars, "16:9");

    return {
      component: "sb-editorial-card-section" as const,
      _uid: generateUID(),
      title: props.title || props.Title || node.name || undefined,
      paragraph: props.paragraph || props.Paragraph ? convertToRichtext(props.paragraph || props.Paragraph) : undefined,
      image:
        imageData && typeof imageData === "object" && imageData.filename
          ? {
              filename: imageData.filename,
              alt: props.title || props.Title || "",
              fieldtype: "asset" as const,
            }
          : undefined,
      link:
        props.link || props.showLink
          ? {
              url: props.linkUrl || "#",
              linktype: "url" as const,
              fieldtype: "link" as const,
            }
          : undefined,
      show_link: Boolean(props.showLink || props["Show link"]),
      aspect_ratio: (["1:1", "16:9", "4:3", "3:2"].includes(aspectRatio) ? aspectRatio : "16:9") as
        | "1:1"
        | "16:9"
        | "4:3"
        | "3:2",
      eyebrow: props.eyebrow || props.Eyebrow || undefined,
      show_eyebrow: Boolean(props.showEyebrow || props["Show eyebrow"]),
    };
  }
);

// Button Transformer
export const buttonTransformer = createValidatedTransformer(
  ButtonSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const props = node.props || {};
    const design = node.design || {};
    const globalVars = options?.globalVars;

    // Resolve design tokens
    const variant = resolveDesignValue(design.variant, globalVars, "primary");
    const size = resolveDesignValue(design.size, globalVars, "medium");

    return {
      component: "sb-button" as const,
      _uid: generateUID(),
      label: props.label || props.Label || props.text || node.name || undefined,
      link:
        props.link || props.href
          ? {
              url: props.link || props.href,
              linktype: "url" as const,
              fieldtype: "link" as const,
            }
          : undefined,
      variant: (["primary", "secondary", "outline", "ghost"].includes(variant) ? variant : "primary") as
        | "primary"
        | "secondary"
        | "outline"
        | "ghost",
      size: (["small", "medium", "large"].includes(size) ? size : "medium") as "small" | "medium" | "large",
      icon: props.icon || undefined,
      icon_position: (["left", "right"].includes(props.iconPosition) ? props.iconPosition : "right") as
        | "left"
        | "right",
      full_width: Boolean(props.fullWidth),
    };
  }
);

//
// TRANSFORMER REGISTRY
//

export const validatedTransformers = {
  page: {
    storyblokComponent: "page",
    transformer: pageTransformer,
    schema: PageSchema,
  },
  section: {
    storyblokComponent: "sb-section",
    transformer: sectionTransformer,
    schema: SectionSchema,
  },
  blockquote: {
    storyblokComponent: "sb-blockquote-section",
    transformer: blockquoteSectionTransformer,
    schema: BlockquoteSectionSchema,
  },
  text: {
    storyblokComponent: "sb-text-section",
    transformer: textSectionTransformer,
    schema: TextSectionSchema,
  },
  headline: {
    storyblokComponent: "sb-headline-section",
    transformer: headlineSectionTransformer,
    schema: HeadlineSectionSchema,
  },
  "hero-section": {
    storyblokComponent: "sb-hero-section",
    transformer: heroSectionTransformer,
    schema: HeroSectionSchema,
  },
  "editorial-card": {
    storyblokComponent: "sb-editorial-card-section",
    transformer: editorialCardTransformer,
    schema: EditorialCardSchema,
  },
  button: {
    storyblokComponent: "sb-button",
    transformer: buttonTransformer,
    schema: ButtonSchema,
  },
} as const;

// Helper to register all validated transformers with the service
export const registerValidatedTransformers = (service: any) => {
  Object.entries(validatedTransformers).forEach(([irfType, config]) => {
    service.registerComponent(irfType, config.storyblokComponent, config.transformer);
    logger.info(`✅ Registered validated transformer: ${irfType} → ${config.storyblokComponent}`);
  });
};

// Export types for TypeScript support
export type ValidatedTransformerType = keyof typeof validatedTransformers;

// Utility to test a transformer with sample data
export const testTransformer = (
  transformerType: ValidatedTransformerType,
  sampleNode: IntermediateNode,
  options?: IRFToStoryblokOptions
) => {
  const config = validatedTransformers[transformerType];
  if (!config) {
    throw new Error(`No transformer found for type: ${transformerType}`);
  }

  logger.info(`🧪 Testing transformer: ${transformerType}`);
  logger.info("Input node:", JSON.stringify(sampleNode, null, 2));

  try {
    const result = config.transformer(sampleNode, options);
    logger.info("✅ Transformation successful:");
    logger.info(JSON.stringify(result, null, 2));

    // Validate against schema
    const validation = config.schema.safeParse(result);
    if (validation.success) {
      logger.info("✅ Schema validation passed");
    } else {
      logger.info("❌ Schema validation failed:", validation.error.errors);
    }

    return result;
  } catch (error) {
    logger.info("❌ Transformation failed:", error);
    throw error;
  }
};
