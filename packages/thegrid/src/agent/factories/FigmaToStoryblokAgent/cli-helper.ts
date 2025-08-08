#!/usr/bin/env node
import { logger } from "@/utils/logger";

/**
 * CLI Helper for Figma to Storyblok Transformer Development
 *
 * This CLI tool helps developers work with the Figma to Storyblok transformation pipeline.
 * It provides commands for generating schemas, testing transformers, and running the full pipeline.
 */

import * as fs from "fs";
import * as path from "path";
import { generateSchemaFromStoryblokExport } from "./schema-generator";
import { serviceRegistry } from "@/registry/service-registry";

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];

// Helper functions
const readJsonFile = (filePath: string): any => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    logger.error(`❌ Error reading file ${filePath}:`, error);
    process.exit(1);
  }
};

const writeFile = (filePath: string, content: string): void => {
  try {
    fs.writeFileSync(filePath, content, "utf-8");
    logger.info(`✅ File written to ${filePath}`);
  } catch (error) {
    logger.error(`❌ Error writing file ${filePath}:`, error);
    process.exit(1);
  }
};

const generateSchemaFile = (
  componentName: string,
  schemaCode: string
): string => {
  return `/**
 * Generated Schema for ${componentName}
 * 
 * This schema was auto-generated from a Storyblok component export.
 * Copy the relevant parts to your storyblok-schemas.ts file.
 */

import { z } from "@hono/zod-openapi";
import { StoryblokBaseComponentSchema, BackpackDesignSchema, RichTextSchema } from "./storyblok-schemas";

${schemaCode}

export default ${componentName}Schema;
`;
};

const generateTransformerFile = (
  componentName: string,
  irfType: string
): string => {
  return `/**
 * Generated Transformer for ${componentName}
 * 
 * This transformer was auto-generated. Customize the transformation logic as needed.
 */

import { IntermediateNode } from "./transformer.service";
import { IRFToStoryblokOptions } from "./irf-to-storyblok.service";
import { createValidatedTransformer } from "./storyblok-schemas";
import { ${componentName}Schema } from "./generated-schemas/${componentName.toLowerCase()}-schema";

export const ${irfType}Transformer = createValidatedTransformer(
  ${componentName}Schema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    // TODO: Implement your transformation logic here
    return {
      component: "${componentName.toLowerCase()}",
      _uid: generateUID(), // You'll need to import this
      // Add your component-specific fields here
      ...node.props,
    };
  }
);

// Register the transformer
// irfToStoryblokService.registerComponent("${irfType}", "${componentName.toLowerCase()}", ${irfType}Transformer);
`;
};

// Command implementations
const generateSchema = (jsonFilePath: string, outputDir?: string) => {
  logger.info(`🔧 Generating schema from ${jsonFilePath}`);

  const storyblokExport = readJsonFile(jsonFilePath);
  const analysis = generateSchemaFromStoryblokExport(storyblokExport);

  logger.info("\n📊 Analysis Results:");
  logger.info(`- Component: ${analysis.componentName}`);
  logger.info(`- Fields detected: ${Object.keys(analysis.fields).length}`);
  logger.info(
    `- Required fields: ${
      Object.values(analysis.fields).filter((field: any) => field.required)
        .length
    }`
  );

  if (outputDir) {
    // Create output directory if it doesn't exist
    const schemasDir = path.join(outputDir, "generated-schemas");
    if (!fs.existsSync(schemasDir)) {
      fs.mkdirSync(schemasDir, { recursive: true });
    }

    // Write schema file
    const schemaFileName = `${analysis.componentName.toLowerCase()}-schema.ts`;
    const schemaFilePath = path.join(schemasDir, schemaFileName);
    const schemaFileContent = generateSchemaFile(
      analysis.componentName,
      analysis.suggestedSchema
    );
    writeFile(schemaFilePath, schemaFileContent);

    // Write transformer template
    const transformersDir = path.join(outputDir, "generated-transformers");
    if (!fs.existsSync(transformersDir)) {
      fs.mkdirSync(transformersDir, { recursive: true });
    }

    const transformerFileName = `${analysis.componentName.toLowerCase()}-transformer.ts`;
    const transformerFilePath = path.join(transformersDir, transformerFileName);
    const irfType = analysis.componentName
      .replace(/^sb-/, "")
      .replace(/-section$/, "");
    const transformerFileContent = generateTransformerFile(
      analysis.componentName,
      irfType
    );
    writeFile(transformerFilePath, transformerFileContent);

    logger.info("\n📝 Generated Files:");
    logger.info(`- Schema: ${schemaFilePath}`);
    logger.info(`- Transformer: ${transformerFilePath}`);
  } else {
    logger.info("\n📝 Generated Schema (copy to storyblok-schemas.ts):");
    logger.info(analysis.suggestedSchema);
  }
};

