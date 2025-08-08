# Component Mapping Guide

> **Complete guide for adding new component mappings to the IRF (Intermediate Representation Format) system** > **Updated with real-world implementation insights**

## 📋 Overview

This guide walks you through the process of adding new component mappings to the IRF system. The IRF system transforms components between different formats (Figma → IRF → Storyblok) and requires updates in multiple places to maintain consistency.

## 🎯 Understanding the Architecture

### Component Flow

```
Figma Design → IRF Node → Storyblok Component → Live Website
      ↑              ↑              ↑
   AI Prompt    Validation    Parent Context
   Auto-Update   (3 retries)    Enrichment
```

### The IRF Agent Workflow

1. **Master Prompt** gets updated automatically with latest schema + node registry
2. **LLM generates IRF** based on this knowledge
3. **Validation** ensures it follows the schema (3 retry attempts)
4. **Parent enrichment** adds parent context info (`parentNodeTypeName`)
5. **Transformation** uses parent context for different outputs

### Required Touchpoints

Every new component mapping requires updates in **7 key areas**:

1. **IRF Schema Definition** - Define the component type
2. **Node Registry** - Define allowed nesting and properties _(feeds AI context)_
3. **Component Transformer** - Handle IRF → Storyblok transformation
4. **Registry Registration** - Register the transformer
5. **Reverse Mapping** - Handle Storyblok → IRF transformation
6. **Test Fixtures** - Create test data
7. **Tests** - Ensure functionality works

## 🚀 Step-by-Step Implementation

### Step 1: Define IRF Component Type

**File**: `packages/thegrid/src/domains/irf/schema.ts`

```typescript
export const INTERMEDIATE_NODE_TYPES = [
  // ... existing types ...
  "accordion", // ✅ Add your parent component
  "accordion-item", // ✅ Add child components too
] as const;
```

### Step 2: Register in Node Registry _(Critical - Feeds AI Context)_

**File**: `packages/thegrid/src/domains/irf/nodes-registry.ts`

```typescript
export const nodesRegistry: Record<IntermediateNodeType, NodeRegistryEntry> = {
  // ... existing entries ...

  // Parent component
  accordion: {
    name: "accordion",
    description: "An accordion component with collapsible items", // 🔥 This goes to AI prompt!
    allowedChildren: ["accordion-item"], // 🔥 AI learns nesting rules from this
  },

  // Child component
  "accordion-item": {
    name: "accordion-item",
    description: "An individual accordion item with title and content",
    allowedChildren: [], // Atomic component - no children
    props: {
      title: "string",
      content: "string",
    },
  },
};
```

**⚠️ Critical**: Update parent components to allow your new component:

```typescript
section: {
  allowedChildren: [
    // ... existing ...
    "accordion", // ← Don't forget this!
  ],
},

"flex-group": {
  allowedChildren: [
    // ... existing ...
    "accordion", // ← And this!
  ],
},
```

### Step 3: Create Context-Aware Component Transformer

**File**: `packages/thegrid/src/domains/irf/services/IRFToStoryblokService/component-transformers/accordion.transformer.ts`

```typescript
import { serviceRegistry } from "@/registry/service-registry";
import { ComponentTransformer } from "../irf-to-storyblok.service.types";

export const accordionTransformer: ComponentTransformer = async (
  node,
  options
) => {
  const designIntentMapperService = serviceRegistry.get("designIntentMapper");
  const irfToStoryblokService = serviceRegistry.get("irfToStoryblok");

  // Common fields for all contexts
  const commonFields = {
    type: node.props?.type || "multiple", // Will become configurable props later
    custom_classname: node.props?.customClassname || "",
    design: node.design
      ? designIntentMapperService.map(node.design, "sb-accordion")
      : undefined,

    // 🔥 Recursive transformation - system finds accordion-item transformer automatically
    items: await Promise.all(
      (node.children || []).map((child) =>
        irfToStoryblokService.transformNodeToStoryblok(child, options)
      )
    ),
  };

  // 🔥 Parent context determines output component (THE MAGIC!)
  if (node.parentNodeTypeName === "section") {
    return {
      component: "sb-accordion-section",
      ...commonFields,
    };
  } else if (node.parentNodeTypeName === "flex-group") {
    return {
      component: "sb-accordion-flex-group",
      ...commonFields,
    };
  } else {
    // Fallback - should rarely happen
    return {
      component: "sb-accordion",
      ...commonFields,
    };
  }
};
```

