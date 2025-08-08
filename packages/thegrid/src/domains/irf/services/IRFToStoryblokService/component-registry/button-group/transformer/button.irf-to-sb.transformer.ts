import { IntermediateNode } from "@/domains/irf/schema.types";
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../../../irf-to-storyblok.service.types";

export const buttonTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  const design = node.design
    ? designIntentMapperService.map(node.design, "sb-button")
    : undefined;

  // Process children for rich content (text, icons, etc.) - excluding drawer children
  const content = await Promise.all(
    (node.children || [])
      .filter((child) => child.type !== "drawer")
      .map((child: IntermediateNode) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
  );

  // Create action based on button type
  const action = [];

  // Check if button has a drawer child
  const drawerChild = node.children?.find((child) => child.type === "drawer");

  if (drawerChild) {
    // Drawer button - transform drawer child to sb-drawer action
    const drawerContent = await Promise.all(
      (drawerChild.children || []).map((child: IntermediateNode) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    );

    action.push({
      component: "sb-drawer",
      title: drawerChild.props?.title || "",
      subtitle: drawerChild.props?.subtitle || "",
      content: drawerContent,
      design: drawerChild.design
        ? designIntentMapperService.map(drawerChild.design, "sb-drawer")
        : undefined,
    });
  } else if (node.props?.href) {
    // Link button with proper multilink structure
    const href = node.props.href;
    const isExternalLink =
      href.startsWith("http") || href.startsWith("//") || href.includes(".");
    const linktype = isExternalLink ? "url" : "story";

    action.push({
      component: "sb-link-button",
      link: {
        id: linktype === "story" ? href : "",
        url: linktype === "url" ? href : "",
        linktype,
        fieldtype: "multilink",
        cached_url: href,
        target: node.props.target || "_self",
      },
    });
  } else {
    // Default button action
    action.push({
      component: "sb-submit-button",
    });
  }

  return {
    component: "sb-button",
    content:
      content.length > 0
        ? content
        : [
            {
              component: "sb-text-button",
              text: node.props?.text || node.name || "Button",
            },
          ],
    action,
    aria_label: node.props?.ariaLabel || "",
    aria_labelledby: node.props?.ariaLabelledby || "",
    custom_classname: node.props?.customClassname || "",
    design,
  };
};
