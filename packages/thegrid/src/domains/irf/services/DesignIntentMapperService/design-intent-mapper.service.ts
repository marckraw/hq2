import { logger } from "@/utils/logger";
import { z } from "@hono/zod-openapi";
import { designSchemas } from "../IRFToStoryblokService/sb-schemas-registry/design.schema";
import { textVariantEnum } from "../IRFToStoryblokService/sb-schemas-registry/field-schemas";
import { SitebuilderDesign } from "../IRFToStoryblokService/sb-schemas-registry/site-builder-field-schema";
import { DesignIntent } from "./design-intent";

// --- Tokenization Helpers ---

/**
 * A simple map to convert pixel values or common keywords to spacing tokens.
 * This should be expanded based on the project's design system.
 */
const SPACING_MAP: Record<string, string> = {
  "4": "xxs",
  "8": "xs",
  "16": "s",
  "24": "m",
  "32": "l",
  "48": "xl",
  "64": "xxl",
};

const GAP_MAP: Record<string, string> = {
  "0": "none",
  "4": "xxs",
  "8": "xs",
  "16": "s",
  "24": "m",
  "32": "l",
  "48": "xl",
};

const toSpacingToken = (value: string | number | undefined) => {
  if (typeof value === "undefined") return undefined;
  const stringValue = String(value);

  // Check if it's already a valid token
  const validTokens = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];
  if (validTokens.includes(stringValue)) {
    return stringValue;
  }

  // Otherwise, try to convert from numeric value
  const key = stringValue.replace(/px$/, "");
  return SPACING_MAP[key];
};

const toGapToken = (value: string | number | undefined) => {
  if (typeof value === "undefined") return undefined;
  const stringValue = String(value);

  // Check if it's already a valid token
  const validTokens = ["none", "xxs", "xs", "s", "m", "l", "xl"];
  if (validTokens.includes(stringValue)) {
    return stringValue;
  }

  // Otherwise, try to convert from numeric value
  const key = stringValue.replace(/px$/, "");
  return GAP_MAP[key];
};

/**
 * Maps a font size (number) to a Storyblok text variant token.
 * This codifies the typographic scale.
 */
const mapFontSizeToVariant = (fontSize: number | undefined): z.infer<typeof textVariantEnum> | undefined => {
  if (!fontSize) return undefined;
  if (fontSize >= 48) return "display1";
  if (fontSize >= 36) return "display2";
  if (fontSize >= 30) return "header1";
  if (fontSize >= 24) return "header2";
  if (fontSize >= 20) return "header3";
  if (fontSize >= 18) return "header4";
  if (fontSize >= 16) return "header5";
  return "body";
};

// TODO: Implement color mapping with a known palette.
// This will require a list of available colors from Storyblok and a color-matching library.
const mapColorToStoryblokColor = (color: string | undefined) => {
  if (!color) return undefined;
  // Placeholder logic: This needs to be replaced with a real color mapping utility
  // that finds the closest color from a predefined Storyblok palette.
  logger.warn(`Color mapping not implemented. Returning placeholder for color: ${color}`);
  return {
    selected: {
      id: 1,
      name: `Placeholder for ${color}`,
      value: color,
      dimension_value: null,
    },
  };
};

// --- Mapper Service ---

export const createDesignIntentMapperService = () => {
  /**
   * Maps a DesignIntent object to a valid Storyblok design object.
   * @param intent The DesignIntent from the IRF.
   * @param componentType The Storyblok component name (e.g., "sb-headline").
   * @returns A Storyblok design object.
   */
  const map = (intent: DesignIntent, componentType: string): Partial<SitebuilderDesign> => {
    // Get the specific design schema for the target component
    // TODO: fix this
    // @ts-ignore
    const componentDesignSchema = designSchemas[componentType];
    if (!componentDesignSchema) {
      logger.warn(`No design schema found for component: ${componentType}`);
      return {};
    }
    const { layout, appearance, typography } = intent;
    const mappedFields: Record<string, any> = {};

    // --- Map Typography ---
    if (typography) {
      const fontSize = typeof typography.fontSize === "number" ? typography.fontSize : undefined;
      const variant = mapFontSizeToVariant(fontSize);
      if (variant) {
        mappedFields.variant = {
          type: "option",
          values: { s: variant },
        };
      }
      if (typography.textAlign) {
        mappedFields.text_align = {
          type: "custom",
          field_type: "backpack-toggle",
          values: { s: typography.textAlign },
        };
      }
      if (typography.color) {
        mappedFields.text_color = {
          type: "custom",
          field_type: "backpack-color-picker",
          values: { s: mapColorToStoryblokColor(typography.color) },
        };
      }
    }

    // --- Map Layout & Spacing ---
    if (layout) {
      if (layout.padding) {
        mappedFields.spacing = {
          type: "custom",
          field_type: "backpack-spacing",
          values: {
            s: {
              pt: toSpacingToken(layout.padding.top),
              pb: toSpacingToken(layout.padding.bottom),
              pl: toSpacingToken(layout.padding.left),
              pr: toSpacingToken(layout.padding.right),
            },
          },
        };
      }
      if (layout.gap) {
        const gapToken = toGapToken(layout.gap);
        if (gapToken) {
          mappedFields.gap = {
            type: "option",
            values: {
              s: gapToken,
            },
          };
        }
      }
    }

    // --- Map Appearance ---
    if (appearance?.backgroundColor) {
      mappedFields.background_color = {
        type: "custom",
        field_type: "backpack-color-picker",
        // TODO: we should have a proper type guard here or zod validation
        // we can't assume backgroundColor is a string becasue sometimes it has image ref
        // when the background color is filled with an image
        values: {
          s: mapColorToStoryblokColor(appearance.backgroundColor as string),
        },
      };
    }

    const finalDesignObject = {
      fields: mappedFields,
      plugin: "backpack-breakpoints",
      // version: "2.5.2",
    };

    // Validate the generated fields against the component's schema
    const validation = componentDesignSchema.safeParse(finalDesignObject);
    if (!validation.success) {
      logger.error(`Validation failed for mapped design of ${componentType}:`, validation.error.issues);
    }

    return finalDesignObject;
  };

  return {
    map,
  };
};

export const designIntentMapperService = createDesignIntentMapperService();
