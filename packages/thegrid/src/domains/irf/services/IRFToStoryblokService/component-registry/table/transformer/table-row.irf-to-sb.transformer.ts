import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const tableRowTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  // Map design intent to Storyblok design format
  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-table-row")
    : undefined;

  // Transform table cells recursively
  const cells = await Promise.all(
    (node.children || []).map((child) =>
      irfToStoryblokService.transformNodeToStoryblok(child, options)
    )
  );

  return {
    component: "sb-table-row",
    design,
    custom_classname: node.props?.customClassname || "",

    // Table row specific properties
    is_header: node.props?.isHeader || false,
    is_footer: node.props?.isFooter || false,

    // Cells array
    cells,

    // Also include as columns (seems to be duplicate structure in Storyblok)
    columns: cells,
  };
};
