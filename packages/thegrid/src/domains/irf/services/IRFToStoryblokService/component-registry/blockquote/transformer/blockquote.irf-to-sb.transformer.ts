import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const blockquoteTransformer: ComponentTransformer = async (
  node,
  _options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");

  const blockquoteContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            text:
              node.props?.content ||
              node.props?.quote ||
              node.props?.text ||
              node.name ||
              "",
            type: "text",
          },
        ],
      },
    ],
  };

  const blockquoteCitation = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            text: node.props?.citation || node.props?.author || "",
            type: "text",
          },
        ],
      },
    ],
  };

  const blockquoteCommonFields = {
    content: blockquoteContent,
    citation: blockquoteCitation,
    custom_classname: node.props?.customClassname || "",
  };

  if (node.parentNodeTypeName === "section") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-blockquote-section")
      : undefined;

    return {
      component: "sb-blockquote-section",
      design,
      ...blockquoteCommonFields,
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-blockquote-flex-group")
      : undefined;
    return {
      component: "sb-blockquote-flex-group",
      design,
      ...blockquoteCommonFields,
    };
  } else if (
    node.parentNodeTypeName === "accordion-item" ||
    node.parentNodeTypeName === "drawer"
  ) {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-blockquote")
      : undefined;
    return {
      component: "sb-blockquote",
      design,
      ...blockquoteCommonFields,
    };
  } else {
    return {
      component: "sb-blockquote",
      error: "Blockquote node is not allowed in this context",
    };
  }
};
