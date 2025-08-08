import { IntermediateLayout } from "@/domains/irf/schema.types";

/**
 * Table in section
 */
export const tableInSection: IntermediateLayout = {
  version: "1.0",
  name: "Table in section",
  content: [
    {
      type: "page",
      name: "Table in section",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "table",
              name: "Data Table",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "table-row",
                  name: "Header Row",
                  parentNodeTypeName: "table",
                  props: {
                    isHeader: true,
                  },
                  children: [
                    {
                      type: "table-cell",
                      name: "Name Header",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Header Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Name",
                            text: "Name",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Email Header",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Header Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Email",
                            text: "Email",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-row",
                  name: "Data Row",
                  parentNodeTypeName: "table",
                  children: [
                    {
                      type: "table-cell",
                      name: "Name Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Cell Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "John Doe",
                            text: "John Doe",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Email Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Cell Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "john@example.com",
                            text: "john@example.com",
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
    },
  ],
};

/**
 * Table in flex group
 */
export const tableInFlexGroup: IntermediateLayout = {
  version: "1.0",
  name: "Table in flex group",
  content: [
    {
      type: "page",
      name: "Table in flex group",
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
                  type: "table",
                  name: "Flex Table",
                  parentNodeTypeName: "flex-group",
                  children: [
                    {
                      type: "table-row",
                      name: "Header Row",
                      parentNodeTypeName: "table",
                      props: {
                        isHeader: true,
                      },
                      children: [
                        {
                          type: "table-cell",
                          name: "Product Header",
                          parentNodeTypeName: "table-row",
                          children: [
                            {
                              type: "text",
                              name: "Header Text",
                              parentNodeTypeName: "table-cell",
                              props: {
                                content: "Product",
                                text: "Product",
                              },
                            },
                          ],
                        },
                        {
                          type: "table-cell",
                          name: "Price Header",
                          parentNodeTypeName: "table-row",
                          children: [
                            {
                              type: "text",
                              name: "Header Text",
                              parentNodeTypeName: "table-cell",
                              props: {
                                content: "Price",
                                text: "Price",
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "table-row",
                      name: "Data Row",
                      parentNodeTypeName: "table",
                      children: [
                        {
                          type: "table-cell",
                          name: "Product Cell",
                          parentNodeTypeName: "table-row",
                          children: [
                            {
                              type: "text",
                              name: "Cell Text",
                              parentNodeTypeName: "table-cell",
                              props: {
                                content: "Laptop",
                                text: "Laptop",
                              },
                            },
                          ],
                        },
                        {
                          type: "table-cell",
                          name: "Price Cell",
                          parentNodeTypeName: "table-row",
                          children: [
                            {
                              type: "text",
                              name: "Cell Text",
                              parentNodeTypeName: "table-cell",
                              props: {
                                content: "$999",
                                text: "$999",
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
        },
      ],
    },
  ],
};
