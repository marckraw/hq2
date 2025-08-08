import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const tableCellTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  // Map design intent to Storyblok design format
  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-table-cell")
    : undefined;

  // Transform cell content recursively
  const content = await Promise.all(
    (node.children || []).map((child) =>
      irfToStoryblokService.transformNodeToStoryblok(child, options)
    )
  );

  return {
    component: "sb-table-cell",
    design,
    custom_classname: node.props?.customClassname || "",

    // Cell content
    content,

    // Cell-specific properties (optional)
    colspan: node.props?.colspan || 1,
    rowspan: node.props?.rowspan || 1,
  };
};
