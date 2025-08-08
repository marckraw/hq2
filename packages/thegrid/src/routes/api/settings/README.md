# Settings API

This module provides a complete settings management system for the HQ application.

## Overview

The settings system allows you to store and manage application configuration in the database. It's designed to work without user accounts - settings are global to the application.

## Architecture

- **Database Schema**: `settings` table using Drizzle ORM
- **Validation**: Zod schemas for runtime validation (separate from database schema)
- **Service Layer**: Settings service for database operations
- **API Layer**: RESTful endpoints for CRUD operations
- **Frontend Hook**: React hook for easy integration

## API Endpoints

### GET /api/settings

Get all settings or filter by category.

**Query Parameters:**

- `category` (optional): Filter by category (`agent`, `prompts`, `interface`, `notifications`)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category": "agent",
      "key": "defaultModel",
      "value": "gpt-4",
      "description": "Default AI model to use",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/settings/grouped

Get settings grouped by category (convenient for frontend).

**Response:**

```json
{
  "success": true,
  "data": {
    "agent": {
      "defaultModel": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 2000,
      "autoSave": true
    },
    "prompts": {
      "codeReview": "Please review this code...",
      "bugFix": "Analyze the following code...",
      "documentation": "Generate comprehensive documentation..."
    },
    "interface": {
      "colorMode": "system",
      "theme": "default",
      "codeHighlighting": true,
      "showLineNumbers": true,
      "autoComplete": true
    },
    "notifications": {
      "enabled": true,
      "sound": true,
      "desktop": true
    }
  }
}
```

### GET /api/settings/:category/:key

Get a specific setting.

### POST /api/settings

Create or update a setting.

**Request Body:**

```json
{
  "category": "agent",
  "key": "defaultModel",
  "value": "gpt-4",
  "description": "Default AI model to use"
}
```

### PUT /api/settings/bulk

Bulk update settings (convenient for frontend).

**Request Body:**

```json
{
  "agent": {
    "defaultModel": "claude-3",
    "temperature": 0.8
  },
  "prompts": {
    "codeReview": "Updated prompt..."
  }
}
```

### DELETE /api/settings/:category/:key

Delete a specific setting.

### POST /api/settings/initialize

Initialize default settings. This creates all the default settings if they don't exist.

## Setting Categories

### Agent Settings

- `defaultModel`: AI model to use (`gpt-4`, `gpt-3.5`, `claude-3`)
- `temperature`: Model temperature (0-1)
- `maxTokens`: Maximum tokens per response (1-10000)
- `autoSave`: Auto-save agent responses (boolean)

### Prompt Settings

- `codeReview`: Default code review prompt
- `bugFix`: Default bug fix analysis prompt
- `documentation`: Default documentation generation prompt

### Interface Settings

- `colorMode`: Color mode (`system`, `light`, `dark`)
- `theme`: Theme variation (`default`, `pink`, `sage`)
- `codeHighlighting`: Enable syntax highlighting (boolean)
- `showLineNumbers`: Show line numbers (boolean)
- `autoComplete`: Enable auto-completion (boolean)

### Notification Settings

- `enabled`: Enable notifications (boolean)
- `sound`: Enable sound alerts (boolean)
- `desktop`: Enable desktop notifications (boolean)

## Frontend Integration

Use the `useSettings` hook in your React components:

```tsx
import { useSettings } from "@/hooks/useSettings";

function MyComponent() {
  const { settings, loading, error, updateSettings } = useSettings();

  const handleSave = async () => {
    await updateSettings({
      agent: {
        defaultModel: "claude-3",
        temperature: 0.8,
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Current model: {settings.agent?.defaultModel}</p>
      <button onClick={handleSave}>Update Settings</button>
    </div>
  );
}
```

## Database Migration

Run the migration to create the settings table:

```bash
cd packages/thegrid
npx drizzle-kit push
```

## Environment Variables

Make sure your frontend has the API configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TOKEN=your_api_token
```

## Security

All settings endpoints are protected with bearer token authentication. The same token used for other API endpoints protects the settings routes.
