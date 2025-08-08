import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const textTransformer: ComponentTransformer = async (node, _options) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");

  if (node.parentNodeTypeName === "section") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-text")
      : undefined;

    return {
      component: "sb-text-section",

      design,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text:
                  node.props?.content || node.props?.text || node.name || "",
                type: "text",
              },
            ],
          },
        ],
      },
      custom_classname: node.props?.customClassname || "",
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-text")
      : undefined;

    return {
      component: "sb-text-flex-group",

      design,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text:
                  node.props?.content || node.props?.text || node.name || "",
                type: "text",
              },
            ],
          },
        ],
      },
      custom_classname: node.props?.customClassname || "",
    };
  } else {
    // Generic text for other contexts (accordion-item, editorial-card, etc.)
    return {
      component: "sb-text",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text:
                  node.props?.content || node.props?.text || node.name || "",
                type: "text",
              },
            ],
          },
        ],
      },
    };
  }
};
