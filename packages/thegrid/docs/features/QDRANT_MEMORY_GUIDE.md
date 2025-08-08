# 🧠 Qdrant Memory System Guide

## Overview

The HQ Memory System has been enhanced with **Qdrant vector database** integration, bringing AI-powered semantic search and intelligent memory clustering to your personal life control system.

## 🚀 New Features

### 1. **Semantic Search**

Find memories by meaning, not just keywords.

```bash
POST /api/semantic-search/search
```

**Example:**

```json
{
  "query": "JavaScript async programming",
  "limit": 10,
  "minScore": 0.7,
  "memoryTypes": ["code_snippet", "knowledge"],
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-12-31T23:59:59Z"
  }
}
```

### 2. **Memory Recommendations**

Get contextually relevant memories based on your current situation.

```bash
POST /api/semantic-search/recommendations
```

**Example:**

```json
{
  "context": "I'm debugging a React component that won't render properly",
  "excludeIds": [1, 2, 3],
  "limit": 5
}
```

### 3. **Memory Clustering**

Discover themes and patterns in your memories automatically.

```bash
POST /api/semantic-search/clusters
```

**Example:**

```json
{
  "memoryType": "knowledge",
  "maxClusters": 5
}
```

### 4. **Health Monitoring**

Check if your vector storage is healthy.

```bash
GET /api/semantic-search/health
```

### 5. **Initialization**

Set up Qdrant collections for the first time.

```bash
POST /api/semantic-search/initialize
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Qdrant Configuration (from Railway)
QDRANT_URL=https://your-qdrant-instance.railway.app
QDRANT_API_KEY=your-api-key-here

# OpenAI for embeddings
OPENAI_API_KEY=your-openai-key
```

### 2. Initialize Collections

First time setup:

```bash
curl -X POST "http://localhost:3000/api/semantic-search/initialize" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### 3. Test the Integration

Run the test script:

```bash
npm run test:qdrant
```

## 📊 Memory Types

The system supports these memory types with dedicated vector collections:

- `signal` - Important signals and indicators
- `action` - Actions taken or to be taken
- `state` - Current states and status updates
- `knowledge` - Learning and knowledge items
- `code_snippet` - Code examples and snippets
- `documentation` - Documentation and references
- `error_solution` - Bug fixes and solutions
- `meeting_notes` - Meeting summaries and notes
- `config` - Configuration and settings
- `user_feedback` - Feedback and reviews
- `debug_note` - Debugging notes and findings
- `system_log` - System logs and events
- `api_reference` - API documentation
- `custom` - Custom memory types

## 🎯 Use Cases

### For Developers

```json
{
  "query": "React hooks useState useEffect",
  "memoryTypes": ["code_snippet", "documentation"]
}
```

### For Project Management

```json
{
  "query": "sprint planning team velocity",
  "memoryTypes": ["meeting_notes", "action"]
}
```

### For Learning

```json
{
  "query": "machine learning algorithms",
  "memoryTypes": ["knowledge", "documentation"]
}
```

### For Debugging

```json
{
  "query": "CORS error API request",
  "memoryTypes": ["error_solution", "debug_note"]
}
```

## 🔄 Automatic Features

### Vector Creation

Every new memory automatically:

1. Generates an embedding using OpenAI
2. Stores the vector in Qdrant
3. Maintains sync between PostgreSQL and Qdrant

### Smart Updates

When you update a memory:

1. New embedding is generated
2. Vector is updated in Qdrant
3. Relationships are preserved

### Clean Deletion

When you delete a memory:

1. Removed from PostgreSQL
2. Vector deleted from Qdrant
3. No orphaned data

## 📈 Performance Tips

### Search Optimization

- Use specific memory types for faster searches
- Adjust `minScore` based on your needs (0.7 is good default)
- Limit results to avoid overwhelming responses

### Memory Organization

- Use descriptive content for better embeddings
- Add relevant metadata for filtering
- Tag memories for traditional search fallback

## 🛠 Troubleshooting

### Connection Issues

```bash
# Check Qdrant health
curl "http://localhost:3000/api/semantic-search/health" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Collection Problems

```bash
# Reinitialize collections
curl -X POST "http://localhost:3000/api/semantic-search/initialize" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Embedding Failures

- Check OpenAI API key
- Verify API quota
- Monitor logs for errors

## 🎉 What's Next?

This is just the beginning! Future enhancements could include:

- **Memory Insights Dashboard** - Visual analytics of your memory patterns
- **Auto-tagging** - AI-generated tags based on content
- **Memory Relationships** - Discover connections between memories
- **Temporal Analysis** - Track how your thoughts evolve over time
- **Smart Notifications** - Get reminded of relevant memories contextually

---

**Happy Memory Building!** 🧠✨
