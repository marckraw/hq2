import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const dividerTransformer: ComponentTransformer = (node, _options) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");

  if (node.parentNodeTypeName === "section") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-divider-section")
      : undefined;

    return {
      component: "sb-divider-section",
      design,
    };
  } else if (node.parentNodeTypeName === "accordion-item") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-divider")
      : undefined;

    return {
      component: "sb-divider",
      design,
    };
  } else {
    return {
      component: "sb-divider",
      error: "Divider node is not allowed in this context",
    };
  }
};
