import type { IntermediateLayout } from "../../../schema.types";

/**
 * Complex component test data for IRF to Storyblok transformation tests
 * This file contains the same test scenarios as complex-components.ts but as pure data exports
 */

export const flexGroupLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Flex Group Test",
  content: [
    {
      type: "page",
      name: "Flex Page",
      children: [
        {
          type: "section",
          name: "Container Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "flex-group",
              name: "Content Group",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "headline",
                  name: "Group Headline",
                  parentNodeTypeName: "flex-group",
                  props: {
                    content: "Grouped Content",
                    title: "Grouped Content",
                    headline: "Grouped Content",
                  },
                },
                {
                  type: "text",
                  name: "Group Text",
                  parentNodeTypeName: "flex-group",
                  props: {
                    content: "This is grouped text content.",
                    text: "This is grouped text content.",
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

export const listLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "List Test Layout",
  content: [
    {
      type: "page",
      name: "List Page",
      children: [
        {
          type: "section",
          name: "Features Section",
          children: [
            {
              type: "list",
              name: "Features List",
              children: [
                {
                  type: "list-item",
                  name: "Feature 1",
                  children: [
                    {
                      type: "headline",
                      name: "Feature 1 Title",
                      props: {
                        title: "Lightning Fast",
                        content: "Lightning Fast",
                        headline: "Lightning Fast",
                      },
                    },
                    {
                      type: "text",
                      name: "Feature 1 Description",
                      props: {
                        text: "Blazing fast performance",
                        content: "Blazing fast performance",
                      },
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Feature 2",
                  children: [
                    {
                      type: "headline",
                      name: "Feature 2 Title",
                      props: {
                        title: "User Friendly",
                        content: "User Friendly",
                        headline: "User Friendly",
                      },
                    },
                    {
                      type: "text",
                      name: "Feature 2 Description",
                      props: {
                        text: "Intuitive interface",
                        content: "Intuitive interface",
                      },
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Feature 3",
                  children: [
                    {
                      type: "headline",
                      name: "Feature 3 Title",
                      props: {
                        title: "Secure",
                        content: "Secure",
                        headline: "Secure",
                      },
                    },
                    {
                      type: "text",
                      name: "Feature 3 Description",
                      props: {
                        text: "Enterprise-grade security",
                        content: "Enterprise-grade security",
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
};

export const deeplyNestedLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Deeply Nested Layout",
  content: [
    {
      type: "page",
      name: "Complex Page",
      children: [
        {
          type: "section",
          name: "Outer Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Section Title",
              parentNodeTypeName: "section",
              props: {
                content: "Main Section",
                title: "Main Section",
                headline: "Main Section",
              },
            },
            {
              type: "flex-group",
              name: "Main Content",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "text",
                  name: "Introduction",
                  parentNodeTypeName: "flex-group",
                  props: {
                    content: "Welcome to our complex layout",
                    text: "Welcome to our complex layout",
                  },
                },
                {
                  type: "list",
                  name: "Nested List",
                  parentNodeTypeName: "flex-group",
                  children: [
                    {
                      type: "list-item",
                      name: "Item 1",
                      children: [
                        {
                          type: "flex-group",
                          name: "Item Content",
                          children: [
                            {
                              type: "headline",
                              name: "Item Title",
                              parentNodeTypeName: "flex-group",
                              props: {
                                content: "First Item",
                                title: "First Item",
                                headline: "First Item",
                              },
                            },
                            {
                              type: "text",
                              name: "Item Description",
                              parentNodeTypeName: "flex-group",
                              props: {
                                content: "Description of first item",
                                text: "Description of first item",
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "divider",
                  name: "Content Separator",
                  parentNodeTypeName: "flex-group",
                },
                {
                  type: "text",
                  name: "Conclusion",
                  parentNodeTypeName: "flex-group",
                  props: {
                    content: "End of complex structure",
                    text: "End of complex structure",
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

export const mixedContentLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Mixed Content Layout",
  content: [
    {
      type: "page",
      name: "Mixed Page",
      children: [
        {
          type: "section",
          name: "Hero Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Hero Title",
              parentNodeTypeName: "section",
              props: {
                content: "Welcome to Our Platform",
                title: "Welcome to Our Platform",
                headline: "Welcome to Our Platform",
                as: "h1",
              },
            },
            {
              type: "text",
              name: "Hero Subtitle",
              parentNodeTypeName: "section",
              props: {
                content: "The best solution for your needs",
                text: "The best solution for your needs",
              },
            },
            {
              type: "image",
              name: "Hero Image",
              parentNodeTypeName: "section",
              props: {
                alt: "Platform screenshot",
                name: "platform-screenshot.jpg",
              },
            },
          ],
        },
        {
          type: "section",
          name: "Features Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Features Title",
              parentNodeTypeName: "section",
              props: {
                content: "Key Features",
                title: "Key Features",
                headline: "Key Features",
                as: "h2",
              },
            },
            {
              type: "flex-group",
              name: "Features Group",
              children: [
                {
                  type: "headline",
                  name: "Features Title",
                  parentNodeTypeName: "section",
                  props: {
                    content: "Key Features",
                    title: "Key Features",
                    headline: "Key Features",
                    as: "h2",
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

export const complexListLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Complex List Layout",
  content: [
    {
      type: "page",
      name: "Complex List Page",
      children: [
        {
          type: "section",
          name: "Products Section",
          children: [
            {
              type: "headline",
              name: "Section Title",
              parentNodeTypeName: "section",
              props: {
                content: "Our Products",
                title: "Our Products",
                headline: "Our Products",
                as: "h2",
              },
            },
            {
              type: "list",
              name: "Products List",
              children: [
                {
                  type: "list-item",
                  name: "Product 1",
                  children: [
                    {
                      type: "flex-group",
                      name: "Product Content",
                      children: [
                        {
                          type: "image",
                          name: "Product Image",
                          props: {
                            alt: "Product 1 image",
                            name: "product-1.jpg",
                          },
                        },
                        {
                          type: "flex-group",
                          name: "Product Details",
                          children: [
                            {
                              type: "headline",
                              name: "Product Name",
                              props: {
                                content: "Premium Package",
                                title: "Premium Package",
                                headline: "Premium Package",
                              },
                            },
                            {
                              type: "text",
                              name: "Product Description",
                              props: {
                                content: "Our most popular offering",
                                text: "Our most popular offering",
                              },
                            },
                            {
                              type: "text",
                              name: "Product Price",
                              props: {
                                content: "$99/month",
                                text: "$99/month",
                              },
                            },
                            {
                              type: "divider",
                              name: "Detail Separator",
                            },
                            {
                              type: "text",
                              name: "Product Features",
                              props: {
                                content: "Includes all features",
                                text: "Includes all features",
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "list-item",
                  name: "Product 2",
                  children: [
                    {
                      type: "flex-group",
                      name: "Product Content",
                      children: [
                        {
                          type: "image",
                          name: "Product Image",
                          props: {
                            alt: "Product 2 image",
                            name: "product-2.jpg",
                          },
                        },
                        {
                          type: "flex-group",
                          name: "Product Details",
                          children: [
                            {
                              type: "headline",
                              name: "Product Name",
                              props: {
                                content: "Standard Package",
                                title: "Standard Package",
                                headline: "Standard Package",
                              },
                            },
                            {
                              type: "text",
                              name: "Product Description",
                              props: {
                                content: "Great for small teams",
                                text: "Great for small teams",
                              },
                            },
                            {
                              type: "text",
                              name: "Product Price",
                              props: {
                                content: "$49/month",
                                text: "$49/month",
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

export const complexTableLayoutData: IntermediateLayout = {
  version: "1.0",
  name: "Complex Table Layout",
  content: [
    {
      type: "page",
      name: "Table Data Page",
      children: [
        {
          type: "section",
          name: "Table Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "headline",
              name: "Table Title",
              parentNodeTypeName: "section",
              props: {
                content: "Employee Directory",
                title: "Employee Directory",
                headline: "Employee Directory",
              },
            },
            {
              type: "table",
              name: "Employee Table",
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
                    {
                      type: "table-cell",
                      name: "Department Header",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Header Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Department",
                            text: "Department",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-row",
                  name: "Employee 1",
                  parentNodeTypeName: "table",
                  children: [
                    {
                      type: "table-cell",
                      name: "Name Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Name Text",
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
                          name: "Email Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "john.doe@company.com",
                            text: "john.doe@company.com",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Department Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Department Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Engineering",
                            text: "Engineering",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-row",
                  name: "Employee 2",
                  parentNodeTypeName: "table",
                  children: [
                    {
                      type: "table-cell",
                      name: "Name Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Name Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Jane Smith",
                            text: "Jane Smith",
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
                          name: "Email Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "jane.smith@company.com",
                            text: "jane.smith@company.com",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Department Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Department Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Marketing",
                            text: "Marketing",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-row",
                  name: "Employee 3",
                  parentNodeTypeName: "table",
                  children: [
                    {
                      type: "table-cell",
                      name: "Name Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Name Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Bob Johnson",
                            text: "Bob Johnson",
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
                          name: "Email Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "bob.johnson@company.com",
                            text: "bob.johnson@company.com",
                          },
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      name: "Department Cell",
                      parentNodeTypeName: "table-row",
                      children: [
                        {
                          type: "text",
                          name: "Department Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Sales",
                            text: "Sales",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-row",
                  name: "Footer Row",
                  parentNodeTypeName: "table",
                  props: {
                    isFooter: true,
                  },
                  children: [
                    {
                      type: "table-cell",
                      name: "Footer Cell",
                      parentNodeTypeName: "table-row",
                      props: {
                        colspan: 3,
                      },
                      children: [
                        {
                          type: "text",
                          name: "Footer Text",
                          parentNodeTypeName: "table-cell",
                          props: {
                            content: "Total: 3 employees",
                            text: "Total: 3 employees",
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