**For accordion-item (child component):**

```typescript
export const accordionItemTransformer: ComponentTransformer = async (
  node,
  _options
) => {
  // Atomic component - simpler structure
  return {
    component: "sb-accordion-item",
    title: node.props?.title || node.name || "",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              text: node.props?.content || "",
              type: "text",
            },
          ],
        },
      ],
    },
  };
};
```

### Step 4: Register the Transformers

**File**: `packages/thegrid/src/domains/irf/services/IRFToStoryblokService/component-transformers/index.ts`

```typescript
// Add imports
import { accordionTransformer } from "./accordion.transformer";
import { accordionItemTransformer } from "./accordion-item.transformer";

// Add to registry
export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  // ... existing entries ...
  accordion: {
    defaultStoryblokComponent: "sb-accordion-section", // Default context
    transform: accordionTransformer,
  },
  "accordion-item": {
    defaultStoryblokComponent: "sb-accordion-item",
    transform: accordionItemTransformer,
  },
};
```

### Step 5: Add Reverse Mapping

**File**: `packages/thegrid/src/domains/irf/services/StoryblokToIRFService/storyblok-to-irf.service.ts`

```typescript
const _reverseComponentRegistry: Record<string, ReverseComponentRegistryEntry> =
  {
    // ... existing entries ...

    // All context variations
    "sb-accordion-section": {
      targetIRFType: "accordion",
      transform: (component, _options) => ({
        type: "accordion",
        name: "Accordion",
        props: {
          type: component.type,
          customClassname: component.custom_classname,
        },
        // Children will be processed separately
      }),
      description: "Accordion within a section",
    },

    "sb-accordion-flex-group": {
      targetIRFType: "accordion",
      transform: (component, _options) => ({
        type: "accordion",
        name: "Accordion",
        props: {
          type: component.type,
          customClassname: component.custom_classname,
        },
      }),
      description: "Accordion within a flex group",
    },

    "sb-accordion-item": {
      targetIRFType: "accordion-item",
      transform: (component, _options) => ({
        type: "accordion-item",
        name: component.title || "Accordion Item",
        props: {
          title: component.title,
          content: extractTextFromRichText(component.content),
        },
      }),
      description: "Individual accordion item",
    },
  };
```

### Step 6: Create Test Fixtures

**File**: `packages/thegrid/src/domains/irf/services/IRFToStoryblokService/__fixtures__/single-component-mapping/accordion.fixtures.ts`

```typescript
import { IntermediateLayout } from "@/domains/irf/schema.types";

export const accordionInSection: IntermediateLayout = {
  version: "1.0",
  name: "Accordion in section",
  content: [
    {
      type: "section",
      name: "Section with Accordion",
      children: [
        {
          type: "accordion",
          name: "FAQ Accordion",
          children: [
            {
              type: "accordion-item",
              name: "First Item",
              props: {
                title: "What is IRF?",
                content: "IRF is an intermediate representation format.",
              },
            },
            {
              type: "accordion-item",
              name: "Second Item",
              props: {
                title: "How does it work?",
                content: "It transforms between different formats.",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const accordionInFlexGroup: IntermediateLayout = {
  version: "1.0",
  name: "Accordion in flex group",
  content: [
    {
      type: "section",
      name: "Section",
      children: [
        {
          type: "flex-group",
          name: "Flex Layout",
          children: [
            {
              type: "accordion",
              name: "Flex Accordion",
              children: [
                {
                  type: "accordion-item",
                  name: "Flex Item",
                  props: {
                    title: "Flex Question",
                    content: "This accordion is in a flex group.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
```

