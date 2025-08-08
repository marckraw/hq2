import { IntermediateNode } from "@/domains/irf/schema.types";
import { logger } from "@/utils/logger";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const listItemTransformer: ComponentTransformer = (
  node: IntermediateNode,
  _options
) => {
  const generateChildren = (children: IntermediateNode[]) => {
    return children?.map((child: IntermediateNode) => {
      logger.user("This is amazing child", { child });

      if (child.type === "headline") {
        return {
          component: "sb-headline-flex-group",
          as: "h4",
          content:
            child.props?.title ||
            child.props?.text ||
            "No headline for the list item",
        };
      } else {
        return {
          component: "sb-text-flex-group",
          content:
            child.props?.paragraph ||
            child.props?.text ||
            "No text for the list item",
        };
      }
    });
  };

  logger.info("[irfToStoryblok] list-item node", { node });
  logger.info("--- end of node ---");
  return {
    component: "sb-list-item",

    content: [
      {
        component: "sb-flex-group",
        content: [...generateChildren(node.children || [])],
      },
    ],
    // items: (node.children || []).map((child) =>
    //   transformNodeToStoryblok(child, options)
    // ),
  };
};
