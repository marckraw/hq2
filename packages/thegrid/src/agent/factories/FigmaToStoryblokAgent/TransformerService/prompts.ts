import {
  RecognizerContext,
  type SimplifiedFigmaNode,
} from "./transformer.service.types";

export const generateAIInsightsPrompt = (
  node: SimplifiedFigmaNode,
  availableComponents: string[],
  extractedDesign: Record<string, any>,
  resolvedStyles: Record<string, any>,
  _ctx: RecognizerContext,
  _currentType?: string
) => {
  // Extract key styling information
  const fontSize =
    (resolvedStyles.fontSize as number) || (extractedDesign.fontSize as number);
  const fontWeight =
    (resolvedStyles.fontWeight as number) ||
    (extractedDesign.fontWeight as number);
  const textLength = node.text?.length || 0;
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const hasImageFills = Boolean(
    node.fills &&
      Array.isArray(node.fills) &&
      node.fills.some((fill: any) => fill.type === "IMAGE")
  );

  return `Analyze this Figma node and choose the BEST component type from the available list.

**Node:** ${node.name} (${node.type})
**Available Types:** ${availableComponents.join(", ")}

**KEY DECISION RULES:**

🔤 **TEXT vs HEADLINE:**
- Use "headline" if: fontSize ≥ 24px OR fontWeight ≥ 600 OR text length < 50 chars OR name suggests title/heading
- Use "text" if: fontSize < 24px AND fontWeight < 600 AND text length ≥ 50 chars

🖼️ **IMAGE vs SHAPE:**
- Use "image" if: has image fills OR name contains "image/photo/picture"
- Use "shape" if: has background color/gradient fills OR geometric name

🎁 **SECTION vs GROUP:**
- Use "section" if: has padding/spacing OR name suggests semantic section
- Use "group" if: just visual grouping without semantic meaning

🔘 **BUTTON vs LINK:**
- Use "button" if: has background + padding + border-radius OR name contains "button/btn"
- Use "link" if: text-only with underline OR name contains "link"

**Current Node Analysis:**
- Text: "${node.text?.slice(0, 100) || "N/A"}"
- Font Size: ${fontSize || "unknown"}px
- Font Weight: ${fontWeight || "unknown"}
- Text Length: ${textLength} chars
- Has Children: ${hasChildren}
- Has Images: ${hasImageFills}
- Name Pattern: ${node.name.toLowerCase()}

**Quick Decision:**
${getQuickSuggestion(node, fontSize, fontWeight, textLength, hasImageFills, availableComponents)}

Return ONLY JSON:
{
  "componentName": "exact_type_from_available_list",
  "confidence": 0.8,
  "reasoning": "brief_explanation_focusing_on_key_criteria"
}`;
};

// Helper function to provide quick suggestions based on rules
function getQuickSuggestion(
  node: SimplifiedFigmaNode,
  fontSize: number | undefined,
  fontWeight: number | undefined,
  textLength: number,
  hasImageFills: boolean,
  availableComponents: string[]
): string {
  const name = node.name.toLowerCase();

  // Page detection - 100% confidence
  if (node.type === "PAGE" && availableComponents.includes("page")) {
    return "CERTAIN: page (Figma page type)";
  }

  // Image detection
  if (
    hasImageFills ||
    ["image", "photo", "picture", "img"].some((keyword) =>
      name.includes(keyword)
    )
  ) {
    return availableComponents.includes("image") ? "LIKELY: image" : "";
  }

  // Button detection
  if (
    ["button", "btn", "cta", "action"].some((keyword) => name.includes(keyword))
  ) {
    return availableComponents.includes("button") ? "LIKELY: button" : "";
  }

  // Headline vs text detection
  if (node.type === "TEXT" && node.text) {
    const isLargeFont = fontSize && fontSize >= 24;
    const isBold = fontWeight && fontWeight >= 600;
    const isShort = textLength < 50;
    const hasHeadlineKeywords = [
      "title",
      "headline",
      "heading",
      "header",
      "h1",
      "h2",
      "h3",
    ].some((keyword) => name.includes(keyword));

    if (
      (isLargeFont || isBold || isShort || hasHeadlineKeywords) &&
      availableComponents.includes("headline")
    ) {
      return "LIKELY: headline (large/bold/short text)";
    } else if (availableComponents.includes("text")) {
      return "LIKELY: text (regular paragraph)";
    }
  }

  // Section detection
  if (
    ["section", "container", "wrapper", "area"].some((keyword) =>
      name.includes(keyword)
    )
  ) {
    return availableComponents.includes("section") ? "LIKELY: section" : "";
  }

  return "ANALYZE using rules above";
}
