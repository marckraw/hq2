import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { logger } from "@/utils/logger";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const flexGroupTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  logger.user("This is node flex-group durin transformation", {
    node,
    options,
  });

  if (node.parentNodeTypeName === "section") {
    // mapping for sb-flex-group-section
    const design = node.design
      ? designIntentMapperService.map(node.design, "sb-flex-group")
      : undefined;

    return {
      component: "sb-flex-group-section",
      name: node.name || node.props?.name || "",
      design,
      content: await Promise.all(
        (node.children || []).map((child: IntermediateNode) =>
          irfToStoryblokService.transformNodeToStoryblok(child, options)
        )
      ),
      backpack_ai: node.props?.backpackAi || "",
      custom_classname: node.props?.customClassname || "",
    };
  } else {
    return {
      component: "sb-flex-group",
      error: "Flex-group node is not allowed in this context",
    };
  }
};
