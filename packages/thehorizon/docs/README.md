# 🎨 TheHorizon Documentation

**TheHorizon** is the frontend React application of the HQ platform, providing the user interface, real-time chat, and interactive components.

## 📁 Documentation Structure

### 🏗️ State Management

Complete guide to the application's state architecture using Jotai.

- **[Architecture Overview](./state-management/architecture.md)** - Core principles and patterns
- **[Global State](./state-management/global-state.md)** - Global vs feature state boundaries
- **[Chat State](./state-management/chat-state.md)** - Chat-specific hooks API reference
- **[Adding New Atoms](./state-management/adding-new-atoms.md)** - Step-by-step developer guide
- **[Migration Guide](./state-management/migration-guide.md)** - Legacy atoms → hooks migration

### ✅ Features

Feature-specific implementation guides and integrations.

- **[Streaming](./features/streaming.md)** - Enhanced streaming integration
- Real-time chat components
- State-driven UI patterns

### 🚀 Roadmaps

Future frontend improvements and feature plans.

- UI/UX enhancements (coming soon)
- Performance optimization plans (coming soon)
- Component library expansion (coming soon)

---

## 🚀 Quick Start for Frontend Developers

### For New Developers

1. **Understanding the Architecture**: Start with **[Architecture Overview](./state-management/architecture.md)**
2. **Working with Chat**: Review **[Chat State](./state-management/chat-state.md)** for the hooks API
3. **Global Patterns**: Check **[Global State](./state-management/global-state.md)**
4. **Adding Features**: Use **[Adding New Atoms](./state-management/adding-new-atoms.md)** guide

### For Existing Developers

- **Migration needed?** See **[Migration Guide](./state-management/migration-guide.md)**
- **Adding features?** Check **[Features](./features/)** for integration patterns
- **Adding state?** Follow **[Adding New Atoms](./state-management/adding-new-atoms.md)** guide
- **State questions?** Reference **[Chat State](./state-management/chat-state.md)** hooks

---

## 🏛️ Architecture Highlights

- **🎣 Hook-Based State**: Clean, encapsulated state management
- **🔒 Private Atoms**: Implementation details hidden from components
- **📦 Domain Organization**: State organized by feature domains
- **🎯 Type Safety**: Full TypeScript support throughout
- **🧪 Testable**: Hook-based patterns for easy testing

---

## 🔗 Related Documentation

- [Master Documentation Hub](../../../docs/README.md) - Main documentation index
- [Backend Documentation](../../thegrid/docs/README.md) - TheGrid backend docs
- [Event-Driven Architecture](../../../docs/implemented/event-driven-architecture.md) - Cross-platform event system

---

## 📝 Contributing

When adding new documentation:

1. Place in appropriate category (`state-management/`, `features/`, or `roadmap/`)
2. Update this README with links
3. Follow existing naming conventions (lowercase, kebab-case)
4. Include clear examples and code snippets
5. Update the [master documentation hub](../../../docs/README.md) if adding major sections

---

**Last Updated**: January 2025  
**Architecture**: Jotai + React Hooks Pattern  
**Status**: ✅ Fully Migrated to Hook Architecture

_For the complete documentation overview, visit the [main documentation hub](../../../docs/README.md)._
