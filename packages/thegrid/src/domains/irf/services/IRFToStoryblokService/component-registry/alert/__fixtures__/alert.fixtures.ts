import type { IntermediateLayout } from "../../../../../schema.types";

/**
 * Alert component test data for IRF to Storyblok transformation tests
 * Following the Component Mapping Guide structure
 */

export const alertInSectionData: IntermediateLayout = {
  version: "1.0",
  name: "Alert in Section",
  content: [
    {
      type: "page",
      name: "Alert Test Page",
      children: [
        {
          type: "section",
          name: "Alert Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "alert",
              name: "Important Notice",
              parentNodeTypeName: "section",
              props: {
                title: "Important Notice",
                content:
                  "This is an important message that users should be aware of.",
                intent: "info",
                withPointer: false,
                customClassname: "custom-alert-class",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const alertInFlexGroupData: IntermediateLayout = {
  version: "1.0",
  name: "Alert in Flex Group",
  content: [
    {
      type: "page",
      name: "Alert Flex Page",
      children: [
        {
          type: "section",
          name: "Container Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "flex-group",
              name: "Alert Container",
              parentNodeTypeName: "section",
              children: [
                {
                  type: "alert",
                  name: "Warning Alert",
                  parentNodeTypeName: "flex-group",
                  props: {
                    title: "Warning Alert",
                    content:
                      "This is a warning message displayed in a flex group.",
                    intent: "warning",
                    withPointer: true,
                    pointerSide: "topStart",
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

export const multipleAlertsData: IntermediateLayout = {
  version: "1.0",
  name: "Multiple Alerts",
  content: [
    {
      type: "page",
      name: "Multiple Alerts Page",
      children: [
        {
          type: "section",
          name: "Alerts Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "alert",
              name: "Success Alert",
              parentNodeTypeName: "section",
              props: {
                title: "Success!",
                content: "Your operation was completed successfully.",
                intent: "success",
                withPointer: false,
              },
            },
            {
              type: "alert",
              name: "Error Alert",
              parentNodeTypeName: "section",
              props: {
                title: "Error",
                content: "An error occurred while processing your request.",
                intent: "attention",
                withPointer: true,
                pointerSide: "bottomCenter",
              },
            },
            {
              type: "text",
              name: "Additional Info",
              parentNodeTypeName: "section",
              props: {
                content:
                  "Please check the alerts above for important information.",
                text: "Please check the alerts above for important information.",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const alertWithDesignData: IntermediateLayout = {
  version: "1.0",
  name: "Alert with Design",
  content: [
    {
      type: "page",
      name: "Styled Alert Page",
      children: [
        {
          type: "section",
          name: "Styled Section",
          parentNodeTypeName: "page",
          children: [
            {
              type: "alert",
              name: "Styled Alert",
              parentNodeTypeName: "section",
              props: {
                title: "Styled Alert",
                content: "This alert has custom styling applied to it.",
                intent: "info",
                withPointer: true,
                pointerSide: "left",
              },
              design: {
                spacing: {
                  padding: {
                    top: "m",
                    right: "l",
                    bottom: "m",
                    left: "l",
                  },
                  margin: {
                    top: "s",
                    bottom: "s",
                  },
                },
                appearance: {
                  backgroundColor: {
                    colorRef: "system-blue-100",
                  },
                },
              },
            },
          ],
        },
      ],
    },
  ],
};

export const standaloneAlertData: IntermediateLayout = {
  version: "1.0",
  name: "Standalone Alert",
  content: [
    {
      type: "page",
      name: "Standalone Alert Page",
      children: [
        {
          type: "alert",
          name: "Standalone Alert",
          props: {
            title: "Standalone Alert",
            content: "This is a standalone alert without a parent section.",
            intent: "warning",
            withPointer: false,
          },
        },
      ],
    },
  ],
};
