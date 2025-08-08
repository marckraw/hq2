# 📚 HQ Documentation Hub

Welcome to the HQ project documentation! This is your central hub for navigating all documentation across the platform.

## 🏗️ Architecture Overview

The HQ platform consists of two main packages:

- **🔧 TheGrid** (`packages/thegrid/`) - Backend services, AI agents, and APIs
- **🎨 TheHorizon** (`packages/thehorizon/`) - Frontend React application and UI components

---

## ✅ Implemented Features & Architecture

### Cross-Platform Architecture

- [Event-Driven Architecture](./implemented/event-driven-architecture.md) - System-wide event handling and communication

### Backend (TheGrid)

- [Service Architecture](../packages/thegrid/docs/architecture/SERVICE_ARCHITECTURE.md) - Complete backend service structure
- [Memory System](../packages/thegrid/docs/features/QDRANT_MEMORY_GUIDE.md) - Vector database and memory management
- [Prompt Engineering](../packages/thegrid/docs/guides/Prompt%20Engineer%20Techniques.md) - Best practices for LLM prompts

### Frontend (TheHorizon)

- [State Management](../packages/thehorizon/docs/state-management/README.md) - Jotai-based state architecture
- [Chat Features](../packages/thehorizon/docs/state-management/chat-state.md) - Real-time chat implementation
- [Streaming](../packages/thehorizon/docs/features/streaming.md) - Real-time data streaming

---

## 🚀 Roadmaps & Future Plans

### Backend Roadmaps

- [Langfuse Integration](../packages/thegrid/docs/roadmap/langfuse-integration-roadmap.md) - LLM observability and analytics roadmap

### Frontend Roadmaps

- Coming soon: UI/UX improvements, performance optimization

---

## 📖 Development Guides

### Backend Development

- [Service Architecture Guide](../packages/thegrid/docs/architecture/SERVICE_ARCHITECTURE.md)
- [Prompt Engineering Techniques](../packages/thegrid/docs/guides/Prompt%20Engineer%20Techniques.md)
- [Memory System Guide](../packages/thegrid/docs/features/QDRANT_MEMORY_GUIDE.md)

### Frontend Development

- [Adding New State Atoms](../packages/thehorizon/docs/state-management/adding-new-atoms.md)
- [State Migration Guide](../packages/thehorizon/docs/state-management/migration-guide.md)
- [Component Development](../packages/thehorizon/docs/README.md)

---

## 📁 Documentation Structure

```
docs/                                    # Master documentation hub
├── implemented/                         # ✅ Current features & architecture
├── roadmap/                            # 🚀 Future plans (cross-platform)
└── guides/                             # 📚 Cross-platform guides

packages/thegrid/docs/                   # Backend-specific documentation
├── architecture/                       # Backend architecture docs
├── features/                          # Implemented backend features
├── guides/                            # Backend development guides
└── roadmap/                           # Backend-specific roadmaps

packages/thehorizon/docs/               # Frontend-specific documentation
├── state-management/                  # State architecture & guides
├── features/                         # Frontend feature documentation
└── roadmap/                          # Frontend-specific roadmaps
```

---

## 🚀 Quick Start

1. **New to the project?** Start with [Service Architecture](../packages/thegrid/docs/architecture/SERVICE_ARCHITECTURE.md)
2. **Frontend developer?** Check out [State Management](../packages/thehorizon/docs/state-management/README.md)
3. **Working with AI?** Read [Prompt Engineering](../packages/thegrid/docs/guides/Prompt%20Engineer%20Techniques.md)
4. **Setting up memory?** Follow [Memory System Guide](../packages/thegrid/docs/features/QDRANT_MEMORY_GUIDE.md)

---

## 🤝 Contributing to Documentation

- **Package-specific docs** should be added to the respective package's `docs/` folder
- **Cross-platform architecture** docs go in the root `docs/implemented/` folder
- **Future plans and roadmaps** go in the appropriate `roadmap/` folders
- **Always update this index** when adding new major documentation

---

_Last updated: 2025-01-14_
