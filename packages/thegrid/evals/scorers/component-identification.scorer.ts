import type { Scorer } from "autoevals";

export const ComponentIdentificationScorer: Scorer<any, {}> = async ({
  output,
  expected,
}) => {
  try {
    const parsedOutput = JSON.parse(output);
    const components = parsedOutput.components || [];

    // Must include all expected components
    const missingRequired = expected.expectedComponents.filter(
      (comp: string) => !components.includes(comp)
    );

    // Should not include forbidden components
    const includedForbidden = expected.forbiddenComponents
      ? expected.forbiddenComponents.filter((comp: string) =>
          components.includes(comp)
        )
      : [];

    // Calculate score - perfect score only if no missing required and no forbidden included
    const score =
      missingRequired.length === 0 && includedForbidden.length === 0 ? 1 : 0;

    return {
      name: "ComponentIdentification",
      score,
      details: {
        identifiedComponents: components,
        missingRequired,
        includedForbidden,
        totalIdentified: components.length,
      },
    };
  } catch (error) {
    return {
      name: "ComponentIdentification",
      score: 0,
      details: { error: "Failed to parse JSON output" },
    };
  }
};
