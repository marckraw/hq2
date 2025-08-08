import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const alertTransformer: ComponentTransformer = async (
  node,
  _options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");

  // Alert expects bloks (arrays of components), not direct richtext
  const alertTitle = [
    {
      component: "sb-body-text",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: node.props?.title || node.name || "Alert Title",
                type: "text",
              },
            ],
          },
        ],
      },
    },
  ];

  const alertContent = [
    {
      component: "sb-body-text",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: node.props?.content || "Alert content",
                type: "text",
              },
            ],
          },
        ],
      },
    },
  ];

  const alertCommonFields = {
    title: alertTitle,
    content: alertContent,
    custom_classname: node.props?.customClassname || "",
  };

  if (node.parentNodeTypeName === "section") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-alert-section")
      : undefined;

    return {
      component: "sb-alert-section",
      design,
      ...alertCommonFields,
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-alert-section")
      : undefined;

    return {
      component: "sb-alert-section",
      design,
      ...alertCommonFields,
    };
  } else {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-alert")
      : undefined;

    return {
      component: "sb-alert",
      design,
      ...alertCommonFields,
    };
  }
};
