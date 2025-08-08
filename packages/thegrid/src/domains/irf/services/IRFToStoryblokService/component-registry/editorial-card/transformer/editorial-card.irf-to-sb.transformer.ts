import { serviceRegistry } from "@/registry/service-registry";
import {
  ComponentTransformer,
  StoryblokComponent,
} from "../../../irf-to-storyblok.service.types";

const _defaultImageFallback =
  "https://a.storyblok.com/f/226550/3740x1720/d32d60ca28/woods.jpg";

export const editorialCardTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const assetService = serviceRegistry.get("asset");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-editorial-card")
    : undefined;

  let card_title: StoryblokComponent[] = [];
  let card_body: StoryblokComponent[] = [];
  const card_image: StoryblokComponent[] = [];

  // Process slots if they exist
  if (node.slots) {
    const processedSlots = await irfToStoryblokService.processNodeSlots(
      node,
      options || {}
    );

    // Transform slot content to match expected structure
    card_title = (processedSlots.card_title || []).map((item) => ({
      component: "sb-card-title",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: item.content || item.props?.text || item.name || "",
                type: "text",
              },
            ],
          },
        ],
      },
    }));

    card_body = (processedSlots.card_body || []).map((item) => ({
      component: "sb-card-body",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: item.content || item.props?.text || item.name || "",
                type: "text",
              },
            ],
          },
        ],
      },
    }));

    // Process images from card_image slot
    for (const imageItem of processedSlots.card_image || []) {
      // If the slot item is already a processed image component
      if (imageItem.component === "sb-image-section") {
        card_image.push({
          component: "sb-image-card",
          image: imageItem.image,
        });
      }
    }
  } else {
    // Fallback to old behavior for backward compatibility
    for (const child of node.children || []) {
      if (child.type === "headline") {
        card_title.push({
          component: "sb-card-title",
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  { text: child.props?.text || child.name, type: "text" },
                ],
              },
            ],
          },
        });
      } else if (child.type === "text") {
        card_body.push({
          component: "sb-card-body",
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  { text: child.props?.text || child.name, type: "text" },
                ],
              },
            ],
          },
        });
      } else if (child.aiInsights?.suggestedType === "image") {
        const imageRef = (
          child.design?.appearance?.backgroundColor as {
            imageRef: string;
          }
        )?.imageRef;
        let storyblokImageUrl = _defaultImageFallback;

        if (imageRef) {
          storyblokImageUrl = await assetService.handleUpload(
            imageRef,
            child.name || "untitled-card-image"
          );
        }

        card_image.push({
          component: "sb-image-card",
          image: {
            id: undefined,
            alt: child.props?.alt,
            name: child.name,
            focus: undefined,
            title: child.name,
            source: undefined,
            filename: storyblokImageUrl,
            copyright: undefined,
            fieldtype: "asset",
            meta_data: {},
            is_external_url: false,
          },
        });
      }
    }
  }

  return {
    component: "sb-editorial-card",

    design,
    card_title,
    card_body,
    card_image,
    card_link: node.props?.cardLink ||
      node.props?.card_link || {
        id: "",
        url: "",
        linktype: "story",
        fieldtype: "multilink",
        cached_url: "",
      },
  };
};
