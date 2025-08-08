import type { Scorer } from "autoevals";

export const DesignIntentMatch: Scorer<any, {}> = async ({
  output,
  expected,
}) => {
  try {
    // Handle both direct IRF format and nested format with {irf: ..., storyblok: ...}
    const irfData = output.irf || output;

    // Find all design intent objects in the IRF
    const findDesignIntents = (node: any): any[] => {
      let designs: any[] = [];

      if (node.design) {
        designs.push(node.design);
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          designs = designs.concat(findDesignIntents(child));
        });
      }

      if (node.slots) {
        Object.values(node.slots).forEach((slotNodes: any) => {
          if (Array.isArray(slotNodes)) {
            slotNodes.forEach((slotNode: any) => {
              designs = designs.concat(findDesignIntents(slotNode));
            });
          }
        });
      }

      return designs;
    };

    // Collect all design intents from the IRF
    let allDesigns: any[] = [];
    if (irfData.content && Array.isArray(irfData.content)) {
      irfData.content.forEach((contentNode: any) => {
        allDesigns = allDesigns.concat(findDesignIntents(contentNode));
      });
    }

    // Check if we have design intent when expected
    if (expected.hasDesignIntent) {
      const score = allDesigns.length > 0 ? 1 : 0;
      return {
        name: "DesignIntentMatch",
        score,
      };
    }

    // If no specific design intent expectations, return success
    return {
      name: "DesignIntentMatch",
      score: 1,
    };
  } catch (error) {
    return {
      name: "DesignIntentMatch",
      score: 0,
    };
  }
};
