import { IntermediateLayout } from "../../../../../schema.types";

/**
 * Button group in section with multiple buttons
 */
export const buttonGroupInSection: IntermediateLayout = {
  version: "1.0",
  name: "Button group in section",
  content: [
    {
      type: "page",
      name: "Button group in section",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "button-group",
              name: "Button Group",
              parentNodeTypeName: "section",
              props: {
                layout: "pack",
                align: "start",
              },
              children: [
                {
                  type: "button",
                  name: "Primary Button",
                  parentNodeTypeName: "button-group",
                  props: {
                    text: "Primary Button",
                    variant: "primary",
                    size: "medium",
                  },
                },
                {
                  type: "button",
                  name: "Secondary Button",
                  parentNodeTypeName: "button-group",
                  props: {
                    text: "Secondary Button",
                    variant: "secondary",
                    size: "medium",
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

/**
 * Button group in flex-group with multiple buttons
 */
export const buttonGroupInFlexGroup: IntermediateLayout = {
  version: "1.0",
  name: "Button group in flex group",
  content: [
    {
      type: "page",
      name: "Button group in flex group",
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
                  type: "button-group",
                  name: "Button Group",
                  parentNodeTypeName: "flex-group",
                  props: {
                    layout: "stack",
                    align: "center",
                  },
                  children: [
                    {
                      type: "button",
                      name: "Action Button",
                      parentNodeTypeName: "button-group",
                      props: {
                        text: "Action Button",
                        variant: "primary",
                        size: "large",
                        icon: "arrow-right",
                        iconPosition: "right",
                      },
                    },
                    {
                      type: "button",
                      name: "Cancel Button",
                      parentNodeTypeName: "button-group",
                      props: {
                        text: "Cancel",
                        variant: "outline",
                        size: "large",
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

/**
 * Button group with comprehensive props testing
 */
export const buttonGroupWithVariousProps: IntermediateLayout = {
  version: "1.0",
  name: "Button group with various props",
  content: [
    {
      type: "page",
      name: "Button group with various props",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "button-group",
              name: "Advanced Button Group",
              parentNodeTypeName: "section",
              props: {
                layout: "pack",
                align: "end",
                customClassname: "my-button-group",
              },
              children: [
                {
                  type: "button",
                  name: "Link Button",
                  parentNodeTypeName: "button-group",
                  props: {
                    text: "Visit Website",
                    variant: "primary",
                    size: "small",
                    href: "https://example.com",
                    target: "_blank",
                    icon: "external-link",
                    iconPosition: "left",
                  },
                },
                {
                  type: "button",
                  name: "Disabled Button",
                  parentNodeTypeName: "button-group",
                  props: {
                    text: "Disabled",
                    variant: "secondary",
                    size: "small",
                    disabled: true,
                  },
                },
                {
                  type: "button",
                  name: "Loading Button",
                  parentNodeTypeName: "button-group",
                  props: {
                    text: "Loading...",
                    variant: "ghost",
                    size: "small",
                    loading: true,
                    customClassname: "loading-btn",
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

/**
 * Minimal button group (testing defaults)
 */
export const minimalButtonGroup: IntermediateLayout = {
  version: "1.0",
  name: "Minimal button group",
  content: [
    {
      type: "page",
      name: "Minimal button group",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "button-group",
              name: "Simple Group",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "button",
                  name: "Simple Button",
                  parentNodeTypeName: "button-group",
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
 * Button group with drawer action
 */
export const buttonGroupWithDrawer: IntermediateLayout = {
  version: "1.0",
  name: "Button group with drawer",
  content: [
    {
      type: "page",
      name: "Button group with drawer",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "button-group",
              name: "Button Group with Drawer",
              parentNodeTypeName: "section",
              props: {
                layout: "pack",
                align: "center",
              },
              children: [
                {
                  type: "button",
                  name: "Open Drawer",
                  props: {
                    text: "Open Details",
                  },
                  children: [
                    {
                      type: "drawer",
                      name: "Details Drawer",
                      props: {
                        title: "Product Details",
                        subtitle: "Learn more about this product",
                        direction: "right",
                      },
                      children: [
                        {
                          type: "headline",
                          name: "Drawer Headline",
                          props: {
                            content: "Welcome to the Drawer",
                            level: "h2",
                          },
                        },
                        {
                          type: "text",
                          name: "Drawer Text",
                          props: {
                            content: "This is the content inside the drawer.",
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
 * Button group with drawer containing blockquote (Einstein quote)
 */
export const buttonGroupWithDrawerBlockquote: IntermediateLayout = {
  version: "1.0",
  name: "Button group with drawer blockquote",
  content: [
    {
      type: "page",
      name: "Button group with drawer blockquote",
      children: [
        {
          type: "section",
          name: "Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "button-group",
              name: "Button Group with Drawer Quote",
              parentNodeTypeName: "section",
              props: {
                layout: "pack",
                align: "start",
              },
              children: [
                {
                  type: "button",
                  name: "Test Button",
                  props: {
                    text: "TEST",
                  },
                  children: [
                    {
                      type: "drawer",
                      name: "Quote Drawer",
                      props: {
                        title: "Inspirational Quote",
                        subtitle: "Words of wisdom",
                        direction: "bottom",
                      },
                      children: [
                        {
                          type: "blockquote",
                          name: "Einstein Quote",
                          parentNodeTypeName: "drawer",
                          props: {
                            content:
                              "Imagination is more important than knowledge.",
                            citation: "Albert Einstein",
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
