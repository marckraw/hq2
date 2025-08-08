# Figma to Storyblok Transformer

A comprehensive system for transforming Figma designs into Storyblok CMS components with full type safety, validation, and design token support.

## 🚀 Features

- **Validated Transformers**: Type-safe transformers with Zod schema validation
- **Design Token Resolution**: Automatic resolution of Figma design tokens to Storyblok values
- **Real Component Support**: Based on actual Storyblok component exports
- **Schema Generation**: Auto-generate Zod schemas from Storyblok JSON exports
- **CLI Tools**: Command-line helpers for development workflow
- **Comprehensive Testing**: Test with real Storyblok story structures

## 📦 Components Supported

### Core Components

- **page**: Root page component with SEO fields and background color
- **section**: Container section with Backpack design fields
- **blockquote**: Quote component with citation and rich text content
- **text**: Body text with rich text content and typography options
- **headline**: Heading component with variants and alignment

### UI Components

- **hero-section**: Hero banner with CTA and background image
- **editorial-card**: Card component with image and content
- **button**: Interactive button component

### Legacy Components

- **image**: Image component with alt text
- **divider**: Simple divider component
- **carousel**: Carousel with multiple items
- **banner**: Banner with title and content
- **list**: List component with items
- **group**: Generic grouping component
- **shape**: Shape component with styling
- **instance**: Component instance wrapper

## 🏗️ Architecture

### IRF (Intermediate Response Format)

The system uses an intermediate format to bridge Figma and Storyblok:

```typescript
interface IntermediateNode {
  type: string;
  name: string;
  props?: Record<string, any>;
  design?: Record<string, any>;
  children?: IntermediateNode[];
  meta?: {
    source: string;
    figmaId?: string;
  };
}
```

### Design Token Resolution

Design tokens from Figma are automatically resolved using globalVars:

```typescript
const globalVars = {
  styles: {
    layout_center: { alignment: "center" },
    text_primary: "#1a1a1a",
    spacing_xl: { pt: "xl", pb: "xl" },
  },
};
```

### Backpack Design Fields

Components support Backpack responsive design fields:

```typescript
const backpackDesign = {
  fields: {
    spacing: {
      type: "custom",
      values: resolveDesignToken(design.spacing, globalVars),
      field_type: "backpack-spacing",
    },
    position: {
      type: "custom",
      values: resolveDesignToken(design.position, globalVars),
      field_type: "backpack-layout",
    },
  },
  plugin: "backpack-breakpoints",
  version: "2.5.2",
};
```

## 🛠️ Development Workflow

### 1. Quick Start

```bash
# Run all demos and tests
node cli-helper.js demo all

# Test with real story structure
node cli-helper.js demo real-story

# Analyze actual story components
node cli-helper.js demo analyze-real
```

### 2. Create New Component

#### Step 1: Export from Storyblok

Export your component as JSON from Storyblok CMS.

#### Step 2: Generate Schema

```bash
node cli-helper.js generate ./exports/your-component.json ./output
```

#### Step 3: Copy Generated Schema

Copy the generated schema to `storyblok-schemas.ts`:

```typescript
export const YourComponentSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-your-component"),
  title: StoryblokFieldSchemas.text,
  content: StoryblokFieldSchemas.richtext,
  design: BackpackDesignSchema.optional(),
});
```

#### Step 4: Create Transformer

```typescript
export const yourComponentTransformer = createValidatedTransformer(
  YourComponentSchema,
  (node: IntermediateNode, options?: IRFToStoryblokOptions) => {
    const design = node.design || {};
    const globalVars = options?.globalVars;

    return {
      component: "sb-your-component",
      _uid: generateUID(),
      title: node.props?.title || node.name,
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
      design: createBackpackDesign(design, globalVars),
    };
  }
);
```

#### Step 5: Register Transformer

```typescript
irfToStoryblokService.registerComponent("your-irf-type", "sb-your-component", yourComponentTransformer);
```

#### Step 6: Test

```bash
node cli-helper.js demo test-components
```

## 📋 Real Story Testing

The system includes comprehensive testing with actual Storyblok story structures:

### Test Individual Components

```typescript
import { testTransformer } from "./validated-transformers";

const result = testTransformer("blockquote", sampleIRFNode, {
  globalVars: {
    styles: {
      text_dark: "#333333",
      accent_blue: "#007bff",
    },
  },
});
```

### Test Full Story Generation

```typescript
import { testActualStoryGeneration } from "./real-story-test";

const result = await testActualStoryGeneration();
```

### Analyze Real Components

```typescript
import { analyzeActualStoryComponents } from "./real-story-test";

const analysis = analyzeActualStoryComponents();
```

## 🎯 CLI Commands

### Generate Schema and Transformer

```bash
# Generate from Storyblok export
node cli-helper.js generate ./exports/component.json ./output

# This creates:
# - ./output/generated-schemas/component-schema.ts
# - ./output/generated-transformers/component-transformer.ts
```

### Run Demonstrations

