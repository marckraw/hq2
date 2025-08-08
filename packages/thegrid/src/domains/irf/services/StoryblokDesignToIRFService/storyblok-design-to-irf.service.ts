import { DesignIntent } from "../DesignIntentMapperService/design-intent";

/**
 * Storyblok Design to IRF Service
 *
 * This service handles the transformation of Storyblok design format
 * into IRF DesignIntent format. It's the reverse of the designIntentMapperService.
 */

// Types for Storyblok design format
export interface StoryblokDesignField {
  type: "option" | "custom";
  values: {
    s?: any; // Small breakpoint
    m?: any; // Medium breakpoint
    l?: any; // Large breakpoint
  };
  field_type?: string;
}

export interface StoryblokDesign {
  fields: Record<string, StoryblokDesignField>;
  plugin: string;
  version: string;
}

export interface StoryblokColorValue {
  selected: {
    id: number;
    name: string;
    value: string;
    dimension_value: null | string;
  };
}

export interface StoryblokSpacingValue {
  pt?: string; // padding-top
  pb?: string; // padding-bottom
  pl?: string; // padding-left
  pr?: string; // padding-right
}

export const createStoryblokDesignToIRFService = () => {
  /**
   * Transforms a Storyblok design object to IRF DesignIntent format.
   * This is the reverse transformation of designIntentMapperService.
   *
   * @param storyblokDesign The Storyblok design object with fields, plugin, and version
   * @returns IRF DesignIntent object or undefined if no design properties exist
   */
  const transform = (storyblokDesign: any): DesignIntent | undefined => {
    if (!storyblokDesign || !storyblokDesign.fields) {
      return undefined;
    }

    const design: Partial<DesignIntent> = {};
    const fields = storyblokDesign.fields;

    // Transform layout properties
    if (fields.spacing || fields.gap || fields.layout || fields.direction) {
      design.layout = {};

      // Handle spacing (padding)
      if (fields.spacing?.values?.s) {
        const spacing = fields.spacing.values.s as StoryblokSpacingValue;
        design.layout.padding = {};
        if (spacing.pt) design.layout.padding.top = spacing.pt;
        if (spacing.pb) design.layout.padding.bottom = spacing.pb;
        if (spacing.pl) design.layout.padding.left = spacing.pl;
        if (spacing.pr) design.layout.padding.right = spacing.pr;
      }

      // Handle gap
      if (fields.gap?.values?.s) {
        design.layout.gap = fields.gap.values.s;
      }

      // Handle layout direction
      if (fields.layout?.values?.s?.direction) {
        design.layout.direction =
          fields.layout.values.s.direction === "column"
            ? "vertical"
            : "horizontal";
      }

      // Handle direction field directly
      if (fields.direction?.values?.s) {
        design.layout.direction =
          fields.direction.values.s === "column" ? "vertical" : "horizontal";
      }
    }

    // Transform appearance properties
    if (
      fields.background_color ||
      fields.text_color ||
      fields.border_radius ||
      fields.border_color
    ) {
      design.appearance = {};

      // Handle background color
      if (fields.background_color?.values?.s?.selected?.value) {
        design.appearance.backgroundColor =
          fields.background_color.values.s.selected.value;
      }

      // Handle text color (for appearance)
      if (fields.text_color?.values?.s?.selected?.value) {
        design.appearance.textColor = fields.text_color.values.s.selected.value;
      }

      // Handle border radius
      if (fields.border_radius?.values?.s) {
        design.appearance.borderRadius = fields.border_radius.values.s;
      }

      // Handle border color
      if (fields.border_color?.values?.s?.selected?.value) {
        design.appearance.borderColor =
          fields.border_color.values.s.selected.value;
      }
    }

    // Transform typography properties
    if (
      fields.variant ||
      fields.text_align ||
      fields.text_color ||
      fields.font_weight
    ) {
      design.typography = {};

      // Handle text variant (maps to fontSize)
      if (fields.variant?.values?.s) {
        // Map variant to approximate font size
        const variantToFontSize: Record<string, number> = {
          display1: 48,
          display2: 36,
          header1: 30,
          header2: 24,
          header3: 20,
          header4: 18,
          header5: 16,
          body: 14,
          small: 12,
        };
        const fontSize = variantToFontSize[fields.variant.values.s];
        if (fontSize) {
          design.typography.fontSize = fontSize;
        }
      }

      // Handle text align
      if (fields.text_align?.values?.s) {
        design.typography.textAlign = fields.text_align.values.s;
      }

      // Handle text color (also in typography for specificity)
      if (fields.text_color?.values?.s?.selected?.value) {
        design.typography.color = fields.text_color.values.s.selected.value;
      }

      // Handle font weight
      if (fields.font_weight?.values?.s) {
        design.typography.fontWeight =
          parseInt(fields.font_weight.values.s) || 400;
      }
    }

    // Only return design if it has content
    return design.layout || design.appearance || design.typography
      ? (design as DesignIntent)
      : undefined;
  };

  /**
   * Extracts design intent from a Storyblok component.
   * This is a convenience method that checks if the component has a design field.
   *
   * @param component The Storyblok component
   * @returns IRF DesignIntent object or undefined
   */
  const extractFromComponent = (component: any): DesignIntent | undefined => {
    if (component.design && typeof component.design === "object") {
      return transform(component.design);
    }
    return undefined;
  };

  return {
    transform,
    extractFromComponent,
  };
};

export const storyblokDesignToIRFService = createStoryblokDesignToIRFService();
