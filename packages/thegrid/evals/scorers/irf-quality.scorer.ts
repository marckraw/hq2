import type { Scorer } from "autoevals";
import { validateIRF } from "../../src/agent/factories/IRFArchitectAgent/validation";

// IRF-specific scorers for Evalite
export const IRFValidation: Scorer<any, {}> = async ({ output }) => {
  try {
    // Handle both direct IRF format and nested format with {irf: ..., storyblok: ...}
    const irfData = JSON.parse(output).irf;

    const validationResult = validateIRF(irfData);

    return {
      name: "IRFValidation",
      score: validationResult.isValid ? 1 : 0,
    };
  } catch (error) {
    return {
      name: "IRFValidation",
      score: 0,
    };
  }
};
