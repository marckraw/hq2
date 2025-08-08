import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { logger } from "@/utils/logger";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const sectionTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");

  logger.info("This is node sb-section", { design: node.design });
  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-section")
    : undefined;

  return {
    component: "sb-section",
    name: node.name !== undefined ? node.name : node.props?.name || "",
    design,
    content: await Promise.all(
      (node.children || []).map((child: IntermediateNode) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    ),
    backpack_ai: node.props?.backpackAi || "",
    custom_classname: node.props?.customClassname || "",
  };
};
