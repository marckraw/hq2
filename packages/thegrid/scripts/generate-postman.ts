#!/usr/bin/env node
import axios from "axios";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { config } from "../src/config.env";

async function generatePostmanCollection() {
  console.log("🚀 Generating Postman collection from OpenAPI spec...");

  try {
    // Fetch OpenAPI spec from the running server
    const apiUrl = `http://localhost:${config.PORT || 3333}`;
    const response = await axios.get(`${apiUrl}/api/openapi.json`);
    const openAPIDocument = response.data;

    console.log("✅ OpenAPI spec fetched successfully");

    const endpointCount = Object.keys(openAPIDocument.paths || {}).length;
    console.log(`📊 Generated OpenAPI spec with ${endpointCount} endpoints`);
    console.log("📋 Endpoints:", Object.keys(openAPIDocument.paths || {}));

    // Ensure output directory exists
    const outputDir = join(process.cwd(), "generated");
    mkdirSync(outputDir, { recursive: true });

    // Save OpenAPI spec
    const specPath = join(outputDir, "openapi-spec.json");
    writeFileSync(specPath, JSON.stringify(openAPIDocument, null, 2));
    console.log(`💾 OpenAPI spec saved to: ${specPath}`);

    // Convert to Postman collection
    const Converter = require("openapi-to-postmanv2");
    const openapiData = JSON.stringify(openAPIDocument);

    return new Promise<void>((resolve, reject) => {
      Converter.convert(
        { type: "json", data: openapiData },
        {
          folderStrategy: "Tags",
          requestNameSource: "URL",
          indentCharacter: "  ",
        },
        (err: any, result: any) => {
          if (err) {
            console.error("❌ Error converting to Postman:", err);
            reject(err);
            return;
          }

          if (result.result) {
            const postmanCollection = result.output[0].data;
            const collectionPath = join(
              outputDir,
              "thegrid-api-collection.json"
            );

            writeFileSync(
              collectionPath,
              JSON.stringify(postmanCollection, null, 2)
            );
            console.log(`🚀 Postman collection saved to: ${collectionPath}`);
            console.log("✅ Generation completed successfully!");
            console.log("");
            console.log("📥 To import into Postman:");
            console.log(`   1. Open Postman`);
            console.log(`   2. Click "Import"`);
            console.log(`   3. Select: ${collectionPath}`);
            resolve();
          } else {
            console.error("❌ Conversion failed:", result.reason);
            reject(new Error(result.reason));
          }
        }
      );
    });
  } catch (error) {
    console.error("❌ Error generating Postman collection:", error);
    process.exit(1);
  }
}

// Run the script
generatePostmanCollection();