const runDemo = async (demoType: string) => {
  logger.info(`🚀 Running ${demoType} demo`);

  switch (demoType) {
    case "test-no-uids":
      await testNoUidGeneration();
      break;
    default:
      logger.error(`❌ Unknown demo type: ${demoType}`);
      logger.info(
        "Available demos: schema, transformers, pipeline, workflow, real-story, analyze-real, test-components, page-detection, approval-flow, test-storyblok, test-approval, all"
      );
      process.exit(1);
  }
};

const showHelp = () => {
  logger.info(`
🎯 Figma to Storyblok Transformer CLI

USAGE:
  node cli-helper.js <command> [options]

COMMANDS:
  generate <json-file> [output-dir]     Generate schema and transformer from Storyblok JSON export
  demo <type>                          Run demonstration workflows
  help                                 Show this help message

DEMO TYPES:
  schema                              Demonstrate schema generation from exports
  transformers                        Test validated transformers
  pipeline                           Run full IRF to Storyblok pipeline
  workflow                           Show your development workflow
  real-story                         Test with actual Storyblok story structure
  analyze-real                       Analyze actual story components
  test-components                    Test individual components
  page-detection                     Test page detection
  approval-flow                      Test approval flow
  test-storyblok                     Test storyblok service
  test-approval                      Test approval flow
  test-no-uids                       Test UID generation control
  all                                Run all demos and tests

EXAMPLES:
  # Generate schema from a Storyblok component export
  node cli-helper.js generate ./exports/hero-section.json ./output

  # Run schema generation demo
  node cli-helper.js demo schema

  # Test with real story structure
  node cli-helper.js demo real-story

  # Run all demos and tests
  node cli-helper.js demo all

  # Analyze actual story components
  node cli-helper.js demo analyze-real

WORKFLOW:
  1. Export your Storyblok component as JSON
  2. Run: node cli-helper.js generate <your-export.json> ./output
  3. Copy generated schema to storyblok-schemas.ts
  4. Implement transformation logic in the generated transformer
  5. Register with irfToStoryblokService.registerComponent()
  6. Test with: node cli-helper.js demo test-components

NEW COMPONENTS AVAILABLE:
  - page: Root page component with SEO fields and background color
  - section: Container section with Backpack design fields
  - blockquote: Quote component with citation and rich text content
  - text: Body text with rich text content and typography options
  - headline: Heading component with variants and alignment
  - hero-section: Hero banner with CTA and background image
  - editorial-card: Card component with image and content
  - button: Interactive button component

REAL STORY TESTING:
  The CLI now includes testing with actual Storyblok story structures:
  - Analyze real components: node cli-helper.js demo analyze-real
  - Test individual components: node cli-helper.js demo test-components
  - Full story generation: node cli-helper.js demo real-story

For more information, see the README.md file.
`);
};

