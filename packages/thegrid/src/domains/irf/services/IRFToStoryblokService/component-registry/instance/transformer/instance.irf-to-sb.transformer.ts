import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const instanceTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  return {
    component: "sb-component-instance",

    componentKey: node.componentKey,
    props: node.props,
    content: await Promise.all(
      (node.children || []).map((child: IntermediateNode) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    ),
  };
};
