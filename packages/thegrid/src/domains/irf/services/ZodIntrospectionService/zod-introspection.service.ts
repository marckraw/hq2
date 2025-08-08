import { z } from "@hono/zod-openapi";
import { nodesRegistrySchema } from "../../nodes-registry.schema";

/**
 * Zod Schema Introspection Service
 *
 * Provides utilities to extract information from Zod schemas at runtime.
 * This service handles all the complexity of Zod introspection so other parts
 * of the system can work with plain objects and arrays.
 */

export interface SlotConfiguration {
  description: string;
  allowedChildren: string[];
  required: boolean;
  maxItems: number | null;
  minItems: number;
}

export interface NodeSchemaInfo {
  name: string;
  description: string;
  allowedChildren: string[];
  allowedNamedSlots: Record<string, SlotConfiguration> | null;
  props: Record<string, string>;
  hasChildren: boolean;
  hasNamedSlots: boolean;
}

export const createZodIntrospectionService = () => {
  /**
   * Extract allowed children from a Zod schema
   */
  const extractAllowedChildren = (schema: z.ZodTypeAny): string[] => {
    if (schema instanceof z.ZodObject) {
      const allowedChildrenProp = schema.shape.allowedChildren;
      if (allowedChildrenProp instanceof z.ZodTuple) {
        return allowedChildrenProp.items.map(
          (item: z.ZodLiteral<string>) => item.value
        );
      }
      if (allowedChildrenProp instanceof z.ZodArray) {
        // Handle array case if needed in the future
        return [];
      }
    }
    return [];
  };

  /**
   * Extract named slots configuration from a Zod schema
   */
  const extractAllowedNamedSlots = (
    schema: z.ZodTypeAny
  ): Record<string, SlotConfiguration> | null => {
    if (schema instanceof z.ZodObject) {
      const namedSlotsProp = schema.shape.allowedNamedSlots;
      if (namedSlotsProp instanceof z.ZodObject) {
        const slots: Record<string, SlotConfiguration> = {};

        Object.entries(namedSlotsProp.shape).forEach(
          ([slotName, slotSchema]) => {
            if (slotSchema instanceof z.ZodObject) {
              const slotShape = slotSchema.shape;
              slots[slotName] = {
                description:
                  slotShape.description instanceof z.ZodLiteral
                    ? slotShape.description.value
                    : "",
                allowedChildren:
                  slotShape.allowedChildren instanceof z.ZodTuple
                    ? slotShape.allowedChildren.items.map(
                        (item: z.ZodLiteral<string>) => item.value
                      )
                    : [],
                required:
                  slotShape.required instanceof z.ZodLiteral
                    ? slotShape.required.value
                    : false,
                maxItems:
                  slotShape.maxItems instanceof z.ZodNull
                    ? null
                    : slotShape.maxItems instanceof z.ZodLiteral
                      ? slotShape.maxItems.value
                      : null,
                minItems:
                  slotShape.minItems instanceof z.ZodLiteral
                    ? slotShape.minItems.value
                    : 0,
              };
            }
          }
        );

        return slots;
      }
    }
    return null;
  };

  /**
   * Extract props configuration from a Zod schema
   */
  const extractProps = (schema: z.ZodTypeAny): Record<string, string> => {
    if (schema instanceof z.ZodObject) {
      const propsProp = schema.shape.props;
      if (propsProp instanceof z.ZodObject) {
        const props: Record<string, string> = {};
        Object.entries(propsProp.shape).forEach(([propName, propSchema]) => {
          if (propSchema instanceof z.ZodLiteral) {
            props[propName] = propSchema.value;
          }
        });
        return props;
      }
    }
    return {};
  };

  /**
   * Extract description from a Zod schema
   */
  const extractDescription = (schema: z.ZodTypeAny): string => {
    if (schema instanceof z.ZodObject) {
      const descriptionProp = schema.shape.description;
      if (descriptionProp instanceof z.ZodLiteral) {
        return descriptionProp.value;
      }
    }
    return "";
  };

  /**
   * Extract name from a Zod schema
   */
  const extractName = (schema: z.ZodTypeAny): string => {
    if (schema instanceof z.ZodObject) {
      const nameProp = schema.shape.name;
      if (nameProp instanceof z.ZodLiteral) {
        return nameProp.value;
      }
    }
    return "";
  };

  /**
   * Get comprehensive information about a node schema
   */
  const getNodeSchemaInfo = (nodeType: string): NodeSchemaInfo | null => {
    const schema =
      nodesRegistrySchema.shape[
        nodeType as keyof typeof nodesRegistrySchema.shape
      ];

    if (!schema) {
      return null;
    }

    const allowedChildren = extractAllowedChildren(schema);
    const allowedNamedSlots = extractAllowedNamedSlots(schema);
    const props = extractProps(schema);
    const name = extractName(schema);
    const description = extractDescription(schema);

    return {
      name,
      description,
      allowedChildren,
      allowedNamedSlots,
      props,
      hasChildren: allowedChildren.length > 0,
      hasNamedSlots: allowedNamedSlots !== null,
    };
  };

  /**
   * Get all available node types from the registry
   */
  const getAvailableNodeTypes = (): string[] => {
    return Object.keys(nodesRegistrySchema.shape);
  };

  /**
   * Check if a node type exists in the registry
   */
  const isValidNodeType = (nodeType: string): boolean => {
    return nodeType in nodesRegistrySchema.shape;
  };

  /**
   * Get allowed children for a specific node type
   */
  const getAllowedChildren = (nodeType: string): string[] => {
    const schema =
      nodesRegistrySchema.shape[
        nodeType as keyof typeof nodesRegistrySchema.shape
      ];
    return schema ? extractAllowedChildren(schema) : [];
  };

  /**
   * Get named slots configuration for a specific node type
   */
  const getNamedSlots = (
    nodeType: string
  ): Record<string, SlotConfiguration> | null => {
    const schema =
      nodesRegistrySchema.shape[
        nodeType as keyof typeof nodesRegistrySchema.shape
      ];
    return schema ? extractAllowedNamedSlots(schema) : null;
  };

  /**
   * Get props configuration for a specific node type
   */
  const getProps = (nodeType: string): Record<string, string> => {
    const schema =
      nodesRegistrySchema.shape[
        nodeType as keyof typeof nodesRegistrySchema.shape
      ];
    return schema ? extractProps(schema) : {};
  };

  /**
   * Validate if a child type is allowed for a parent type
   */
  const isChildAllowed = (parentType: string, childType: string): boolean => {
    const allowedChildren = getAllowedChildren(parentType);
    return allowedChildren.includes(childType);
  };

  /**
   * Validate if a child type is allowed in a specific named slot
   */
  const isChildAllowedInSlot = (
    parentType: string,
    slotName: string,
    childType: string
  ): boolean => {
    const namedSlots = getNamedSlots(parentType);
    if (!namedSlots || !namedSlots[slotName]) {
      return false;
    }
    return namedSlots[slotName].allowedChildren.includes(childType);
  };

  // Return public API
  return {
    // Individual extraction functions
    extractAllowedChildren,
    extractAllowedNamedSlots,
    extractProps,
    extractDescription,
    extractName,

    // Convenience functions
    getNodeSchemaInfo,
    getAvailableNodeTypes,
    isValidNodeType,
    getAllowedChildren,
    getNamedSlots,
    getProps,

    // Validation helpers
    isChildAllowed,
    isChildAllowedInSlot,
  };
};

// Create and export the service instance
export const zodIntrospectionService = createZodIntrospectionService();
