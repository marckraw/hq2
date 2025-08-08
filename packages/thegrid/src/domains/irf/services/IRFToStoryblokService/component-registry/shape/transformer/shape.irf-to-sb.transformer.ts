import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const shapeTransformer: ComponentTransformer = (node, _options) => ({
  component: "sb-shape",

  type: node.props?.type || "rectangle",
  background: node.design?.background,
  borderRadius: node.design?.borderRadius,
});
