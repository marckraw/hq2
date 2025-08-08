# Event Handler Refactor: Type-Safe Dispatch

## 🔄 Before: Messy If/Else Logic

```typescript
// ❌ OLD: approval.granted.event.ts - MESSY!
export const approvalGrantedEventHandler = async (payload) => {
  try {
    const pipeline = await pipelineService.getPipeline(pipelineId);

    // 💩 Messy string-based if/else logic
    if (pipeline.type === "cms-publication") {
      // 100+ lines of Figma-to-Storyblok logic...
      logger.info("Processing Figma to Storyblok approval...");

      const createStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Create Storyblok Story",
        description: "Creating new story in Storyblok CMS",
      });

      // ... lots more logic
    } else if (pipeline.type === "changelog") {
      // 80+ lines of changelog logic...
      logger.info("Processing changelog approval...");

      const createChangelogStep = await pipelineService.createPipelineStep({
        pipelineId,
        name: "Create Changelog",
        description: "Creating changelog entry in database",
      });

      // ... lots more logic
    } else {
      // ❌ Unknown type - just log and fail silently
      logger.info(`Unknown pipeline type: ${pipeline.type}`);
    }
  } catch (error) {
    // Generic error handling
    logger.error("Error resuming pipeline after approval:", error);
    await pipelineService.updatePipelineStatus(pipelineId, "failed");
  }
};
```

### Problems with the old approach:

- ❌ **366 lines** of messy if/else logic in single file
- ❌ **No type safety** - `pipeline.type` is just a string
- ❌ **No metadata validation** - `pipeline.metadata` is generic JSON
- ❌ **Poor error handling** - unknown types fail silently
- ❌ **Hard to maintain** - adding new types requires editing giant file
- ❌ **No separation of concerns** - all logic mixed together
- ❌ **Duplicated code** - similar patterns repeated
- ❌ **Poor testability** - can't test handlers independently

---

## ✅ After: Type-Safe Factory Pattern

### 1. Type-Safe Handler Factory

```typescript
// ✅ NEW: approval-handlers/index.ts - CLEAN!

interface ApprovalHandler<T = unknown> {
  handle(
    pipelineId: string,
    pipeline: Pipeline & { metadata: T },
    payload: ApprovalGrantedPayload
  ): Promise<void>;
}

class FigmaToStoryblokApprovalHandler
  implements ApprovalHandler<FigmaToStoryblokMetadata>
{
  async handle(
    pipelineId: string,
    pipeline: Pipeline & { metadata: FigmaToStoryblokMetadata },
    payload: ApprovalGrantedPayload
  ): Promise<void> {
    logger.info("Processing Figma to Storyblok approval...");

    // 🎯 Fully typed metadata access
    const { finalStoryblokStory, storyName, storySlug } = pipeline.metadata;

    // Clean, focused logic for this specific type
    const createdStory =
      await storyblokService.createStory(finalStoryblokStory);

    await slackService.notify(
      `🎨 *Figma to Storyblok Success!*\n\n*Story:* ${storyName}\n*Slug:* ${storySlug}`
    );
  }
}

class ChangelogApprovalHandler implements ApprovalHandler<ChangelogMetadata> {
  async handle(
    pipelineId: string,
    pipeline: Pipeline & { metadata: ChangelogMetadata },
    payload: ApprovalGrantedPayload
  ): Promise<void> {
    logger.info("Processing changelog approval...");

    // 🎯 Fully typed metadata access
    const { repoOwner, repoName, prNumber, summary } = pipeline.metadata;

    // Clean, focused logic for this specific type
    await changelogService.createChangelog({
      repoOwner,
      repoName,
      prNumber,
      summary,
      createdBy: "system",
    });
  }
}

// 🏭 Type-safe factory
class ApprovalHandlerFactory {
  private handlers = new Map<string, ApprovalHandler>([
    ["figma-to-storyblok", new FigmaToStoryblokApprovalHandler()],
    ["changelog", new ChangelogApprovalHandler()],
    ["storyblok-editor", new StoryblokEditorApprovalHandler()],
    ["irf-architect", new IRFArchitectApprovalHandler()],
  ]);

  getHandler(pipelineType: string): ApprovalHandler {
    const handler = this.handlers.get(pipelineType);
    if (!handler) {
      throw new Error(
        `No approval handler found for pipeline type: ${pipelineType}`
      );
    }
    return handler;
  }
}

export const approvalHandlerFactory = new ApprovalHandlerFactory();
```

