import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const pageTransformer: ComponentTransformer = async (node, options) => {
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  return {
    component: "page",

    body: await Promise.all(
      (node.children || []).map((child: IntermediateNode) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    ),
    no_index: Boolean(node.props?.noIndex),
    canonical: node.props?.canonical || {
      id: "",
      url: "",
      linktype: "story",
      fieldtype: "multilink",
      cached_url: "",
    },
    no_follow: Boolean(node.props?.noFollow),
    seo_meta_fields: node.props?.seoMetaFields || "",
    structured_data: node.props?.structuredData || "",
    background_color: node.props?.backgroundColor
      ? {
          title: "Standalone Backpack Color Picker",
          plugin: "backpack-color-picker",
          selected: {
            name: node.props.backgroundColor.name || "",
            value: node.props.backgroundColor.value || "",
          },
          description: "Standalone Backpack Color Picker",
        }
      : undefined,
  } as any;
};