export const testNoUidGeneration = async () => {
  logger.info("🧪 Testing No UID Generation");
  logger.info("=".repeat(40));

  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  // Create a simple test IRF layout
  const testIRF = {
    version: "1.0" as const,
    name: "Test Layout",
    content: [
      {
        type: "section",
        name: "Test Section",
        children: [
          {
            type: "headline",
            name: "Test Headline",
            props: { content: "Hello World" },
          },
          {
            type: "text",
            name: "Test Text",
            props: { content: "This is a test paragraph." },
          },
        ],
      },
    ],
  };

  logger.info(
    "\n1️⃣ Testing with generateUids: false (default for new stories)"
  );
  const resultWithoutUids = await irfToStoryblokService.transformIRFToStoryblok(
    // TODO: fix this
    // @ts-ignore
    testIRF,
    {
      storyName: "Test Story Without UIDs",
    }
  );

  logger.info("📋 Story structure (should have NO _uid fields):");
  logger.info(JSON.stringify(resultWithoutUids.story, null, 2));

  // Check for any _uid fields
  const storyJson = JSON.stringify(resultWithoutUids.story);
  const hasUids = storyJson.includes('"_uid"');

  if (hasUids) {
    logger.info("❌ FAIL: Found _uid fields in the story!");
  } else {
    logger.info(
      "✅ SUCCESS: No _uid fields found - perfect for new story creation!"
    );
  }

  logger.info(
    "\n2️⃣ Testing with generateUids: true (for existing story updates)"
  );
  const resultWithUids = await irfToStoryblokService.transformIRFToStoryblok(
    // TODO: fix this
    // @ts-ignore
    testIRF,
    {
      generateUids: true,
      storyName: "Test Story With UIDs",
    }
  );

  logger.info("📋 Story structure (should have _uid fields):");
  logger.info(JSON.stringify(resultWithUids.story, null, 2));

  // Check for _uid fields
  const storyWithUidsJson = JSON.stringify(resultWithUids.story);
  const hasUidsInSecond = storyWithUidsJson.includes('"_uid"');

  if (hasUidsInSecond) {
    logger.info(
      "✅ SUCCESS: Found _uid fields as expected for existing story updates!"
    );
  } else {
    logger.info("❌ FAIL: No _uid fields found when they should be present!");
  }

  logger.info("\n📊 Test Summary:");
  logger.info(
    `✅ No UIDs when generateUids: false - ${!hasUids ? "PASS" : "FAIL"}`
  );
  logger.info(
    `✅ Has UIDs when generateUids: true - ${hasUidsInSecond ? "PASS" : "FAIL"}`
  );

  logger.info(
    "\n3️⃣ Testing with page type IRF node (should not create double nesting)"
  );
  const testIRFWithPage = {
    version: "1.0" as const,
    name: "Test Layout with Page",
    content: [
      {
        type: "page",
        name: "Test Page",
        props: {
          title: "My Test Page",
          noIndex: false,
        },
        children: [
          {
            type: "section",
            name: "Test Section",
            children: [
              {
                type: "headline",
                name: "Test Headline",
                props: { content: "Page Content" },
              },
            ],
          },
        ],
      },
    ],
  };

  const resultWithPageNode =
    // TODO: fix this
    // @ts-ignore
    await irfToStoryblokService.transformIRFToStoryblok(testIRFWithPage, {
      storyName: "Test Story With Page Node",
    });

  logger.info("📋 Story structure with page IRF node:");
  logger.info(JSON.stringify(resultWithPageNode.story, null, 2));

  // Check for double page nesting
  const storyWithPageJson = JSON.stringify(resultWithPageNode.story);
  const hasDoublePageNesting =
    storyWithPageJson.includes('"component":"page"') &&
    resultWithPageNode.story.content.body?.some(
      (item: any) => item.component === "page"
    );

  if (hasDoublePageNesting) {
    logger.info("❌ FAIL: Found double page nesting!");
  } else {
    logger.info(
      "✅ SUCCESS: No double page nesting - page IRF node became root content!"
    );
  }

  logger.info("\n📊 Final Test Summary:");
  logger.info(
    `✅ No UIDs when generateUids: false - ${!hasUids ? "PASS" : "FAIL"}`
  );
  logger.info(
    `✅ Has UIDs when generateUids: true - ${hasUidsInSecond ? "PASS" : "FAIL"}`
  );
  logger.info(
    `✅ No double page nesting - ${!hasDoublePageNesting ? "PASS" : "FAIL"}`
  );

  return {
    noUidsTest: !hasUids,
    hasUidsTest: hasUidsInSecond,
    noDoublePageNesting: !hasDoublePageNesting,
    success: !hasUids && hasUidsInSecond && !hasDoublePageNesting,
  };
};

// Main CLI logic
const main = async () => {
  if (args.length === 0 || command === "help") {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case "generate":
        if (args.length < 2) {
          logger.error("❌ Missing required argument: json-file");
          logger.info(
            "Usage: node cli-helper.js generate <json-file> [output-dir]"
          );
          process.exit(1);
        }
        // TODO: fix this
        // @ts-ignore
        generateSchema(args[1], args[2]);
        break;

      case "demo":
        if (args.length < 2) {
          logger.error("❌ Missing required argument: demo-type");
          logger.info("Usage: node cli-helper.js demo <type>");
          logger.info(
            "Available types: schema, transformers, pipeline, workflow, real-story, analyze-real, test-components, page-detection, approval-flow, test-storyblok, test-approval, test-no-uids, all"
          );
          process.exit(1);
        }
        // TODO: fix this
        // @ts-ignore
        await runDemo(args[1]);
        break;

      case "test-no-uids":
        await testNoUidGeneration();
        break;

      case "help":
      default:
        logger.info(`
🎯 Figma to Storyblok CLI Helper

Usage: npx tsx cli-helper.ts <command> [args]

Commands:
  demo <type>              Run demo transformations
    - basic               Basic IRF to Storyblok transformation
    - validated           Validated transformer examples
    - real-story          Real Storyblok story testing
    - approval-flow       Complete approval flow test

  generate <file>          Generate schema from Storyblok JSON
    - <path-to-json>      Path to exported Storyblok JSON file

  test <type>              Run specific tests
    - transformers        Test all validated transformers
    - pipeline            Test complete pipeline
    - page-detection      Test page detection logic
    - no-uids             Test UID generation control

  workflow <type>          Run workflow examples
    - complete            Complete workflow demonstration
    - components          Component analysis workflow

  help                     Show this help message

Examples:
  npx tsx cli-helper.ts demo basic
  npx tsx cli-helper.ts generate ./story.json
  npx tsx cli-helper.ts test transformers
  npx tsx cli-helper.ts test no-uids
  npx tsx cli-helper.ts workflow complete
      `);
        break;
    }
  } catch (error) {
    logger.error("❌ An error occurred:", error);
    process.exit(1);
  }
};

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}

export { generateSchema, runDemo, showHelp };
