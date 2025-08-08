import { IntermediateLayout } from "../../../../../schema.types";

/**
 * Accordion in section
 */
export const accordionInSection: IntermediateLayout = {
  version: "1.0",
  name: "Accordion in section",
  content: [
    {
      type: "page",
      name: "Accordion in section",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "accordion",
              name: "Accordion",
              parentNodeTypeName: "section",
            },
          ],
        },
      ],
    },
  ],
};
