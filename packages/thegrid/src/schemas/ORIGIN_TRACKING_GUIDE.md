# 🎯 Origin Tracking System

## Overview

The **Origin Tracking System** tracks where pipelines and approvals are triggered from across your distributed application ecosystem. This enables better **audit trails**, **analytics**, and **different UX flows** based on the trigger source.

## 🎪 Supported Origins

```typescript
type Origin =
  | "thehorizon" // Frontend app (current default)
  | "slack" // Slack slash commands, buttons, etc.
  | "storyblok-ui" // Direct Storyblok interface
  | "storyblok-plugin" // Storyblok plugin system
  | "email" // Email-based triggers/approvals
  | "api" // Direct API calls
  | "webhook" // External webhook triggers
  | "system" // Automated/scheduled triggers
  | "unknown"; // Fallback for legacy data
```

## 🏗️ Schema Changes

### Base Schemas Updated

Both `BasePipelineSchema` and `BaseApprovalSchema` now include:

```typescript
// Added to both schemas
origin: OriginSchema, // Where the pipeline/approval was triggered from
```

### Automatic Propagation

Since these are **base schemas**, the `origin` field automatically propagates to all typed versions:

- ✅ `FigmaToStoryblokPipeline` now has `origin` field
- ✅ `ChangelogPipeline` now has `origin` field
- ✅ `StoryblokEditorPipeline` now has `origin` field
- ✅ `IRFArchitectPipeline` now has `origin` field
- ✅ All approval types now have `origin` field

## 🔄 Usage Examples

### 1. Creating Pipeline from Different Origins

```typescript
// From thehorizon (frontend)
const pipelineFromFrontend = await pipelineService.createPipeline({
  name: "Figma to Storyblok Transform",
  type: "figma-to-storyblok",
  origin: "thehorizon", // 🎯 Frontend trigger
  metadata: {
    /* ... */
  },
});

// From Slack
const pipelineFromSlack = await pipelineService.createPipeline({
  name: "Quick Release Changelog",
  type: "changelog",
  origin: "slack", // 🎯 Slack command trigger
  metadata: {
    /* ... */
  },
});

// From Storyblok Plugin
const pipelineFromPlugin = await pipelineService.createPipeline({
  name: "Story Editor Changes",
  type: "storyblok-editor",
  origin: "storyblok-plugin", // 🎯 Plugin trigger
  metadata: {
    /* ... */
  },
});
```

### 2. Creating Approvals from Different Origins

```typescript
// Approval created from frontend
const approvalFromFrontend = await approvalService.createApproval({
  pipelineStepId: "step-123",
  status: "pending",
  risk: "medium",
  origin: "thehorizon", // 🎯 Frontend approval request
  metadata: {
    /* ... */
  },
});

// Approval response from email
const approvalFromEmail = await approvalService.updateApproval(approvalId, {
  status: "approved",
  origin: "email", // 🎯 Email approval response
  approvedAt: new Date(),
});

// Approval from Slack interactive button
const approvalFromSlack = await approvalService.updateApproval(approvalId, {
  status: "approved",
  origin: "slack", // 🎯 Slack button click
  approvedAt: new Date(),
});
```

## 📊 Analytics & Tracking

### Enhanced Logging

All event handlers now log origin information:

```typescript
logger.info("Processing approval granted event:", {
  pipelineId,
  type: typedPipeline.type,
  origin: typedPipeline.origin, // 🎯 Track where it came from
});

logger.info("Processing Figma to Storyblok approval:", {
  pipelineId,
  origin: pipeline.origin, // 🎯 Track origin
});
```

### Slack Notifications Include Origin

```typescript
await slackService.notify(
  `🎨 *Figma to Storyblok Success!*
  
  *Story:* ${storyName}
  *Slug:* ${storySlug}
  *Origin:* ${pipeline.origin} // 🎯 Shows trigger source
  
  ✅ Successfully created story!`
);
```

### Database Queries by Origin

