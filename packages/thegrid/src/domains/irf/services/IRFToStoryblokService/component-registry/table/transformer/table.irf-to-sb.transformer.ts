import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const tableTransformer: ComponentTransformer = async (node, options) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  // Map design intent to Storyblok design format
  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-table")
    : undefined;

  // Common fields for all contexts
  const commonFields = {
    design,
    custom_classname: node.props?.customClassname || "",

    // Table-specific properties from IRF props
    filled: node.props?.filled || false,
    striped: node.props?.striped || false,
    bordered: node.props?.bordered || false,
    enableHeader: node.props?.enableHeader || true,
    enableFooter: node.props?.enableFooter || false,
    layoutAuto: node.props?.layoutAuto || false,
    alignCellsTop: node.props?.alignCellsTop || false,

    // Transform table rows recursively
    rows: await Promise.all(
      (node.children || []).map((child) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    ),
  };

  // Parent context determines output component (following the pattern)
  if (node.parentNodeTypeName === "section") {
    return {
      component: "sb-table-section",
      ...commonFields,
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    return {
      component: "sb-table-flex-group",
      ...commonFields,
    };
  } else {
    // Fallback - should rarely happen
    return {
      component: "sb-table",
      ...commonFields,
    };
  }
};
