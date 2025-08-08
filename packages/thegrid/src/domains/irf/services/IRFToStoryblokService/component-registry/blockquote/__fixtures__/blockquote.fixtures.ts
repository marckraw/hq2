import { IntermediateLayout } from "@/domains/irf/schema.types";

/**
 * Blockquote in section
 */
export const blockquoteInSection: IntermediateLayout = {
  version: "1.0",
  name: "Blockquote in section",
  content: [
    {
      type: "page",
      name: "Blockquote in section",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "blockquote",
              name: "Blockquote",
              parentNodeTypeName: "section",
              props: {
                content: "This is a blockquote",
                text: "This is a blockquote",
              },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Blockquote in flex group
 */
export const blockquoteInFlexGroup: IntermediateLayout = {
  version: "1.0",
  name: "Blockquote in flex group",
  content: [
    {
      type: "page",
      name: "Blockquote in section",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "flex-group",
              name: "Flex Group",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "blockquote",
                  name: "Blockquote",
                  parentNodeTypeName: "section",
                  props: {
                    content: "This is a blockquote",
                    text: "This is a blockquote",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const blockquoteInSectionWithPadding: IntermediateLayout = {
  version: "1.0",
  name: "Untitled",
  content: [
    {
      type: "page",
      name: "page",
      children: [
        {
          type: "section",
          name: "Section",
          children: [
            {
              type: "blockquote",
              name: "Blockquote",
              props: {
                content: "Human extinction comming",
                author: "Marcin Krawczyk",
              },
              design: {
                layout: {
                  padding: {
                    top: "32px",
                    bottom: "32px",
                    left: "32px",
                    right: "32px",
                  },
                },
              },
              parentNodeName: "Section",
              parentNodeTypeName: "section",
            },
          ],
          parentNodeName: "page",
          parentNodeTypeName: "page",
        },
      ],
    },
  ],
};

export const blockquoteInFlexGroupWithPadding: IntermediateLayout = {
  version: "1.0",
  name: "Untitled",
  content: [
    {
      type: "page",
      name: "page",
      children: [
        {
          type: "section",
          name: "Section",
          children: [
            {
              type: "flex-group",
              name: "Flex Group",
              children: [
                {
                  type: "blockquote",
                  name: "Blockquote",
                  props: {
                    content: "Human extinction comming",
                    author: "Marcin Krawczyk",
                  },
                  design: {
                    layout: {
                      padding: {
                        top: "32px",
                        bottom: "32px",
                        left: "32px",
                        right: "32px",
                      },
                    },
                  },
                  parentNodeName: "Flex Group",
                  parentNodeTypeName: "flex-group",
                },
              ],
            },
          ],
          parentNodeName: "page",
          parentNodeTypeName: "page",
        },
      ],
    },
  ],
};
