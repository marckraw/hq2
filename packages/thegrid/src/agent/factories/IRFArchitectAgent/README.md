# IRF Architect Agent

The IRF Architect Agent is an AI-powered agent that generates IRF (Intermediate Representation Format) layouts based on natural language prompts. It includes comprehensive validation and feedback loops to ensure generated layouts conform to the IRF schema and business rules.

## Features

- **AI-Powered Generation**: Creates IRF layouts from natural language descriptions
- **Schema Validation**: Validates generated layouts against Zod schemas
- **Relationship Validation**: Ensures parent-child relationships follow the nodes registry rules
- **Automatic Retry**: Attempts to fix validation errors with up to 3 retries
- **Detailed Feedback**: Provides specific, actionable feedback for validation errors

## Validation System

The validation system performs three levels of validation:

### 1. Schema Validation

- Validates against Zod schemas for `IntermediateLayout` and `IntermediateNode`
- Checks data types, required fields, and format compliance
- Critical errors that must be fixed

### 2. Relationship Validation

- Validates parent-child relationships using the `nodesRegistry`
- Ensures children are allowed for their parent node types
- Prevents invalid hierarchy structures

### 3. Structural Validation

- Checks best practices and layout structure
- Warns about missing page nodes, empty content, etc.
- Provides recommendations for better layouts

## Usage

### Basic Usage

```typescript
import { createIRFArchitectAgent } from "./index";

const agent = await createIRFArchitectAgent();

const result = await agent.act({
  messages: [
    {
      role: "user",
      content:
        "Generate a layout with a page containing a hero section with headline and text",
    },
  ],
});
```

### Validation Only

```typescript
import { irfValidationService } from "./validation";

const validationResult = irfValidationService.validate(someIRFData);

if (!validationResult.isValid) {
  console.log(irfValidationService.generateFeedback(validationResult));
}

// Get validation statistics
const stats = irfValidationService.getValidationStats();
console.log(`Success rate: ${stats.successRate}%`);

// Health check
const isHealthy = await irfValidationService.isHealthy();
```

## Validation Error Types

### Schema Errors (🔴 Critical)

- **Invalid Types**: Wrong data types (string instead of number)
- **Missing Required Fields**: Required properties are missing
- **Invalid Enum Values**: Node types not in the allowed list
- **Format Violations**: Data doesn't match expected format

### Relationship Errors (🟠 Node Hierarchy)

- **Invalid Children**: Child node type not allowed for parent
- **Circular References**: Potential circular dependency issues
- **Depth Violations**: Nesting too deep or invalid structure

### Structural Errors (🟡 Best Practices)

- **Missing Page Node**: Layout doesn't contain a root page
- **Empty Content**: No content in the layout
- **Version Mismatch**: Using unsupported version

## Node Registry Rules

The validation system uses a comprehensive node registry that defines allowed children for each node type:

### Container Nodes

- **page**: Can contain sections, headers, footers, components
- **section**: Can contain headlines, text, images, lists, etc.
- **component**: Can contain various content elements
- **group**: Can contain most content types

### Content Nodes

- **headline**: Atomic - no children allowed
- **text**: Atomic - no children allowed
- **image**: Atomic - no children allowed
- **list**: Can only contain list-item nodes
- **list-item**: Can contain text, buttons, links

### Interactive Nodes

- **button**: Can contain text
- **link-with-arrow**: Can contain text
- **cta-card**: Can contain headlines, text, images, buttons

## Example Valid Structure

```json
{
  "version": "1.0",
  "name": "Example Layout",
  "content": [
    {
      "type": "page",
      "name": "Home Page",
      "children": [
        {
          "type": "section",
          "name": "Hero Section",
          "children": [
            {
              "type": "headline",
              "name": "Welcome Headline"
            },
            {
              "type": "text",
              "name": "Welcome Text"
            }
          ]
        }
      ]
    }
  ],
  "globalVars": {}
}
```

## Retry Logic

The agent automatically retries generation when validation fails:

1. **First Attempt**: Generate layout with original prompt
2. **Retry Attempts**: Include validation feedback in prompt
3. **Max Retries**: 3 attempts maximum
4. **Final Response**: Returns response with validation metadata if all retries fail

## Error Handling

When validation fails after all retries, the response includes:

```typescript
{
  // ... original response
  _validationErrors: ValidationError[],
  _validationWarnings: ValidationError[]
}
```

## Testing

Run validation examples:

```typescript
import { runValidationExamples } from "./examples";

runValidationExamples();
```

This will test various scenarios including valid layouts, invalid relationships, and malformed data.

You can also test the service directly:

```typescript
import { irfValidationService } from "./validation";

// Test health
const isHealthy = await irfValidationService.isHealthy();

// Get current statistics
const stats = irfValidationService.getValidationStats();
console.log(`Total validations: ${stats.totalValidations}`);
console.log(`Success rate: ${stats.successRate}%`);
console.log(`Common errors:`, stats.commonErrors);

// Clear statistics
irfValidationService.clearStats();
```

## Development

### Adding New Node Types

1. Add the new type to `INTERMEDIATE_NODE_TYPES` in the schema
2. Define its rules in the `nodesRegistry`
3. Update validation tests

### Extending Validation

1. Add new validation rules to the `IRFValidator` class
2. Update the `ValidationError` types if needed
3. Add corresponding feedback generation

## Best Practices

1. **Start with Page**: Always wrap content in a page node
2. **Follow Hierarchy**: Respect the parent-child relationships
3. **Use Semantic Types**: Choose the most appropriate node type
4. **Test Validation**: Use the validation system during development
5. **Handle Errors**: Always check validation results in production

## Related Files

- `validation.ts`: IRF validation service (closure-based pattern)
- `prompts.ts`: Agent system prompts
- `examples.ts`: Usage examples and tests
- `index.ts`: Main agent implementation with validation integration
- `../FigmaToStoryblokAgent/IRF/schema.ts`: IRF schema definitions

## Service Pattern

This validation service follows the closure-based service pattern used throughout the codebase:

```typescript
export const createIRFValidationService = () => {
  // Private state
  const validationStats = { ... };

  // Private functions
  const validateNodes = (...) => { ... };

  // Public API
  return {
    validate,
    generateFeedback,
    getValidationStats,
    clearStats,
    isHealthy,
  };
};

// Singleton export
export const irfValidationService = createIRFValidationService();
```
