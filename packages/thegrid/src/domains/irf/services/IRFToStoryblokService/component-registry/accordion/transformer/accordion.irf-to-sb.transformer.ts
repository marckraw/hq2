import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const accordionTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");
  if (node.parentNodeTypeName === "section") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-accordion")
      : undefined;

    return {
      component: "sb-accordion-section",
      type: node.props?.type || "multiple",
      custom_classname: node.props?.customClassname || "",
      design,
      items: await Promise.all(
        (node.children || []).map((child: IntermediateNode) =>
          irfToStoryblokService.transformNodeToStoryblok(child, options)
        )
      ),
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-accordion")
      : undefined;

    return {
      component: "sb-accordion-flex-group",
      type: node.props?.type || "multiple",
      custom_classname: node.props?.customClassname || "",
      design,
      items: await Promise.all(
        (node.children || []).map((child: IntermediateNode) =>
          irfToStoryblokService.transformNodeToStoryblok(child, options)
        )
      ),
    };
  } else {
    return {
      component: "sb-accordion",
      error: "Accordion node is not allowed in this context",
    };
  }
};
