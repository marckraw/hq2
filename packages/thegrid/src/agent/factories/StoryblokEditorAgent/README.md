# StoryblokEditorAgent

The **StoryblokEditorAgent** is a specialized AI agent designed to edit existing Storyblok CMS content by converting it to IRF (Intermediate Response Format), applying modifications, and converting it back to Storyblok format.

## Architecture Overview

```
Storyblok JSON → IRF → LLM Modifications → IRF Validation → Storyblok JSON
```

### Core Flow

1. **Input**: Valid Storyblok JSON (directly from Storyblok CMS)
2. **Transform**: Storyblok → IRF using `storyblokToIRF` service
3. **Modify**: Use LLM to edit the IRF content based on user instructions
4. **Validate**: Validate the modified IRF using the same validation as `IRFArchitectAgent`
5. **Transform Back**: IRF → Storyblok using `irfToStoryblok` service
6. **Output**: Modified Storyblok JSON ready for CMS

## Key Differences from IRFArchitectAgent

| Aspect             | IRFArchitectAgent        | StoryblokEditorAgent                 |
| ------------------ | ------------------------ | ------------------------------------ |
| **Input**          | Chat messages            | Storyblok JSON + edit instructions   |
| **Starting Point** | Creates IRF from scratch | Transforms existing Storyblok to IRF |
| **Use Case**       | Design-to-code           | Content editing                      |
| **Validation**     | IRF output validation    | IRF modification validation          |
| **Output**         | New Storyblok story      | Modified Storyblok story             |

## Usage

```typescript
const agent = await createStoryblokEditorAgent();

const result = await agent.act({
  messages: [
    {
      role: "user",
      content: JSON.stringify({
        storyblokContent: {
          // Valid Storyblok story object from CMS
          name: "My Page",
          slug: "my-page",
          content: {
            /* Storyblok components */
          },
        },
        editInstructions:
          "Add a new hero section at the top with a call-to-action button",
      }),
    },
  ],
});
```

## Input Format

```typescript
{
  storyblokContent: {
    name: string;
    slug: string;
    content: StoryblokComponent; // Root page component
    is_folder?: boolean;
    // ... other Storyblok story properties
  },
  editInstructions: string; // What modifications to make
  globalVars?: Record<string, unknown>; // Optional global variables
}
```

## Output Format

```typescript
{
  success: boolean;
  originalStoryblok: StoryblokStory;
  irf: IntermediateLayout;
  editedStoryblok: StoryblokStory;
  metadata: {
    transformationTime: string;
    originalComponentCount: number;
    finalComponentCount: number;
  }
}
```

## Supported Operations

### Content Modifications

- **Text Changes**: Update headlines, paragraphs, button labels
- **Component Addition**: Add new sections, components, elements
- **Component Removal**: Remove unwanted components
- **Component Reordering**: Change the order of components
- **Property Updates**: Modify component properties, styling, layout

### Structure Modifications

- **Section Management**: Add, remove, or reorganize sections
- **Layout Changes**: Modify flex groups, grid layouts
- **Component Nesting**: Add or remove nested component relationships
- **Asset Updates**: Update image references, alt texts

## Validation

The agent uses the same IRF validation system as `IRFArchitectAgent`:

- **Schema Validation**: Ensures IRF structure follows the schema
- **Business Logic**: Validates component relationships and properties
- **Retry Logic**: Attempts to fix validation errors up to 3 times
- **Error Reporting**: Provides detailed feedback on validation failures

## Services Used

### Dependencies

- `storyblokToIRF`: Transforms Storyblok JSON to IRF
- `irfToStoryblok`: Transforms IRF back to Storyblok JSON
- `irfTraversing`: Enriches IRF with parent relationships
- Base agent services (LLM, logging, etc.)

### Event System

Emits `storyblok-editor.completed` event with:

- Original Storyblok content
- Generated IRF
- Final edited Storyblok content
- Transformation metadata

## Error Handling

### Common Scenarios

- **Transformation Failures**: Issues converting between formats
- **IRF Validation Errors**: Invalid IRF structure after modifications
- **Component Compatibility**: Unsupported component types or structures
- **Service Unavailability**: Transformation services not available

### Retry Strategy

- Maximum 3 attempts per edit operation
- Validation feedback provided between attempts
- Graceful degradation with detailed error reporting

## Best Practices

### Input Preparation

- Ensure Storyblok content comes directly from CMS (guaranteed valid)
- Provide clear, specific edit instructions
- Include context about the desired outcome

### Edit Instructions

- Be specific about what changes to make
- Reference component types and locations when possible
- Specify if changes should preserve existing content

### Performance

- Use for targeted edits rather than complete rewrites
- Consider component complexity when planning modifications
- Monitor transformation times for large stories

## Examples

### Simple Text Update

```typescript
{
  storyblokContent: existingStory,
  editInstructions: "Change the main headline from 'Welcome' to 'Hello World'"
}
```

### Add New Section

```typescript
{
  storyblokContent: existingStory,
  editInstructions: "Add a new section after the hero with a contact form"
}
```

### Restructure Components

```typescript
{
  storyblokContent: existingStory,
  editInstructions: "Move the image gallery section to appear before the testimonials"
}
```

## Integration

### Event Handlers

```typescript
eventBus.on("storyblok-editor.completed", (data) => {
  // Handle completed edit operation
  console.log("Edit completed:", data.metadata);
  // Update CMS, notify users, trigger workflows, etc.
});
```

### API Integration

The agent can be used in API endpoints to provide programmatic content editing capabilities for Storyblok CMS.

## Development

### Testing

- Unit tests for validation logic
- Integration tests with transformation services
- End-to-end tests with real Storyblok content

### Monitoring

- Track transformation success rates
- Monitor validation error patterns
- Log performance metrics

### Extension

- Add support for new Storyblok component types
- Implement custom validation rules
- Add specialized editing operations

## Related

- [IRFArchitectAgent](../IRFArchitectAgent/README.md) - Creates IRF from scratch
- [Storyblok to IRF Service](../../../domains/irf/services/StoryblokToIRFService/)
- [IRF to Storyblok Service](../../../domains/irf/services/IRFToStoryblokService/)
- [IRF Schema](../../../domains/irf/schema.types.ts)
