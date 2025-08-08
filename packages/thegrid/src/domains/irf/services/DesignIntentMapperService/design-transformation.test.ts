import { describe, it, expect, beforeAll } from "vitest";
import { serviceRegistry } from "../../../../registry/service-registry";
import { createDesignIntentMapperService } from "./design-intent-mapper.service";
import { createStoryblokDesignToIRFService } from "../StoryblokDesignToIRFService/storyblok-design-to-irf.service";
import { DesignIntent } from "./design-intent";
import { StoryblokDesign } from "../StoryblokDesignToIRFService/storyblok-design-to-irf.service";

describe("Design Transformation Services", () => {
  let designIntentMapperService: ReturnType<typeof createDesignIntentMapperService>;
  let storyblokDesignToIRFService: ReturnType<typeof createStoryblokDesignToIRFService>;

  beforeAll(() => {
    // Register services
    serviceRegistry.register("designIntentMapper", createDesignIntentMapperService);
    serviceRegistry.register("storyblokDesignToIRF", createStoryblokDesignToIRFService);

    designIntentMapperService = serviceRegistry.get("designIntentMapper");
    storyblokDesignToIRFService = serviceRegistry.get("storyblokDesignToIRF");
  });

  describe("Storyblok Design to IRF DesignIntent", () => {
    it("should transform empty design object to undefined", () => {
      const emptyDesign = {
        fields: {},
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(emptyDesign);
      expect(result).toBeUndefined();
    });

    it("should transform spacing properties", () => {
      const designWithSpacing: StoryblokDesign = {
        fields: {
          spacing: {
            type: "custom",
            values: {
              s: { pt: "xl", pb: "xl", pl: "m", pr: "m" },
            },
            field_type: "backpack-spacing",
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(designWithSpacing);
      expect(result).toBeDefined();
      expect(result?.layout).toBeDefined();
      expect(result?.layout?.padding).toEqual({
        top: "xl",
        bottom: "xl",
        left: "m",
        right: "m",
      });
    });

    it("should transform gap property", () => {
      const designWithGap = {
        fields: {
          gap: {
            type: "option",
            values: { s: "m" },
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(designWithGap);
      expect(result).toBeDefined();
      expect(result?.layout?.gap).toBe("m");
    });

    it("should transform color properties", () => {
      const designWithColors = {
        fields: {
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
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(designWithColors);
      expect(result).toBeDefined();
      expect(result?.appearance?.backgroundColor).toBe("#f8f9fa");
      expect(result?.appearance?.textColor).toBe("#1a73e8");
      expect(result?.typography?.color).toBe("#1a73e8");
    });

    it("should transform typography properties", () => {
      const designWithTypography = {
        fields: {
          variant: {
            type: "option",
            values: { s: "header1" },
          },
          text_align: {
            type: "custom",
            values: { s: "center" },
            field_type: "backpack-toggle",
          },
          font_weight: {
            type: "custom",
            values: { s: "700" },
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(designWithTypography);
      expect(result).toBeDefined();
      expect(result?.typography?.fontSize).toBe(30); // header1 maps to 30
      expect(result?.typography?.textAlign).toBe("center");
      expect(result?.typography?.fontWeight).toBe(700);
    });

    it("should handle layout direction", () => {
      const designWithDirection = {
        fields: {
          direction: {
            type: "option",
            values: { s: "column" },
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(designWithDirection);
      expect(result?.layout?.direction).toBe("vertical");
    });

    it("should extract design from component", () => {
      const component = {
        _uid: "test-123",
        component: "sb-section",
        design: {
          fields: {
            gap: {
              type: "option",
              values: { s: "l" },
            },
          },
          plugin: "backpack-breakpoints",
          version: "2.5.2",
        },
      };

      const result = storyblokDesignToIRFService.extractFromComponent(component);
      expect(result).toBeDefined();
      expect(result?.layout?.gap).toBe("l");
    });

    it("should handle missing design in component", () => {
      const component = {
        _uid: "test-123",
        component: "sb-section",
      };

      const result = storyblokDesignToIRFService.extractFromComponent(component);
      expect(result).toBeUndefined();
    });
  });

  describe("IRF DesignIntent to Storyblok Design", () => {
    it("should map empty design intent to empty design", () => {
      const emptyIntent: DesignIntent = {};
      const result = designIntentMapperService.map(emptyIntent, "sb-section");

      expect(result).toBeDefined();
      expect(result.fields).toEqual({});
      expect(result.plugin).toBe("backpack-breakpoints");
    });

    it("should map layout padding to spacing", () => {
      const intent: DesignIntent = {
        layout: {
          padding: {
            top: "xl",
            bottom: "xl",
            left: "m",
            right: "m",
          },
        },
      };

      const result = designIntentMapperService.map(intent, "sb-section");
      expect(result.fields?.spacing).toBeDefined();
      expect(result.fields?.spacing?.type).toBe("custom");
      expect(result.fields?.spacing?.field_type).toBe("backpack-spacing");
      expect(result.fields?.spacing?.values?.s).toEqual({
        pt: "xl",
        pb: "xl",
        pl: "m",
        pr: "m",
      });
    });

    it("should map gap property", () => {
      const intent: DesignIntent = {
        layout: {
          gap: "l",
        },
      };

      const result = designIntentMapperService.map(intent, "sb-section");
      expect(result.fields?.gap).toBeDefined();
      expect(result.fields?.gap?.type).toBe("option");
      expect(result.fields?.gap?.values?.s).toBe("l");
    });

    it("should map color properties", () => {
      const intent: DesignIntent = {
        appearance: {
          backgroundColor: "#f8f9fa",
        },
        typography: {
          color: "#1a73e8",
        },
      };

      const result = designIntentMapperService.map(intent, "sb-section");
      expect(result.fields?.background_color).toBeDefined();
      expect(result.fields?.background_color?.type).toBe("custom");
      expect(result.fields?.background_color?.field_type).toBe("backpack-color-picker");
      expect(result.fields?.background_color?.values?.s?.selected?.value).toBe("#f8f9fa");

      expect(result.fields?.text_color).toBeDefined();
      expect(result.fields?.text_color?.values?.s?.selected?.value).toBe("#1a73e8");
    });

    it("should map typography properties", () => {
      const intent: DesignIntent = {
        typography: {
          fontSize: 30,
          textAlign: "center",
        },
      };

      const result = designIntentMapperService.map(intent, "sb-headline");
      expect(result.fields?.variant).toBeDefined();
      expect(result.fields?.variant?.type).toBe("option");
      expect(result.fields?.variant?.values?.s).toBe("header1"); // 30 maps to header1

      expect(result.fields?.text_align).toBeDefined();
      expect(result.fields?.text_align?.values?.s).toBe("center");
    });

    it("should handle numeric spacing values", () => {
      const intent: DesignIntent = {
        layout: {
          padding: {
            top: 48,
            bottom: 48,
            left: 24,
            right: 24,
          },
          gap: 16,
        },
      };

      const result = designIntentMapperService.map(intent, "sb-section");
      expect(result.fields?.spacing?.values?.s).toEqual({
        pt: "xl", // 48 maps to xl
        pb: "xl",
        pl: "m", // 24 maps to m
        pr: "m",
      });
      expect(result.fields?.gap?.values?.s).toBe("s"); // 16 maps to s
    });
  });

  describe("Round-trip Design Transformation", () => {
    it("should preserve design through Storyblok → IRF → Storyblok transformation", () => {
      const originalDesign = {
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
      };

      // Transform to IRF
      const irfDesign = storyblokDesignToIRFService.transform(originalDesign);
      expect(irfDesign).toBeDefined();

      // Transform back to Storyblok
      const storyblokDesign = designIntentMapperService.map(irfDesign!, "sb-section");

      // Check that key properties are preserved
      expect(storyblokDesign.fields?.spacing).toBeDefined();
      expect(storyblokDesign.fields?.spacing?.values?.s).toEqual({
        pt: "xl",
        pb: "xl",
        pl: "m",
        pr: "m",
      });
      expect(storyblokDesign.fields?.gap?.values?.s).toBe("m");
      expect(storyblokDesign.fields?.text_color?.values?.s?.selected?.value).toBe("#1a73e8");
    });

    it("should handle typography round-trip", () => {
      const originalDesign = {
        fields: {
          variant: {
            type: "option",
            values: { s: "header2" },
          },
          text_align: {
            type: "custom",
            field_type: "backpack-toggle",
            values: { s: "right" },
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      // Transform to IRF
      const irfDesign = storyblokDesignToIRFService.transform(originalDesign);
      expect(irfDesign?.typography?.fontSize).toBe(24); // header2 maps to 24
      expect(irfDesign?.typography?.textAlign).toBe("right");

      // Transform back to Storyblok
      const storyblokDesign = designIntentMapperService.map(irfDesign!, "sb-headline");
      expect(storyblokDesign?.fields?.variant?.values?.s).toBe("header2");
      expect(storyblokDesign?.fields?.text_align?.values?.s).toBe("right");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined values gracefully", () => {
      const result1 = storyblokDesignToIRFService.transform(null as any);
      expect(result1).toBeUndefined();

      const result2 = storyblokDesignToIRFService.transform(undefined as any);
      expect(result2).toBeUndefined();

      const result3 = storyblokDesignToIRFService.transform({
        fields: null,
      } as any);
      expect(result3).toBeUndefined();
    });

    it("should handle invalid font weight values", () => {
      const design = {
        fields: {
          font_weight: {
            type: "custom",
            values: { s: "invalid" },
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(design);
      expect(result?.typography?.fontWeight).toBe(400); // Should default to 400
    });

    it("should handle unknown variant values", () => {
      const design = {
        fields: {
          variant: {
            type: "option",
            values: { s: "unknown-variant" },
          },
        },
        plugin: "backpack-breakpoints",
        version: "2.5.2",
      };

      const result = storyblokDesignToIRFService.transform(design);
      expect(result?.typography?.fontSize).toBeUndefined();
    });
  });
});
