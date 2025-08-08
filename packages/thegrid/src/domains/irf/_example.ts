/**
 *
 * This is a file, that is giving us possiblity to test, validate, play with our IRF schema
 * to understand how it looks like, how it works, how it can be used, etc.
 *
 * Feel free to change it, add new nodes, add new properties, mess with it, etc.
 *
 */

import { logger } from "@/utils/logger";
import type { IntermediateLayout, IntermediateNode } from "./schema.types";
import { intermediateLayoutSchema, intermediateNodeSchema } from "./schema";

export const headlineIRFNode: IntermediateNode = {
  type: "headline",
  name: "Headline",
};

export const sectionIRFNode: IntermediateNode = {
  type: "section",
  name: "Section",
  children: [headlineIRFNode],
};

export const pageIRFNode: IntermediateNode = {
  type: "page",
  name: "my test (page)",
  children: [sectionIRFNode],
};

export const exampleIRF: IntermediateLayout = {
  version: "1.0",
  name: "Untitled",
  content: [pageIRFNode],
  globalVars: {},
};

export const main = (irf: IntermediateLayout) => {
  logger.info("### Example IRF Layout ### ");
  logger.info(" ");
  const validatedIRF = intermediateLayoutSchema.safeParse(irf);

  if (!validatedIRF.success) {
    logger.error("Invalid IRF", validatedIRF.error);
    return;
  }

  logger.info(JSON.stringify(validatedIRF.data, null, 2));

  logger.info(" ");
  logger.info(" ");
  logger.info(" ");
  logger.info("### Example IRF Node ### ");
  logger.info(" ");

  const validatedIRFNode = intermediateNodeSchema.safeParse(sectionIRFNode);

  if (!validatedIRFNode.success) {
    logger.error("Invalid IRF Node", validatedIRFNode.error);
    return;
  }

  logger.info(JSON.stringify(validatedIRFNode.data, null, 2));
};

const irfToValidate: IntermediateLayout = {
  version: "1.0",
  name: "Creative Layout",
  content: [
    {
      type: "page",
      name: "Creative Page",
      children: [
        {
          type: "section",
          name: "Hero Section",
          children: [
            {
              type: "headline",
              name: "Welcome to the Creative Page",
            },
            {
              type: "text",
              name: "Intro Text",
              props: {
                text: "Explore a world of ideas and inspiration below.",
              },
            },
          ],
        },
        {
          type: "section",
          name: "Features Section",
          children: [
            {
              type: "headline",
              name: "Our Top Features",
            },
            {
              type: "list",
              name: "Features List",
              children: [
                {
                  type: "list-item",
                  name: "Feature 1",
                  children: [
                    {
                      type: "text",
                      name: "Feature 1 Text",
                      props: {
                        text: "Lightning-fast performance",
                      },
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Feature 2",
                  children: [
                    {
                      type: "text",
                      name: "Feature 2 Text",
                      props: {
                        text: "Intuitive user interface",
                      },
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Feature 3",
                  children: [
                    {
                      type: "text",
                      name: "Feature 3 Text",
                      props: {
                        text: "Seamless integration",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "section",
          name: "Fun Facts Section",
          children: [
            {
              type: "headline",
              name: "Did You Know?",
            },
            {
              type: "list",
              name: "Fun Facts List",
              children: [
                {
                  type: "list-item",
                  name: "Fact 1",
                  children: [
                    {
                      type: "text",
                      name: "Fact 1 Text",
                      props: {
                        text: "Honey never spoils.",
                      },
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Fact 2",
                  children: [
                    {
                      type: "text",
                      name: "Fact 2 Text",
                      props: {
                        text: "Octopuses have three hearts.",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  globalVars: {},
};

main(irfToValidate);
