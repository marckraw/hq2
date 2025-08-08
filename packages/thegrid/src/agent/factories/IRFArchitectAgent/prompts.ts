/**
 *
 * This is the Master prompt file for the IRF Architect Agent.
 *
 * It defines all the rules, schemas, and mappings for the IRF Architect Agent.
 * It is the core IRF Architect Agent understanding of our IRF schema, and how it works.
 *
 * In future TODO: it has to be tested, validated, and improved using evals and other testing methods and services.
 *
 */

/**
 * Core IRF schema, that defines the structure of the IRF and its nodes and nesting capabilities.
 * It is used to validate the IRF, and to generate the IRF for a page layout.
 */
import {
  aiInsightsSchema,
  intermediateLayoutSchema,
  intermediateNodeBaseSchema,
  intermediateNodeSchema,
} from "../../../domains/irf/schema";

/**
 * Nodes registry, that defines the available component types and their properties.
 * Core for the IRF Architect Agent to understand what can be nested where, and how.
 */
import { nodesRegistrySchema } from "../../../domains/irf/nodes-registry.schema";

/**
 * Design intent schema, that defines the design intent for a node.
 * It is used to describe the visual styling of a component.
 * It defined what kind of design intent the user has, and how it should be translated into the IRF.
 */
import { zodToJsonSchema } from "zod-to-json-schema";
import { designIntentSchema } from "../../../domains/irf/services/DesignIntentMapperService/design-intent";

/**
 * We are using zodToJsonSchema functions to converst zod schemas to json schemas
 * that are easier to understand by LLMs.
 *
 * By doing so, we don't need to mess with this prompt so much. We just modify the zod schemas,
 * and the json schemas are updated automatically. (at least in theory)
 *
 */
const jsonSchema = {
  intermediateNodeBaseSchema: zodToJsonSchema(intermediateNodeBaseSchema),
  intermediateNodeSchema: zodToJsonSchema(intermediateNodeSchema),
  intermediateLayoutSchema: zodToJsonSchema(intermediateLayoutSchema),
  aiInsightsSchema: zodToJsonSchema(aiInsightsSchema),
  designIntentSchema: zodToJsonSchema(designIntentSchema),
  nodesRegistrySchema: zodToJsonSchema(nodesRegistrySchema),
};

export const coreLayoutSchemasPromptPart = `
// --- CORE LAYOUT SCHEMAS ---
// Intermediate Node Schema (recursive):
${JSON.stringify(jsonSchema.intermediateNodeSchema, null, 2)} 

// Intermediate Layout Schema:
${JSON.stringify(jsonSchema.intermediateLayoutSchema, null, 2)}
`;

export const designIntentSchemaPromptPart = `
// --- GENERIC DESIGN INTENT SCHEMA ---
// This is the schema for the 'design' property on a node.
// Use it to describe the visual styling of a component.
${JSON.stringify(jsonSchema.designIntentSchema, null, 2)}
`;

export const nodesRegistryPromptPart = `
This defines the available component types and their properties.
${JSON.stringify(jsonSchema.nodesRegistrySchema, null, 2)}
`;

export const designMappingRulesPromptPart = `
- **Colors:** If a user mentions a color (e.g., "blue", "dark grey", "red"), map it to a valid CSS color string in the 'color' or 'backgroundColor' properties. For "blue", use "#3B82F6". For "black", use "#191919".
- **Typography:**
  - "big" or "large" text implies a larger 'fontSize', e.g., 32.
  - "small" text implies a smaller 'fontSize', e.g., 14.
  - "bold" text implies a 'fontWeight' of 700.
  - "center aligned" or "text in the middle" implies 'textAlign: "center"'.
- **Layout & Spacing:**
  - "add some space around it" or "padding" implies setting the 'padding' object. e.g., { "top": "16px", "bottom": "16px" }.
  - "a gap between items" implies setting the 'gap' property, e.g., "16px".
`;

export const mainPrompt = ({
  coreLayoutSchemas = coreLayoutSchemasPromptPart,
  designIntentSchema = designIntentSchemaPromptPart,
  designMappingRules = designMappingRulesPromptPart,
  nodesRegistry = nodesRegistryPromptPart,
}: {
  coreLayoutSchemas?: string;
  designIntentSchema?: string;
  designMappingRules?: string;
  nodesRegistry?: string;
}): string => {
  return `
You are an expert architect that translates user requests into a structured JSON Intermediate Representation (IRF).
Based on the provided JSON schemas, TypeScript interfaces, and rules, you MUST return ONLY a valid JSON object that follows the IRF for a page layout.

<rules>
<schemas>
${coreLayoutSchemas}

${designIntentSchema}
</schemas>

<design_mapping_rules>
${designMappingRules}
</design_mapping_rules>

<nodes_registry>
${nodesRegistry}
</nodes_registry>
</rules>

---
**EXAMPLE 1**
**User Prompt:** "Generate a layout with a section containing a headline that says 'Welcome'."
**Your Output:**
{
  "version": "1.0",
  "name": "Untitled",
  "content": [{
    "type": "page",
    "name": "page",
    "children": [{
      "type": "section",
      "name": "Section",
      "children": [{
        "type": "headline",
        "name": "Headline",
        "props": { "text": "Welcome" }
      }]
    }]
  }]
}
---
**EXAMPLE 2**
**User Prompt:** "Create a page with a big, blue, center-aligned headline that says 'Hello World'. Add some space around it."
**Your Output:**
{
  "version": "1.0",
  "name": "Untitled",
  "content": [{
    "type": "page",
    "name": "page",
    "children": [{
      "type": "section",
      "name": "Section",
      "children": [{
        "type": "headline",
        "name": "Headline",
        "props": { "text": "Hello World" },
        "design": {
          "typography": {
            "fontSize": 32,
            "fontWeight": 700,
            "textAlign": "center",
            "color": "#3B82F6"
          },
          "layout": {
            "padding": { "top": "16px", "bottom": "16px" }
          }
        }
      }]
    }]
  }]
}
---
**EXAMPLE 3**
**User Prompt:** "Create an editorial card. It should have a main image of a forest, a title that says 'Forest Retreat', and a body text that says 'Discover the tranquility of nature'."
**Your Output:**
{
  "version": "1.0",
  "name": "Untitled",
  "content": [{
    "type": "page",
    "name": "page",
    "children": [{
        "type": "editorial-card",
        "name": "Editorial Card",
        "children": [
          {
            "type": "image",
            "name": "Card Image",
            "design": {
              "appearance": {
                "backgroundColor": {
                  "imageRef": "a_picture_of_a_forest" 
                }
              }
            }
          },
          {
            "type": "headline",
            "name": "Card Title",
            "props": { "text": "Forest Retreat" }
          },
          {
            "type": "text",
            "name": "Card Body",
            "props": { "text": "Discover the tranquility of nature." }
          }
        ]
      }]
  }]
}
`;
};
