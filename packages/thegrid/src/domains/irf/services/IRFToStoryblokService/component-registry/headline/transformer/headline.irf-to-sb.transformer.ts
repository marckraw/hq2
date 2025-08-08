import { serviceRegistry } from "@/registry/service-registry";
import { logger } from "@/utils/logger";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const headlineTransformer: ComponentTransformer = (node, _options) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");

  logger.user("This is node headline durin transformation", {
    node,
    _options,
  });

  if (node.parentNodeTypeName === "section") {
    // mapping for sb-headline-section
    // TODO: this design mapping should take into consideration placement of the headline node
    // especially for future one sb-headline schema
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-headline")
      : undefined;

    return {
      component: "sb-headline-section",

      design,
      as: node.props?.as || "h4",
      content:
        node.props?.content ||
        node.props?.title ||
        node.props?.headline ||
        node.name ||
        "",
      custom_classname: node.props?.customClassname || "",
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    // mapping for sb-headline-flex-group
    // TODO: this design mapping should take into consideration placement of the headline node
    // especially for future one sb-headline schema
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-headline")
      : undefined;

    return {
      component: "sb-headline-flex-group",

      design,
      as: node.props?.as || "h4",
      content:
        node.props?.content ||
        node.props?.title ||
        node.props?.headline ||
        node.name ||
        "",
      custom_classname: node.props?.customClassname || "",
    };
  } else {
    // Generic headline for other contexts (accordion-item, editorial-card, etc.)
    return {
      component: "sb-headline",
      content:
        node.props?.content ||
        node.props?.title ||
        node.props?.headline ||
        node.props?.text ||
        node.name ||
        "",
      as: node.props?.as || "h4",
    };
  }
};
