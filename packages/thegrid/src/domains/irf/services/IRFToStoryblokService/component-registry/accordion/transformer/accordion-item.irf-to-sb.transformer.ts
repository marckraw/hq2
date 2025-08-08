import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const accordionItemTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-accordion-item")
    : undefined;

  // Process slots if they exist
  if (node.slots) {
    const processedSlots = await irfToStoryblokService.processNodeSlots(
      node,
      options || {}
    );

    return {
      component: "sb-accordion-item",
      design,
      title: processedSlots.title || [],
      content: processedSlots.content || [],
      icon: processedSlots.icon || [],
    };
  }

  // Fallback to children for backward compatibility
  const children = await Promise.all(
    (node.children || []).map((child: IntermediateNode) =>
      irfToStoryblokService.transformNodeToStoryblok(child, options)
    )
  );

  return {
    component: "sb-accordion-item",
    design,
    content: children,
  };
};
