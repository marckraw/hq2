import type {
  IntermediateLayout,
  IntermediateNode,
} from "../../../schema.types";

/**
 * Edge cases and error scenarios test data for IRF to Storyblok transformation tests
 * This file contains the same test scenarios as edge-cases.ts but as pure data exports
 */

export const unknownComponentLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Unknown Component Test",
  content: [
    {
      type: "page",
      name: "Unknown Page",
      children: [
        {
          type: "unknown-component" as any,
          name: "Mystery Component",
          props: {
            customProperty: "custom value",
            anotherProp: 123,
          },
        },
        {
          type: "section",
          name: "Valid Section",
          children: [
            {
              type: "text",
              name: "Valid Text",
              props: {
                content: "This should still work",
                text: "This should still work",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const malformedLayoutData = {
  version: "1.0",
  name: "Malformed Layout",
  content: [
    {
      // Missing 'type' field
      name: "Invalid Node",
      children: [],
    } as any,
  ],
} as IntermediateLayout;

export const deeplyNestedStressTestData: IntermediateLayout = (() => {
  const createNestedSection = (depth: number): IntermediateNode => {
    if (depth === 0) {
      return {
        type: "text",
        name: `Level ${depth} Text`,
        props: {
          content: `Content at depth ${depth}`,
          text: `Content at depth ${depth}`,
        },
      };
    }
    return {
      type: "section",
      name: `Level ${depth} Section`,
      children: [
        {
          type: "headline",
          name: `Level ${depth} Title`,
          props: {
            content: `Heading at depth ${depth}`,
            title: `Heading at depth ${depth}`,
            headline: `Heading at depth ${depth}`,
          },
        },
        createNestedSection(depth - 1),
      ],
    };
  };

  return {
    version: "1.0",
    name: "Deeply Nested Stress Test",
    content: [
      {
        type: "page",
        name: "Stress Test Page",
        children: [createNestedSection(10)],
      },
    ],
  };
})();

export const invalidChildrenLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Invalid Children Test",
  content: [
    {
      type: "page",
      name: "Invalid Children Page",
      children: [
        {
          type: "problematic-component" as any,
          name: "Problem Component",
          // Invalid children format
          children: "invalid children format" as any,
        },
      ],
    },
  ],
};

export const circularReferenceLayoutData: IntermediateLayout = (() => {
  const sharedNode: IntermediateNode = {
    type: "text",
    name: "Shared Text",
    props: {
      content: "This text appears multiple times",
      text: "This text appears multiple times",
    },
  };

  return {
    version: "1.0",
    name: "Circular Reference Test",
    content: [
      {
        type: "page",
        name: "Circular Page",
        children: [
          {
            type: "section",
            name: "Section 1",
            children: [sharedNode],
          },
          {
            type: "section",
            name: "Section 2",
            children: [sharedNode],
          },
        ],
      },
    ],
  };
})();

export const emptyValuesLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Empty Values Test",
  content: [
    {
      type: "page",
      name: "Empty Values Page",
      children: [
        {
          type: "section",
          name: "", // Empty name
          props: {
            customClassname: "",
            backpack_ai: "",
            nullProp: null,
            undefinedProp: undefined,
          },
          children: [
            {
              type: "headline",
              name: "",
              props: {
                content: "",
                title: "",
                headline: "",
                customClassname: "",
              },
            },
            {
              type: "text",
              name: "Null Props Text",
              props: {
                content: "Text with null props",
                text: "Text with null props",
                customClassname: null as any,
              },
            },
          ],
        },
      ],
    },
  ],
};

export const veryLongContentLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Very Long Content Test",
  content: [
    {
      type: "page",
      name: "Long Content Page",
      children: [
        {
          type: "section",
          name: "Long Section",
          children: [
            {
              type: "headline",
              name: "Very Long Headline",
              props: {
                content: "A".repeat(500), // 500 character headline
                title: "A".repeat(500),
                headline: "A".repeat(500),
              },
            },
            {
              type: "text",
              name: "Very Long Text",
              props: {
                content: "Lorem ipsum ".repeat(1000), // Very long text content
                text: "Lorem ipsum ".repeat(1000),
              },
            },
          ],
        },
      ],
    },
  ],
};

export const specialCharactersLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Special Characters Test",
  content: [
    {
      type: "page",
      name: "Special Chars Page",
      children: [
        {
          type: "section",
          name: "Unicode Section",
          children: [
            {
              type: "headline",
              name: "Emoji Title",
              props: {
                content: "🚀 Rocket Launch! 🎉",
                title: "🚀 Rocket Launch! 🎉",
                headline: "🚀 Rocket Launch! 🎉",
              },
            },
            {
              type: "text",
              name: "Unicode Text",
              props: {
                content: "Special chars: <>&\"'`\n\t•©®™",
                text: "Special chars: <>&\"'`\n\t•©®™",
              },
            },
            {
              type: "text",
              name: "International",
              props: {
                content: "你好世界 • مرحبا بالعالم • Здравствуй мир",
                text: "你好世界 • مرحبا بالعالم • Здравствуй мир",
              },
            },
            {
              type: "text",
              name: "Math Symbols",
              props: {
                content: "∑∏∫∂∆≈≠≤≥±∞",
                text: "∑∏∫∂∆≈≠≤≥±∞",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const missingParentContextLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Missing Parent Context",
  content: [
    {
      type: "page",
      name: "Context Test Page",
      children: [
        // These nodes are missing parentNodeTypeName
        {
          type: "section",
          name: "No Parent Context Section",
          children: [
            {
              type: "headline",
              name: "No Parent Headline",
              props: {
                content: "Missing parent context",
                title: "Missing parent context",
                headline: "Missing parent context",
              },
              // Missing parentNodeTypeName
            },
          ],
        },
      ],
    },
  ],
};

export const mixedValidityLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Mixed Validity Test",
  content: [
    {
      type: "page",
      name: "Mixed Page",
      children: [
        {
          type: "section",
          name: "Valid Section",
          children: [
            {
              type: "headline",
              name: "Valid Headline",
              props: {
                content: "This is valid",
                title: "This is valid",
                headline: "This is valid",
              },
            },
          ],
        },
        {
          type: "invalid-section" as any,
          name: "Invalid Section",
          invalidProp: "should not break transformation",
        } as any,
        {
          type: "section",
          name: "Another Valid Section",
          children: [
            {
              type: "text",
              name: "Valid Text",
              props: {
                content: "This should still render",
                text: "This should still render",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const excessivePropsLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Excessive Props Test",
  content: [
    {
      type: "page",
      name: "Props Test Page",
      children: [
        {
          type: "section",
          name: "Overloaded Section",
          props: Object.fromEntries(
            Array.from({ length: 100 }, (_, i) => [`prop${i}`, `value${i}`])
          ),
          children: [
            {
              type: "text",
              name: "Simple Text",
              props: {
                content: "Content within overloaded section",
                text: "Content within overloaded section",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const globalVarsEdgeCasesData: IntermediateLayout = {
  version: "1.0",
  name: "Global Vars Edge Cases",
  content: [
    {
      type: "page",
      name: "Global Vars Page",
      children: [],
    },
  ],
  globalVars: {
    emptyObject: {},
    emptyArray: [],
    nullValue: null,
    undefinedValue: undefined,
    deeplyNested: {
      level1: {
        level2: {
          level3: {
            value: "deeply nested value",
          },
        },
      },
    },
    styles: {
      primaryColor: "#007bff",
      fontFamily: "Arial, sans-serif",
    },
  },
};

export const emptyTableLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Empty Table Test",
  content: [
    {
      type: "page",
      name: "Empty Table Page",
      children: [
        {
          type: "section",
          name: "Table Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "table",
              name: "Empty Table",
              parentNodeTypeName: "section",
              children: [], // Empty table with no rows
            },
          ],
        },
      ],
    },
  ],
};

export const incompleteTableLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Incomplete Table Test",
  content: [
    {
      type: "page",
      name: "Incomplete Table Page",
      children: [
        {
          type: "section",
          name: "Table Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "table",
              name: "Incomplete Table",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "table-row",
                  name: "Row with Missing Cells",
                  parentNodeTypeName: "table",
                  children: [
                    {
                      type: "table-cell",
                      name: "First Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Cell Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Only cell in row",
                            text: "Only cell in row",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-row",
                  name: "Empty Row",
                  parentNodeTypeName: "table",
                  children: [], // Row with no cells
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const tableWithEmptyCellsLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Table with Empty Cells",
  content: [
    {
      type: "page",
      name: "Empty Cells Page",
      children: [
        {
          type: "section",
          name: "Table Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "table",
              name: "Sparse Table",
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
                      name: "Column 1",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Header Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Data",
                            text: "Data",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Column 2",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Header Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Status",
                            text: "Status",
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
                      name: "Data Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Cell Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Some value",
                            text: "Some value",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Empty Cell",
                      parentNodeTypeName: "table-row",
                      children: [], // Cell with no content
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

export const malformedTableLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Malformed Table Test",
  content: [
    {
      type: "page",
      name: "Malformed Table Page",
      children: [
        {
          type: "section",
          name: "Table Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "table",
              name: "Malformed Table",
              parentNodeTypeName: "section",
              props: {
                invalidProp: "should not break anything",
              } as any,
              children: [
                {
                  type: "table-row",
                  name: "Row with Invalid Props",
                  parentNodeTypeName: "table",
                  props: {
                    isHeader: "not a boolean" as any, // Invalid prop type
                    invalidRowProp: "test",
                  },
                  children: [
                    {
                      type: "table-cell",
                      name: "Cell with Invalid Props",
                      parentNodeTypeName: "table-row",
                      props: {
                        colspan: "not a number" as any, // Invalid prop type
                        invalidCellProp: "test",
                      },
                      children: [
                        {
                          type: "text",
                          name: "Cell Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Text with invalid table structure",
                            text: "Text with invalid table structure",
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