### Step 7: Write Comprehensive Tests

**File**: `packages/thegrid/src/domains/irf/services/IRFToStoryblokService/irf-to-storyblok.service.test.ts`

```typescript
import {
  accordionInSection,
  accordionInFlexGroup,
} from "./__fixtures__/single-component-mapping/accordion.fixtures";

describe("Accordion Component Mapping", () => {
  it("should map accordion correctly in section context", async () => {
    const result = await service.transformIRFToStoryblok(accordionInSection);

    expect(result.success).toBe(true);

    const section = result.story.content.body[0];
    const accordion = section.content[0];

    // 🔥 Verify parent context affects component name
    expect(accordion.component).toBe("sb-accordion-section");
    expect(accordion.type).toBe("multiple");
    expect(accordion.items).toHaveLength(2);

    // Verify recursive transformation worked
    const firstItem = accordion.items[0];
    expect(firstItem.component).toBe("sb-accordion-item");
    expect(firstItem.title).toBe("What is IRF?");
  });

  it("should map accordion correctly in flex-group context", async () => {
    const result = await service.transformIRFToStoryblok(accordionInFlexGroup);

    const flexGroup = result.story.content.body[0].content[0];
    const accordion = flexGroup.content[0];

    // 🔥 Different parent = different component
    expect(accordion.component).toBe("sb-accordion-flex-group");
  });
});
```

## 🔍 **Advanced Implementation Insights**

### **AI Prompt Auto-Update System**

```typescript
// The IRFArchitectAgent automatically includes:
// 1. Latest Zod schema (converted to JSON Schema)
// 2. Complete nodes registry
// 3. All allowed nesting rules

// You don't manually update prompts - they update automatically!
const masterPrompt = generateMasterPrompt({
  zodSchema: intermediateLayoutSchema,
  nodesRegistry: nodesRegistry, // ← Your changes go here automatically
  knownTypes: INTERMEDIATE_NODE_TYPES,
});
```

### **Parent Context Enrichment Process**

```typescript
// After LLM generates IRF, system enriches with parent info
const enrichedIRF = await irfTraversingService.addParentNodeNames(rawIRF);

// Now every node has:
// - parentNodeName: "Flex Layout"
// - parentNodeTypeName: "flex-group" ← Used in transformers!
```

### **Validation with Retry Logic**

```typescript
// System validates LLM output and retries up to 3 times
for (let attempt = 1; attempt <= 3; attempt++) {
  const result = intermediateLayoutSchema.safeParse(llmOutput);
  if (result.success) break;

  // Give feedback to LLM and retry
  llmOutput = await retryWithFeedback(result.error);
}
```

### **The Recursive Transformation Magic**

```typescript
// Parent transformer doesn't need to know about child transformers
items: await Promise.all(
  (node.children || []).map((child) =>
    // System automatically finds the right transformer for child.type
    irfToStoryblokService.transformNodeToStoryblok(child, options)
  )
);
```

## 🧪 **Testing Your Implementation**

### **1. Test IRF Generation**

```bash
# Use the agent to generate IRF with your new component
"Create a layout with a section containing an accordion with 3 items"
```

### **2. Test Transformation**

Check the pipeline output to verify:

- ✅ Correct parent context (`parentNodeTypeName`)
- ✅ Proper nesting structure
- ✅ Right Storyblok component names

### **3. Test Live Preview**

1. Go to **Approvals** page
2. Click **Approve** on your generated layout
3. View the live preview to ensure UI renders correctly

## ⚡ **Current System Limitations**

### **Props System** _(Being Improved)_

