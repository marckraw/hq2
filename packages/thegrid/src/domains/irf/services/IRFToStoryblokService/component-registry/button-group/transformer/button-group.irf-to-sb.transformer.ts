import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const buttonGroupTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  // Common fields for all contexts
  const commonFields = {
    layout: node.props?.layout || "pack",
    align: node.props?.align || "start",
    custom_classname: node.props?.customClassname || "",
    design: node.design
      ? designIntentMapperService.map(node.design, "sb-button-group")
      : undefined,
    buttons: await Promise.all(
      (node.children || []).map((child: IntermediateNode) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    ),
  };

  // Parent context determines output component
  if (node.parentNodeTypeName === "section") {
    return {
      component: "sb-button-group-section",
      ...commonFields,
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    return {
      component: "sb-button-group-flex-group",
      ...commonFields,
    };
  } else {
    return {
      component: "sb-button-group",
      ...commonFields,
    };
  }
};
