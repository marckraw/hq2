import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const listTransformer: ComponentTransformer = async (node, options) => {
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  if (node.parentNodeTypeName === "section") {
    return {
      component: "sb-list-section",
      items: await Promise.all(
        (node.children || []).map((child: IntermediateNode) =>
          irfToStoryblokService.transformNodeToStoryblok(child, options)
        )
      ),
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    return {
      component: "sb-list-flex-group",
      items: await Promise.all(
        (node.children || []).map((child: IntermediateNode) =>
          irfToStoryblokService.transformNodeToStoryblok(child, options)
        )
      ),
    };
  } else {
    return {
      component: "sb-list",
      error: "List node is not allowed in this context",
    };
  }
};
