import { logger } from "@/utils/logger";
/**
 * Storyblok Schema Generator
 *
 * Utility to help generate Zod schemas from exported Storyblok JSON components.
 * This makes it easy to create validated transformers based on real Storyblok data.
 */

import { z } from "@hono/zod-openapi";

// Helper to analyze a Storyblok component and suggest a Zod schema
export const analyzeStoryblokComponent = (component: any) => {
  const analysis = {
    componentName: component.component,
    fields: {} as Record<
      string,
      { type: string; required: boolean; values?: any[] }
    >,
    suggestedSchema: "",
  };

  // Analyze each field
  Object.entries(component).forEach(([key, value]) => {
    if (key === "component" || key === "_uid") return;

    const fieldAnalysis = analyzeField(key, value);
    analysis.fields[key] = fieldAnalysis;
  });

  // Generate suggested schema code
  analysis.suggestedSchema = generateSchemaCode(
    analysis.componentName,
    analysis.fields
  );

  return analysis;
};

// Analyze individual field types
const analyzeField = (
  _key: string,
  value: any
): { type: string; required: boolean; values?: any[] } => {
  const required = value !== null && value !== undefined && value !== "";

  if (typeof value === "string") {
    // Check if it looks like an enum
    if (
      [
        "left",
        "center",
        "right",
        "primary",
        "secondary",
        "small",
        "medium",
        "large",
      ].includes(value)
    ) {
      return { type: "enum", required, values: [value] };
    }
    return { type: "string", required };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", required };
  }

  if (typeof value === "number") {
    return { type: "number", required };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: "array", required };
    }

    // Check if it's a rich text array
    if (value[0] && typeof value[0] === "object" && value[0].type) {
      return { type: "richtext", required };
    }

    // Check if it's a bloks array
    if (value[0] && typeof value[0] === "object" && value[0].component) {
      return { type: "bloks", required };
    }

    return { type: "array", required };
  }

  if (typeof value === "object" && value !== null) {
    // Check if it's an asset
    if (value.filename || value.fieldtype === "asset") {
      return { type: "asset", required };
    }

    // Check if it's a link
    if (value.linktype || value.fieldtype === "link") {
      return { type: "link", required };
    }

    return { type: "object", required };
  }

  return { type: "unknown", required };
};

// Generate Zod schema code
const generateSchemaCode = (
  componentName: string,
  fields: Record<string, any>
): string => {
  const schemaName = toPascalCase(componentName.replace("sb-", "")) + "Schema";
  const typeName = toPascalCase(componentName.replace("sb-", "")) + "Component";

  let schemaCode = `export const ${schemaName} = StoryblokBaseComponentSchema.extend({\n`;
  schemaCode += `  component: z.literal("${componentName}"),\n`;

  Object.entries(fields).forEach(([fieldName, fieldInfo]) => {
    const zodType = getZodType(fieldInfo);
    schemaCode += `  ${fieldName}: ${zodType},\n`;
  });

  schemaCode += `});\n\n`;
  schemaCode += `export type ${typeName} = z.infer<typeof ${schemaName}>;\n`;

  return schemaCode;
};

// Convert field analysis to Zod type string
const getZodType = (fieldInfo: {
  type: string;
  required: boolean;
  values?: any[];
}): string => {
  const { type, values } = fieldInfo;
  let zodType = "";

  switch (type) {
    case "string":
      zodType = "StoryblokFieldSchemas.text";
      break;
    case "boolean":
      zodType = "StoryblokFieldSchemas.boolean";
      break;
    case "number":
      zodType = "StoryblokFieldSchemas.number";
      break;
    case "richtext":
      zodType = "StoryblokFieldSchemas.richtext";
      break;
    case "asset":
      zodType = "StoryblokFieldSchemas.asset";
      break;
    case "link":
      zodType = "StoryblokFieldSchemas.link";
      break;
    case "bloks":
      zodType = "StoryblokFieldSchemas.bloks";
      break;
    case "array":
      zodType = "z.array(z.any()).optional()";
      break;
    case "enum":
      if (values && values.length > 0) {
        const enumValues = values.map((v) => `"${v}"`).join(", ");
        zodType = `z.enum([${enumValues}]).optional()`;
      } else {
        zodType = "StoryblokFieldSchemas.option";
      }
      break;
    case "object":
      zodType = "z.record(z.any()).optional()";
      break;
    default:
      zodType = "z.any().optional()";
  }

  return zodType;
};

// Utility to convert string to PascalCase
const toPascalCase = (str: string): string => {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

// Main function to process exported Storyblok JSON
export const generateSchemaFromStoryblokExport = (storyblokJson: any) => {
  logger.info("🔍 Analyzing Storyblok component...");

  const analysis = analyzeStoryblokComponent(storyblokJson);

  logger.info("\n📊 Component Analysis:");
  logger.info(`Component: ${analysis.componentName}`);
  logger.info("\nFields:");
  Object.entries(analysis.fields).forEach(([field, info]) => {
    logger.info(
      `  ${field}: ${info.type} (${info.required ? "required" : "optional"})`
    );
  });

  logger.info("\n📝 Suggested Zod Schema:");
  logger.info(analysis.suggestedSchema);

  return analysis;
};

// Helper to create a validated transformer from the schema
export const createTransformerFromSchema = (
  irfType: string,
  storyblokComponent: string,
  schema: z.ZodType,
  transformerFn: (node: any, options?: any) => any
) => {
  return {
    irfType,
    storyblokComponent,
    schema,
    transformer: (node: any, options?: any) => {
      const result = transformerFn(node, options);

      // Validate the result
      const validation = schema.safeParse(result);
      if (!validation.success) {
        logger.warn(
          `❌ Transformer validation failed for ${storyblokComponent}:`,
          validation.error.errors
        );
        // You might want to throw here in strict mode
      } else {
        logger.info(
          `✅ Transformer validation passed for ${storyblokComponent}`
        );
      }

      return result;
    },
  };
};

// Example usage function
export const exampleUsage = () => {
  logger.info(`
📖 How to use the Schema Generator:

1. Export a component from Storyblok as JSON
2. Use the generator to analyze it:

   import { generateSchemaFromStoryblokExport } from './schema-generator';
   
   const storyblokJson = {
     "component": "sb-hero-section",
     "_uid": "12345",
     "title": "Welcome to our site",
     "subtitle": "Amazing subtitle",
     "show_cta": true,
     "alignment": "center"
   };
   
   const analysis = generateSchemaFromStoryblokExport(storyblokJson);

3. Copy the generated schema to storyblok-schemas.ts
4. Create a validated transformer:

   import { createValidatedTransformer } from './storyblok-schemas';
   
   const heroTransformer = createValidatedTransformer(
     HeroSectionSchema,
     (node, options) => ({
       component: "sb-hero-section",
       _uid: generateUID(),
       title: node.props?.title,
       subtitle: node.props?.subtitle,
       show_cta: node.props?.showCta || false,
       alignment: node.props?.alignment || "center"
     })
   );

5. Register it with the service:

   irfToStoryblokService.registerComponent(
     "hero-section",
     "sb-hero-section", 
     heroTransformer
   );
  `);
};

// Export types for TypeScript support
export interface ComponentAnalysis {
  componentName: string;
  fields: Record<string, { type: string; required: boolean; values?: any[] }>;
  suggestedSchema: string;
}

export interface ValidatedTransformerConfig {
  irfType: string;
  storyblokComponent: string;
  schema: z.ZodType;
  transformer: (node: any, options?: any) => any;
}
