import { serviceRegistry } from "@/registry/service-registry";
import { logger } from "@/utils/logger";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

const _defaultImageFallback =
  "https://a.storyblok.com/f/226550/3740x1720/d32d60ca28/woods.jpg";

export const imageTransformer: ComponentTransformer = async (
  node,
  _options
) => {
  const assetService = serviceRegistry.get("asset");

  const imageRef = (
    node.design?.appearance?.backgroundColor as { imageRef: string }
  )?.imageRef;
  let storyblokImageUrl = _defaultImageFallback;

  if (imageRef) {
    storyblokImageUrl = await assetService.handleUpload(
      imageRef,
      node.name || "untitled"
    );
  }

  logger.info("This is storyblokImageUrl", { storyblokImageUrl });

  return {
    component: "sb-image-section",

    image: {
      alt: node.props?.alt || "",
      name: node.props?.name || "",
      focus: node.props?.focus || "",
      title: node.props?.title || "",
      source: node.props?.source || "",
      filename: storyblokImageUrl,
      copyright: "",
      fieldtype: "asset",
      meta_data: {},
      is_external_url: false,
    },
    quality: "",
    priority: false,
    smart_focus: false,
    custom_classname: "",
  };
};
