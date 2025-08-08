import { logger } from "@/utils/logger";
import { z } from "@hono/zod-openapi";
import {
  intermediateLayoutSchema,
  intermediateNodeSchema,
} from "../../../domains/irf/schema";
import type {
  IntermediateLayout,
  IntermediateNode,
} from "../../../domains/irf/schema.types";
import { zodIntrospectionService } from "../../../domains/irf/services/ZodIntrospectionService/zod-introspection.service";

export interface ValidationError {
  type: "schema" | "relationship" | "structural";
  path: string[];
  message: string;
  expected?: string;
  received?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fixedLayout?: IntermediateLayout;
}

/**
 * IRF Validation Service
 *
 * Comprehensive validator for IRF layouts using the closure service pattern.
 * Validates schema compliance, node relationships, and structural best practices.
 */
export const createIRFValidationService = () => {
  // Private state
  const validationStats = {
    totalValidations: 0,
    failedValidations: 0,
    commonErrors: new Map<string, number>(),
  };

  // Private helper functions
  const log = (message: string) => {
    logger.info(`[IRF_VALIDATION_SERVICE] ${message}`);
  };

  const updateStats = (result: ValidationResult) => {
    validationStats.totalValidations++;
    if (!result.isValid) {
      validationStats.failedValidations++;

      // Track common error types
      result.errors.forEach((error) => {
        const errorKey = `${error.type}:${error.message.split(" ")[0]}`;
        validationStats.commonErrors.set(
          errorKey,
          (validationStats.commonErrors.get(errorKey) || 0) + 1
        );
      });
    }
  };

  const formatZodErrors = (
    error: z.ZodError,
    basePath: string[] = []
  ): ValidationError[] => {
    return error.errors.map((err) => ({
      type: "schema" as const,
      path: [...basePath, ...err.path.map(String)],
      message: err.message,
      expected: getExpectedFromZodError(err),
      received: getReceivedFromZodError(err),
      suggestion: getSuggestionFromZodError(err),
    }));
  };

  const getExpectedFromZodError = (err: z.ZodIssue): string | undefined => {
    switch (err.code) {
      case "invalid_enum_value":
        return `One of: [${err.options.join(", ")}]`;
      case "invalid_type":
        return err.expected;
      case "invalid_literal":
        return String(err.expected);
      default:
        return undefined;
    }
  };

  const getReceivedFromZodError = (err: z.ZodIssue): string | undefined => {
    switch (err.code) {
      case "invalid_type":
        return (err as any).received
          ? String((err as any).received)
          : undefined;
      case "invalid_enum_value":
        return (err as any).received
          ? String((err as any).received)
          : undefined;
      default:
        return undefined;
    }
  };

  const getSuggestionFromZodError = (err: z.ZodIssue): string | undefined => {
    switch (err.code) {
      case "invalid_enum_value":
        return `Use one of the valid values: ${err.options.slice(0, 3).join(", ")}${err.options.length > 3 ? "..." : ""}`;
      case "invalid_type":
        return `Expected ${err.expected}, received ${err.received}`;
      case "too_small":
        return `Minimum ${err.minimum} ${err.type} required`;
      case "too_big":
        return `Maximum ${err.maximum} ${err.type} allowed`;
      default:
        return undefined;
    }
  };

  const validateNodes = (
    nodes: IntermediateNode[],
    path: string[],
    result: ValidationResult
  ): void => {
    nodes.forEach((node, index) => {
      const currentPath = [...path, index.toString()];

      // Validate node itself
      const nodeResult = intermediateNodeSchema.safeParse(node);
      if (!nodeResult.success) {
        result.isValid = false;
        result.errors.push(...formatZodErrors(nodeResult.error, currentPath));
        return;
      }

      // Validate children relationships
      if (node.children && node.children.length > 0) {
        validateChildrenRelationships(node, currentPath, result);
        // Recursively validate children
        validateNodes(node.children, [...currentPath, "children"], result);
      }
    });
  };

  const validateChildrenRelationships = (
    node: IntermediateNode,
    path: string[],
    result: ValidationResult
  ): void => {
    // Use the introspection service to get node information
    const nodeInfo = zodIntrospectionService.getNodeSchemaInfo(node.type);

    if (!nodeInfo) {
      result.warnings.push({
        type: "relationship",
        path,
        message: `Unknown node type: ${node.type}`,
        suggestion: `Consider using one of the known types: ${zodIntrospectionService.getAvailableNodeTypes().join(", ")}`,
      });
      return;
    }

    // If node has named slots, validate differently
    if (nodeInfo.hasNamedSlots) {
      validateNamedSlots(node, nodeInfo.allowedNamedSlots!, path, result);
      return;
    }

    // Regular children validation
    node.children?.forEach((child, childIndex) => {
      const isChildAllowed = zodIntrospectionService.isChildAllowed(
        node.type,
        child.type
      );
      if (!isChildAllowed) {
        result.isValid = false;
        result.errors.push({
          type: "relationship",
          path: [...path, "children", childIndex.toString()],
          message: `Node type '${child.type}' is not allowed as a child of '${node.type}'`,
          expected: `One of: [${nodeInfo.allowedChildren.join(", ")}]`,
          received: child.type,
          suggestion:
            nodeInfo.allowedChildren.length > 0
              ? `Try using one of these instead: ${nodeInfo.allowedChildren.slice(0, 3).join(", ")}${nodeInfo.allowedChildren.length > 3 ? "..." : ""}`
              : `Node type '${node.type}' cannot have children`,
        });
      }
    });

    // Warn if node has no allowed children but has children anyway
    if (!nodeInfo.hasChildren && node.children && node.children.length > 0) {
      result.warnings.push({
        type: "structural",
        path,
        message: `Node type '${node.type}' typically doesn't have children but contains ${node.children.length} child(ren)`,
        suggestion: `Consider removing children or changing node type`,
      });
    }
  };

  // Helper function to validate named slots
  const validateNamedSlots = (
    node: IntermediateNode,
    allowedNamedSlots: Record<string, any>,
    path: string[],
    result: ValidationResult
  ): void => {
    // Check if node has namedSlots property
    const namedSlots = (node as any).namedSlots;
    if (!namedSlots) {
      // Check if any slots are required
      const requiredSlots = Object.entries(allowedNamedSlots)
        .filter(([_, slotConfig]) => slotConfig.required)
        .map(([slotName, _]) => slotName);

      if (requiredSlots.length > 0) {
        result.isValid = false;
        result.errors.push({
          type: "structural",
          path,
          message: `Node type '${node.type}' is missing required named slots: ${requiredSlots.join(", ")}`,
          suggestion: `Add namedSlots property with required slots: ${requiredSlots.join(", ")}`,
        });
      }
      return;
    }

    // Validate each named slot
    Object.entries(namedSlots).forEach(([slotName, slotChildren]) => {
      const slotConfig = allowedNamedSlots[slotName];
      if (!slotConfig) {
        result.isValid = false;
        result.errors.push({
          type: "relationship",
          path: [...path, "namedSlots", slotName],
          message: `Unknown named slot '${slotName}' for node type '${node.type}'`,
          expected: `One of: [${Object.keys(allowedNamedSlots).join(", ")}]`,
          received: slotName,
        });
        return;
      }

      // Validate slot children
      if (Array.isArray(slotChildren)) {
        slotChildren.forEach((child: IntermediateNode, childIndex: number) => {
          const isChildAllowed = zodIntrospectionService.isChildAllowedInSlot(
            node.type,
            slotName,
            child.type
          );
          if (!isChildAllowed) {
            result.isValid = false;
            result.errors.push({
              type: "relationship",
              path: [...path, "namedSlots", slotName, childIndex.toString()],
              message: `Node type '${child.type}' is not allowed in slot '${slotName}' of '${node.type}'`,
              expected: `One of: [${slotConfig.allowedChildren.join(", ")}]`,
              received: child.type,
            });
          }
        });

        // Validate slot constraints
        if (
          slotConfig.minItems > 0 &&
          slotChildren.length < slotConfig.minItems
        ) {
          result.isValid = false;
          result.errors.push({
            type: "structural",
            path: [...path, "namedSlots", slotName],
            message: `Slot '${slotName}' requires at least ${slotConfig.minItems} items, but has ${slotChildren.length}`,
          });
        }

        if (
          slotConfig.maxItems !== null &&
          slotChildren.length > slotConfig.maxItems
        ) {
          result.isValid = false;
          result.errors.push({
            type: "structural",
            path: [...path, "namedSlots", slotName],
            message: `Slot '${slotName}' allows at most ${slotConfig.maxItems} items, but has ${slotChildren.length}`,
          });
        }
      }
    });
  };

  const validateLayoutStructure = (
    layout: IntermediateLayout,
    result: ValidationResult
  ): void => {
    // Check if layout has at least one page
    const hasPage = layout.content.some((node) => node.type === "page");
    if (!hasPage) {
      result.warnings.push({
        type: "structural",
        path: ["content"],
        message: "Layout doesn't contain a 'page' node at the root level",
        suggestion: "Consider wrapping your content in a 'page' node",
      });
    }

    // Check for empty content
    if (layout.content.length === 0) {
      result.isValid = false;
      result.errors.push({
        type: "structural",
        path: ["content"],
        message: "Layout content is empty",
        suggestion: "Add at least one node to the content array",
      });
    }

    // Validate version
    if (layout.version !== "1.0") {
      result.warnings.push({
        type: "structural",
        path: ["version"],
        message: `Layout version '${layout.version}' might not be supported`,
        expected: "1.0",
        received: layout.version,
      });
    }
  };

  // Public API
  const validate = (data: unknown): ValidationResult => {
    log("Starting IRF validation");

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Step 1: Basic schema validation
      const schemaResult = intermediateLayoutSchema.safeParse(data);

      if (!schemaResult.success) {
        log("Schema validation failed");
        result.isValid = false;
        result.errors.push(...formatZodErrors(schemaResult.error));
        updateStats(result);
        return result;
      }

      const layout = schemaResult.data;

      // Step 2: Validate node relationships and structure
      validateNodes(layout.content, [], result);

      // Step 3: Validate layout structure
      validateLayoutStructure(layout, result);

      // Update statistics
      updateStats(result);

      log(
        `Validation completed - ${result.isValid ? "PASSED" : "FAILED"} (${result.errors.length} errors, ${result.warnings.length} warnings)`
      );

      return result;
    } catch (error) {
      log(`Validation error: ${error}`);
      result.isValid = false;
      result.errors.push({
        type: "structural",
        path: [],
        message: `Validation failed: ${error}`,
        suggestion: "Check the input data format",
      });
      updateStats(result);
      return result;
    }
  };

  const generateFeedback = (validationResult: ValidationResult): string => {
    if (validationResult.isValid && validationResult.errors.length === 0) {
      return "✅ IRF Layout is valid!";
    }

    let feedback = "❌ The generated IRF layout has the following issues:\n\n";

    // Group errors by type
    const errorGroups = {
      schema: validationResult.errors.filter((e) => e.type === "schema"),
      relationship: validationResult.errors.filter(
        (e) => e.type === "relationship"
      ),
      structural: validationResult.errors.filter(
        (e) => e.type === "structural"
      ),
    };

    // Schema errors (most critical)
    if (errorGroups.schema.length > 0) {
      feedback += "🔴 **SCHEMA ERRORS** (Critical - must fix):\n";
      errorGroups.schema.forEach((error, i) => {
        feedback += `   ${i + 1}. At path: ${error.path.join(".")} - ${error.message}\n`;
        if (error.expected) feedback += `      Expected: ${error.expected}\n`;
        if (error.received) feedback += `      Received: ${error.received}\n`;
        if (error.suggestion) feedback += `      💡 ${error.suggestion}\n`;
      });
      feedback += "\n";
    }

    // Relationship errors
    if (errorGroups.relationship.length > 0) {
      feedback += "🟠 **RELATIONSHIP ERRORS** (Node hierarchy issues):\n";
      errorGroups.relationship.forEach((error, i) => {
        feedback += `   ${i + 1}. At path: ${error.path.join(".")} - ${error.message}\n`;
        if (error.suggestion) feedback += `      💡 ${error.suggestion}\n`;
      });
      feedback += "\n";
    }

    // Structural errors
    if (errorGroups.structural.length > 0) {
      feedback += "🟡 **STRUCTURAL ERRORS** (Best practices):\n";
      errorGroups.structural.forEach((error, i) => {
        feedback += `   ${i + 1}. At path: ${error.path.join(".")} - ${error.message}\n`;
        if (error.suggestion) feedback += `      💡 ${error.suggestion}\n`;
      });
      feedback += "\n";
    }

    // Add warnings if any
    if (validationResult.warnings.length > 0) {
      feedback += "⚠️ **WARNINGS** (Recommendations):\n";
      validationResult.warnings.forEach((warning, i) => {
        feedback += `   ${i + 1}. At path: ${warning.path.join(".")} - ${warning.message}\n`;
        if (warning.suggestion) feedback += `      💡 ${warning.suggestion}\n`;
      });
      feedback += "\n";
    }

    feedback += "Please fix these issues and regenerate the IRF layout.";
    return feedback;
  };

  const getValidationStats = () => {
    return {
      ...validationStats,
      successRate:
        validationStats.totalValidations > 0
          ? ((validationStats.totalValidations -
              validationStats.failedValidations) /
              validationStats.totalValidations) *
            100
          : 0,
      commonErrors: Object.fromEntries(validationStats.commonErrors),
    };
  };

  const clearStats = () => {
    validationStats.totalValidations = 0;
    validationStats.failedValidations = 0;
    validationStats.commonErrors.clear();
    log("Validation statistics cleared");
  };

  // Health check
  const isHealthy = async (): Promise<boolean> => {
    try {
      // Test with a simple valid IRF layout
      const testLayout: IntermediateLayout = {
        version: "1.0",
        name: "Test Layout",
        content: [
          {
            type: "page",
            name: "Test Page",
            children: [
              {
                type: "section",
                name: "Test Section",
                children: [
                  {
                    type: "headline",
                    name: "Test Headline",
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validate(testLayout);
      return result.isValid;
    } catch (error) {
      log(`Health check failed: ${error}`);
      return false;
    }
  };

  // Initialize the service
  log("IRF Validation service initialized");

  // Return public interface
  return {
    validate,
    generateFeedback,
    getValidationStats,
    clearStats,
    isHealthy,
  };
};

// Create and export the service instance
export const irfValidationService = createIRFValidationService();

// Convenience functions for backward compatibility
export const validateIRF = irfValidationService.validate;
export const generateAgentFeedback = irfValidationService.generateFeedback;