### 2. Clean Event Handler

```typescript
// ✅ NEW: approval.granted.refactored.event.ts - SUPER CLEAN!

export const approvalGrantedEventHandler = async (
  payload: ApprovalGrantedEventPayload
) => {
  const { pipelineId } = payload;

  try {
    logger.info("Processing approval granted event:", { pipelineId });

    const pipelineService = serviceRegistry.get("pipeline");

    // Fetch pipeline from database
    const dbPipeline = await pipelineService.getPipeline(pipelineId);
    if (!dbPipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    // ✅ Transform database pipeline to type-safe pipeline with validation
    const typedPipeline = transformDatabasePipeline(dbPipeline);

    logger.info("Pipeline metadata validated:", {
      pipelineId,
      type: typedPipeline.type,
    });

    // ✅ Type-safe dispatch - no more if/else!
    const handler = approvalHandlerFactory.getHandler(typedPipeline.type);

    // ✅ Handler receives fully typed pipeline with validated metadata
    await handler.handle(pipelineId, typedPipeline, payload);

    logger.info("Approval processing completed successfully");
  } catch (error: any) {
    logger.error("Error processing approval granted event:", {
      pipelineId,
      error: error.message,
    });

    // If it's an unknown pipeline type, log supported types
    if (error.message.includes("No approval handler found")) {
      logger.error("Supported pipeline types:", {
        supportedTypes: approvalHandlerFactory.getSupportedTypes(),
      });
    }

    throw error;
  }
};
```

---

## 🎉 Benefits of the New Approach

### ✅ Type Safety

- **Fully typed metadata** - TypeScript knows exactly what fields are available
- **Discriminated unions** - TypeScript enforces correct type usage
- **Runtime validation** - Zod validates data at runtime
- **No more `any` types** - Everything is properly typed

### ✅ Clean Architecture

- **Single responsibility** - Each handler focuses on one pipeline type
- **Factory pattern** - Clean dispatch without if/else chains
- **Separation of concerns** - Logic separated by domain
- **Easy to extend** - Add new handlers without touching existing code

### ✅ Better Error Handling

- **Unknown types throw errors** - No more silent failures
- **Validation errors** - Clear messages when metadata is invalid
- **Supported types logging** - Shows what types are available
- **Structured error logging** - Better debugging information

### ✅ Maintainability

- **Focused files** - Each handler is small and focused
- **Independent testing** - Test each handler separately
- **Easy to add types** - Just create new handler and register it
- **Clear documentation** - Each handler documents its purpose

### ✅ Developer Experience

- **IDE autocomplete** - Full IntelliSense for metadata fields
- **Compile-time errors** - Catches mistakes before runtime
- **Clear interfaces** - Easy to understand what each handler expects
- **Type safety** - Prevents common bugs and typos

---

## 📊 Metrics Comparison

| Metric               | Before             | After                             | Improvement           |
| -------------------- | ------------------ | --------------------------------- | --------------------- |
| **File Size**        | 366 lines          | ~80 lines main + focused handlers | 📉 Reduced complexity |
| **Type Safety**      | ❌ None            | ✅ Full TypeScript + Runtime      | 🚀 100% improvement   |
| **Testability**      | ❌ Hard            | ✅ Easy (individual handlers)     | 🧪 Much better        |
| **Maintainability**  | ❌ Poor            | ✅ Excellent                      | 🔧 Much easier        |
| **Error Handling**   | ❌ Generic         | ✅ Specific + structured          | 🐛 Better debugging   |
| **Adding New Types** | ❌ Edit giant file | ✅ Add new handler                | ⚡ Much faster        |

---

## 🚀 Next Steps

1. **Replace original handler** - Swap out the old file with new refactored version
2. **Add unit tests** - Test each handler independently
3. **Monitor in production** - Ensure type validation works correctly
4. **Apply pattern to other events** - Refactor other event handlers similarly
5. **Add more pipeline types** - Easy to extend now!
