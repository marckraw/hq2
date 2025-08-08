import type { Scorer } from "autoevals";

export const ComponentPresence: Scorer<any, {}> = async ({
  output,
  expected,
}) => {
  try {
    // Handle both direct IRF format and nested format with {irf: ..., storyblok: ...}
    const irfData = JSON.parse(output).irf;

    // Traverse IRF and collect component types
    const collectComponentTypes = (node: any): Set<string> => {
      const types = new Set<string>();

      if (node.type) {
        types.add(node.type);
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          const childTypes = collectComponentTypes(child);
          childTypes.forEach((type) => types.add(type));
        });
      }

      if (node.slots) {
        Object.values(node.slots).forEach((slotNodes: any) => {
          if (Array.isArray(slotNodes)) {
            slotNodes.forEach((slotNode: any) => {
              const slotTypes = collectComponentTypes(slotNode);
              slotTypes.forEach((type) => types.add(type));
            });
          }
        });
      }

      return types;
    };

    // Start from the IRF content array
    const allTypes = new Set<string>();
    if (irfData.content && Array.isArray(irfData.content)) {
      irfData.content.forEach((contentNode: any) => {
        const nodeTypes = collectComponentTypes(contentNode);
        nodeTypes.forEach((type) => allTypes.add(type));
      });
    }

    // Check expected components
    let score = 1;

    if (expected.hasPage && !allTypes.has("page")) score = 0;
    if (expected.hasSection && !allTypes.has("section")) score = 0;
    if (expected.hasHeadline && !allTypes.has("headline")) score = 0;
    if (expected.hasImage && !allTypes.has("image")) score = 0;
    if (expected.hasForm && !allTypes.has("form")) score = 0;

    return {
      name: "ComponentPresence",
      score,
    };
  } catch (error) {
    return {
      name: "ComponentPresence",
      score: 0,
    };
  }
};