```typescript
// Currently hardcoded
type: "multiple",

// Will become
type: node.props?.type || "multiple",
```

### **Design Intent Mapping** _(Partially Implemented)_

- ✅ Basic spacing (gap, padding)
- ✅ Text colors
- ❌ Complete typography system
- ❌ Layout dimensions
- ❌ Background images/colors
- ❌ Border styles

### **Missing Atomic Components**

Need to implement more basic elements:

- `button`, `link`, `input`
- `video`, `embed`
- `spacer`, `separator`

## 🎨 **Design Intent Best Practices**

Always include design mapping:

```typescript
const design = node.design
  ? designIntentMapperService.map(node.design, "sb-your-component")
  : undefined;
```

## 🔄 **Parent Context Patterns**

### **Three-Context Pattern** (Most Common)

```typescript
if (node.parentNodeTypeName === "section") {
  return { component: "sb-component-section", ...common };
} else if (node.parentNodeTypeName === "flex-group") {
  return { component: "sb-component-flex-group", ...common };
} else {
  return { component: "sb-component", ...common };
}
```

### **Simple Pattern** (Atomic Components)

```typescript
// No parent context needed
return {
  component: "sb-atomic-component",
  ...props,
};
```

## ✅ **Implementation Checklist**

### **Planning Phase**

- [ ] Define component purpose and behavior
- [ ] Identify if it needs parent context variations
- [ ] Plan the allowed children structure
- [ ] Design the props interface

### **Implementation Phase**

- [ ] Add to `INTERMEDIATE_NODE_TYPES` in `schema.ts`
- [ ] Define in `nodes-registry.ts` with good descriptions _(feeds AI)_
- [ ] Update parent components' `allowedChildren` arrays
- [ ] Create component transformer(s)
- [ ] Register in `component-transformers/index.ts`
- [ ] Add reverse mappings in `StoryblokToIRFService`
- [ ] Create comprehensive test fixtures
- [ ] Write tests for all contexts

### **Testing Phase**

- [ ] Test IRF generation with AI agent
- [ ] Test transformation pipeline
- [ ] Test in different parent contexts
- [ ] Test with and without props/children
- [ ] Test live preview in approvals flow
- [ ] Verify recursive transformation works

### **Documentation Phase**

- [ ] Document any special behaviors
- [ ] Add usage examples
- [ ] Note any current limitations

## 🚨 **Common Gotchas**

1. **Forgetting Parent `allowedChildren`**: Component won't be available to AI
2. **Missing Context Variations**: Same component needs different outputs per parent
3. **Recursive Dependencies**: Child transformers must exist for parent to work
4. **Description Quality**: Poor descriptions = poor AI understanding
5. **Registry Registration**: Component transformers must be registered to work

## 🎯 **Best Practices**

1. **Rich Descriptions**: Write clear, detailed component descriptions for AI
2. **Parent Context**: Always handle different parent contexts appropriately
3. **Recursive Design**: Let the system handle child transformations
4. **Error Handling**: Provide fallback components for edge cases
5. **Test Thoroughly**: Test in live preview, not just unit tests
6. **Consistent Naming**: Follow `sb-component-context` pattern

## 🔮 **Future Improvements**

### **Coming Soon**

- **Props System**: Replace hardcoded values with configurable props
- **Enhanced Design Mapping**: Complete typography and layout support
- **Slot-Based Components**: Better structured content areas
- **Component Variants**: Multiple visual styles per component

### **Long-term Vision**

- **Visual Component Builder**: GUI for creating component mappings
- **Auto-Discovery**: Automatically detect new Storyblok components
- **Multi-CMS Support**: Transform to Contentful, Sanity, etc.
- **Component Library Integration**: Import from design systems

---

**Need help?** Reference the `accordion` and `blockquote` components as complete examples of this pattern in action.

**Pro Tip**: Start with simple atomic components before building complex nested ones. The recursive system makes complex components easy once you have the basics working!