```bash
# Schema generation demo
node cli-helper.js demo schema

# Transformer testing
node cli-helper.js demo transformers

# Full pipeline demo
node cli-helper.js demo pipeline

# Real story testing
node cli-helper.js demo real-story

# Run all demos
node cli-helper.js demo all
```

### Development Workflow

```bash
# Show development workflow
node cli-helper.js demo workflow

# Get help
node cli-helper.js help
```

## 📊 Example: Real Story Structure

Based on actual Storyblok story with page → section → blockquote + text:

```json
{
  "story": {
    "content": {
      "component": "page",
      "body": [
        {
          "component": "sb-section",
          "content": [
            {
              "component": "sb-blockquote-section",
              "content": {
                "type": "doc",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "text": "This is some amazing quote",
                        "type": "text"
                      }
                    ]
                  }
                ]
              },
              "citation": {
                "type": "doc",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "text": "Marcin Krawczyk",
                        "type": "text"
                      }
                    ]
                  }
                ]
              }
            },
            {
              "component": "sb-text-section",
              "content": {
                "type": "doc",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "text": "This is some normal text in rich text",
                        "type": "text"
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
}
```

## 🔧 API Reference

### Core Services

#### IRF to Storyblok Service

```typescript
const service = createIRFToStoryblokService();

// Transform IRF to Storyblok
const result = await service.transformIRFToStoryblok(irfLayout, options);

// Register custom component
service.registerComponent("irf-type", "sb-component", transformer);
```

#### Schema Generator

```typescript
import { generateSchemaFromStoryblokExport } from "./schema-generator";

const analysis = generateSchemaFromStoryblokExport(storyblokJson);
```

#### Validated Transformers

```typescript
import { createValidatedTransformer, testTransformer } from "./validated-transformers";

const transformer = createValidatedTransformer(schema, transformFn);
const result = testTransformer("component-type", irfNode, options);
```

### Type Definitions

#### IRF Layout

```typescript
interface IntermediateLayout {
  version: "1.0";
  name: string;
  content: IntermediateNode[];
  globalVars?: {
    styles?: Record<string, any>;
    [key: string]: any;
  };
}
```

#### Transform Options

```typescript
interface IRFToStoryblokOptions {
  storyName?: string;
  storySlug?: string;
  parentId?: number;
  groupId?: string;
  includeMetadata?: boolean;
  generateUids?: boolean;
  customMappings?: Record<string, string>;
  globalVars?: {
    styles?: Record<string, any>;
    [key: string]: any;
  };
}
```

#### Storyblok Component

```typescript
interface StoryblokComponent {
  component: string;
  _uid: string;
  [key: string]: any;
}
```

## 🧪 Testing

### Run All Tests

```bash
# Run comprehensive test suite
node cli-helper.js demo all
```

### Test Specific Components

```bash
# Test real story generation
node cli-helper.js demo real-story

# Test individual components
node cli-helper.js demo test-components

# Analyze real components
node cli-helper.js demo analyze-real
```

### Custom Testing

```typescript
import { testTransformer } from "./validated-transformers";
import { irfToStoryblokService } from "./irf-to-storyblok.service";

// Test custom transformer
const result = testTransformer("your-type", yourIRFNode, {
  globalVars: {
    styles: {
      /* your tokens */
    },
  },
});

// Test full pipeline
const pipelineResult = await irfToStoryblokService.transformIRFToStoryblok(irfLayout, options);
```

## 🎨 Design Token Integration

### Figma Design Tokens

Design tokens from Figma MCP are automatically resolved:

```typescript
// IRF node with design tokens
const irfNode = {
  type: "text",
  design: {
    textColor: "text_primary_UL3LP3",
    spacing: "spacing_large_NOO1KU",
  },
};

// GlobalVars with token mappings
const globalVars = {
  styles: {
    text_primary_UL3LP3: "#1a1a1a",
    spacing_large_NOO1KU: { pt: "xl", pb: "xl" },
  },
};

// Automatic resolution in transformer
const resolvedColor = resolveDesignToken(design.textColor, globalVars);
```

### Backpack Integration

Components automatically generate Backpack-compatible design fields:

```typescript
const backpackDesign = {
  fields: {
    text_color: {
      type: "custom",
      values: resolveDesignToken(design.textColor, globalVars),
      field_type: "backpack-color-picker",
    },
    spacing: {
      type: "custom",
      values: resolveDesignToken(design.spacing, globalVars),
      field_type: "backpack-spacing",
    },
  },
  plugin: "backpack-breakpoints",
  version: "2.5.2",
};
```

## 📚 Examples

See the following files for comprehensive examples:

- `transformer-workflow-example.ts` - Complete workflow demonstrations
- `real-story-test.ts` - Real Storyblok story testing
- `validated-transformers.ts` - Transformer implementations
- `storyblok-schemas.ts` - Schema definitions

## 🤝 Contributing

1. Add new component schemas to `storyblok-schemas.ts`
2. Implement transformers in `validated-transformers.ts`
3. Register with `irfToStoryblokService`
4. Add tests to `real-story-test.ts`
5. Update CLI commands in `cli-helper.ts`

## 📄 License

This project is part of the EF HQ monorepo.