```sql
-- Find all pipelines triggered from Slack
SELECT * FROM pipelines WHERE origin = 'slack';

-- Analytics: Pipeline success rates by origin
SELECT
  origin,
  status,
  COUNT(*) as count,
  (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY origin)) as percentage
FROM pipelines
GROUP BY origin, status;

-- Find high-risk approvals from external sources
SELECT * FROM approvals
WHERE risk = 'high'
AND origin IN ('slack', 'email', 'webhook');
```

## 🎛️ Origin-Specific Behavior

### Different UX Flows Based on Origin

```typescript
// In your handlers, you can customize behavior based on origin
class FigmaToStoryblokApprovalHandler {
  async handle(pipelineId: string, pipeline: Pipeline, payload: any) {
    const { origin } = pipeline;

    // 🎯 Customize notifications based on origin
    if (origin === "slack") {
      // Send Slack-specific response back to thread
      await this.sendSlackThreadResponse(payload.threadId, "✅ Completed!");
    } else if (origin === "email") {
      // Send email confirmation
      await this.sendEmailConfirmation(payload.email);
    } else if (origin === "thehorizon") {
      // Send in-app notification
      await this.sendInAppNotification(payload.userId);
    }

    // 🎯 Different approval flows
    if (origin === "storyblok-plugin") {
      // Skip approval for trusted plugin triggers
      await this.autoApprove(pipelineId);
    } else {
      // Require manual approval for external triggers
      await this.requestApproval(pipelineId);
    }
  }
}
```

### Origin-Based Security & Permissions

```typescript
// Validate permissions based on origin
const validateOriginPermissions = (origin: Origin, action: string) => {
  const permissions = {
    thehorizon: ["create", "approve", "reject", "view"],
    slack: ["create", "approve", "view"],
    "storyblok-plugin": ["create", "view"],
    email: ["approve", "reject"],
    api: ["create", "view"],
    webhook: ["create"],
    system: ["create", "approve", "view"],
  };

  if (!permissions[origin]?.includes(action)) {
    throw new Error(`Origin '${origin}' not authorized for action '${action}'`);
  }
};
```

## 🔄 Legacy Data Handling

### Automatic Defaults

The transform function handles legacy records without origin:

```typescript
export const transformDatabasePipeline = (dbPipeline: any): Pipeline => {
  return PipelineSchema.parse({
    ...dbPipeline,
    // 🎯 Default to 'unknown' for legacy records
    origin: dbPipeline.origin || "unknown",
    metadata: validatedMetadata,
  });
};
```

### Migration Strategy

For existing data, you can run a migration:

```sql
-- Update existing pipelines with default origin
UPDATE pipelines
SET origin = 'thehorizon'
WHERE origin IS NULL;

-- Update existing approvals with default origin
UPDATE approvals
SET origin = 'thehorizon'
WHERE origin IS NULL;
```

## 🚀 Future Integrations

### Easy to Add New Origins

Adding new trigger sources is simple:

1. **Add to enum**: Update `OriginSchema` in `base.schemas.ts`
2. **Update handlers**: Add origin-specific logic in handlers
3. **Update permissions**: Add to permission matrix
4. **Update docs**: Document the new origin

### Example: Adding Discord Integration

```typescript
// 1. Update the enum
export const OriginSchema = z.enum([
  // ... existing origins
  "discord", // 🆕 New Discord integration
]);

// 2. Usage
const pipelineFromDiscord = await pipelineService.createPipeline({
  name: "Discord Bot Command",
  type: "changelog",
  origin: "discord", // 🆕 Discord trigger
  metadata: {
    /* ... */
  },
});
```

## 📈 Benefits

### ✅ Audit Trail

- Track exactly where every pipeline/approval originated
- Better security and compliance reporting
- Debug issues by filtering by origin

### ✅ Analytics

- Measure adoption of different trigger methods
- Optimize UX for popular origins
- Identify patterns in approval flows

### ✅ Customization

- Different notification strategies per origin
- Origin-specific approval flows
- Customized permissions and security

### ✅ Multi-Channel Experience

- Slack users get Slack-style responses
- Email users get email confirmations
- Plugin users get embedded responses
- API users get JSON responses

---

**The Origin Tracking System enables true omnichannel pipeline orchestration! 🎯**
