# 🔄 Storyblok-to-IRF Reverse Transformation Roadmap

## Overview

This document outlines our comprehensive strategy for implementing bidirectional transformation between Storyblok CMS and IRF (Intermediate Response Format), enabling seamless content migration and editing workflows.

## What is Storyblok-to-IRF Transformation?

**Storyblok-to-IRF Transformation** enables:

- 🔄 **Bidirectional Content Flow** - Transform content from Storyblok back to IRF format
- 📝 **Content Migration** - Import existing Storyblok content into IRF workflow
- 🔧 **Editor Integration** - Allow editing of Storyblok content through IRF tools
- 🎯 **Component Mapping** - Intelligent mapping between Storyblok and IRF components
- 🧠 **AI-Powered Extraction** - LLM assistance for unknown component types
- 📊 **Metadata Preservation** - Maintain design intent and component relationships

---

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Storyblok │───▶│ Transformer │───▶│     IRF     │
│    JSON     │    │   Service   │    │   Layout    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │  Component  │
                   │  Registry   │
                   └─────────────┘
```

**Current Flow**: `User Prompt` → `IRF Architect Agent` → `IRF` → `IRF-to-Storyblok Service` → `Storyblok JSON`

**New Flow**: `Storyblok JSON` → `Storyblok-to-IRF Service` → `IRF` → `IRF Architect Agent` (for editing)

---

## 🚀 Phase 1: Core Infrastructure & MVP Components

### Status: ✅ COMPLETED

### Goals:

Establish the foundational service architecture and implement 5 core components for immediate functionality.

### Components to Implement:

#### 🏗️ Service Infrastructure

- **StoryblokToIRFService Factory**: Mirror pattern of existing `IRFToStoryblokService`
- **Reverse Component Registry**: Mapping from Storyblok components to IRF nodes
- **Type Definitions**: Complete TypeScript interfaces for transformation pipeline
- **Error Handling**: Comprehensive validation and error reporting
- **Service Registration**: Integration with existing service registry

#### 🎯 Core Component Transformers

**Target Components** (MVP):

1. **`page`** → `IntermediateNode` (type: "page")
2. **`sb-section`** → `IntermediateNode` (type: "section")
3. **`sb-text-section`** → `IntermediateNode` (type: "text")
4. **`sb-headline-section`** → `IntermediateNode` (type: "headline")
5. **`sb-image-section`** → `IntermediateNode` (type: "image")

#### 🔧 Utility Functions

- **Rich Text Parser**: Extract plain text from Storyblok ProseMirror format
- **Asset Handler**: Process Storyblok asset references
- **Nested Structure Handler**: Recursive transformation of component hierarchies
- **Validation Utils**: Ensure generated IRF follows schema requirements

### Implementation Locations:

- `src/domains/irf/services/StoryblokToIRFService/` - Main service directory
- `src/domains/irf/services/StoryblokToIRFService/storyblok-to-irf.service.ts` - Core service
- `src/domains/irf/services/StoryblokToIRFService/storyblok-to-irf.service.types.ts` - Type definitions
- `src/domains/irf/services/index.ts` - Service registration

### Success Criteria:

- ✅ Service factory created and registered
- ✅ Transform basic Storyblok story with 5 core components
- ✅ Generate valid IRF that passes schema validation
- ✅ Handle nested component structures
- ✅ Extract basic content from rich text fields

### 🎉 Completed Features:

#### 🏗️ Core Service Architecture

- **✅ StoryblokToIRFService Factory**: Complete service factory with proper error handling and logging
- **✅ Service Registration**: Fully integrated with existing service registry pattern
- **✅ TypeScript Types**: Comprehensive type definitions for all transformation interfaces
- **✅ Error & Warning System**: Structured error handling with detailed feedback

#### 🎯 Component Transformers (MVP)

1. **✅ `page` Component**: Root-level page transformation with body handling
2. **✅ `sb-section` Component**: Section transformation with nested content support
3. **✅ `sb-text-section` & `sb-text-flex-group`**: Text component variants with rich text parsing
4. **✅ `sb-headline-section` & `sb-headline-flex-group`**: Headline component variants
5. **✅ `sb-image-section`**: Image component with asset handling and design intent extraction

#### 🔧 Utility Systems

- **✅ Rich Text Parser**: Extracts plain text from Storyblok ProseMirror format
- **✅ Fallback System**: Graceful handling of unknown components using 'group' type
- **✅ Metadata Preservation**: Optional metadata preservation from Storyblok to IRF
- **✅ Caching System**: Transformation result caching for performance
- **✅ Validation Pipeline**: IRF schema validation ensures output integrity

#### 🧪 Quality Assurance

- **✅ Comprehensive Test Suite**: Unit tests covering all core transformations
- **✅ Health Check System**: Service health monitoring and validation
- **✅ Error Scenarios**: Proper handling of malformed input and edge cases

#### 📊 Performance Features

- **✅ Recursive Component Counting**: Accurate component counting for analytics
- **✅ Transformation Context**: Proper parent-child relationship tracking
- **✅ Cache Management**: Cache statistics and clearing capabilities

---

## 🔍 Phase 2: Rich Text Processing & Design Intent

### Status: ⏳ PLANNED

### Goals:

Implement sophisticated content extraction and design intent reverse mapping.

### Features to Implement:

#### 📝 Advanced Rich Text Processing

- **ProseMirror Parser**: Handle complex rich text structures
- **Formatting Preservation**: Extract semantic meaning from text formatting
- **Link Extraction**: Convert Storyblok links to IRF props
- **List Processing**: Transform rich text lists to IRF list components
- **Nested Content**: Handle complex nested rich text scenarios

#### 🎨 Design Intent Extraction

- **Visual Property Mapping**: Extract colors, spacing, typography from Storyblok
- **Layout Intent Recovery**: Reverse map layout properties to IRF design schema
- **Component Styling**: Extract component-specific design properties
- **Responsive Design**: Handle multi-device design configurations
- **Asset Design Context**: Extract design context from image components

#### 🧩 Extended Component Registry

**Additional Components**:

- `sb-flex-group-section` → `flex-group`
- `sb-list-section` → `list`
- `sb-list-item` → `list-item`
- `sb-divider-section` → `divider`
- `sb-editorial-card-section` → `editorial-card`

### Implementation Areas:

- Rich text processing utilities
- Design intent reverse mapping service
- Extended component transformer registry
- Asset processing and metadata extraction

---

## 🤖 Phase 3: AI-Powered Component Detection

### Status: ⏳ PLANNED

### Goals:

Add intelligent component recognition for unknown Storyblok components using LLM analysis.

### Features to Implement:

#### 🧠 LLM Component Analyzer

- **Component Analysis**: Use LLM to analyze unknown Storyblok components
- **Semantic Mapping**: Intelligently map to closest IRF component type
- **Confidence Scoring**: Provide confidence levels for AI-generated mappings
- **Fallback Strategies**: Graceful handling when AI analysis fails
- **Learning Integration**: Improve mappings based on user feedback

#### 📊 Smart Component Registry

- **Dynamic Registration**: Auto-register new component mappings discovered by AI
- **Hybrid Approach**: Combine rule-based and AI-based transformation
- **Component Similarity**: Use embeddings to find similar component patterns
- **User Validation**: Allow users to confirm or correct AI suggestions

#### 🔄 Adaptive Transformation

- **Context-Aware Mapping**: Consider component context for better mapping decisions
- **Multi-Model Support**: Use different LLMs for different analysis tasks
- **Batch Processing**: Efficiently process multiple unknown components
- **Metadata Enrichment**: Add AI insights to transformed IRF components

### Implementation Areas:

- AI component analysis service
- Hybrid transformation pipeline
- Component similarity detection
- User feedback integration system

---

## 🎯 Phase 4: Advanced Features & Optimization

### Status: ⏳ PLANNED

### Goals:

Implement advanced transformation features and optimize performance.

### Features to Implement:

#### ⚡ Performance Optimization

- **Transformation Caching**: Cache transformation results for repeated content
- **Batch Processing**: Handle multiple Storyblok stories efficiently
- **Streaming Support**: Transform large content sets progressively
- **Memory Management**: Optimize memory usage for large transformations

#### 🔍 Advanced Analysis

- **Content Structure Analysis**: Understand content patterns and relationships
- **Component Usage Analytics**: Track which components are used most frequently
- **Transformation Quality Metrics**: Measure transformation accuracy and completeness
- **Performance Benchmarking**: Monitor transformation speed and resource usage

#### 🛠️ Developer Tools

- **Transformation Debugger**: Visual tool for debugging transformation issues
- **Component Mapping Editor**: GUI for editing component transformation rules
- **Test Suite**: Comprehensive testing framework for transformation accuracy
- **Migration Tools**: Bulk transformation utilities for content migration

#### 🔧 Integration Features

- **Webhook Integration**: Real-time transformation of Storyblok content changes
- **CLI Tools**: Command-line utilities for batch transformations
- **API Endpoints**: RESTful API for transformation services
- **Validation Pipeline**: Ensure transformed content meets quality standards

---

## 🎨 Phase 5: User Experience & Ecosystem

### Status: ⏳ PLANNED

### Goals:

Provide seamless user experience and integrate with the broader HQ ecosystem.

### Features to Implement:

#### 👥 User Interface

- **Transformation Dashboard**: Visual interface for managing transformations
- **Preview Mode**: Preview IRF content before finalizing transformation
- **Diff Viewer**: Compare original Storyblok with transformed IRF
- **Error Resolution**: User-friendly error reporting and resolution suggestions

#### 🔄 Workflow Integration

- **Editor Integration**: Seamless integration with existing IRF editing tools
- **Version Control**: Track transformation history and changes
- **Approval Workflow**: Review process for transformed content
- **Rollback Capabilities**: Undo transformations if needed

#### 📊 Analytics & Reporting

- **Transformation Reports**: Detailed reports on transformation results
- **Content Analytics**: Insights into content structure and patterns
- **Usage Metrics**: Track transformation service usage and performance
- **Quality Metrics**: Measure and improve transformation quality over time

---

## 🧪 Testing Strategy

### Unit Testing

- Component transformer functions
- Rich text parsing utilities
- Design intent extraction
- Error handling scenarios

### Integration Testing

- End-to-end transformation pipeline
- Service registry integration
- AI component analysis workflow
- Performance benchmarks

### Validation Testing

- IRF schema validation
- Content integrity checks
- Design intent accuracy
- Metadata preservation

---

## 📊 Success Metrics

### Technical Metrics

- **Transformation Accuracy**: % of successful transformations
- **Performance**: Average transformation time per component
- **Coverage**: % of Storyblok components with working transformers
- **Error Rate**: % of transformations that fail or produce invalid IRF

### Business Metrics

- **Content Migration Success**: Amount of content successfully migrated
- **User Adoption**: Number of users utilizing reverse transformation
- **Workflow Efficiency**: Time saved in content editing workflows
- **System Integration**: Successful integration with existing HQ workflows

---

## 📅 Timeline

| Phase       | Duration | Key Deliverables                             |
| ----------- | -------- | -------------------------------------------- |
| **Phase 1** | 1 week   | MVP service with 5 core components           |
| **Phase 2** | 1 week   | Rich text processing + extended components   |
| **Phase 3** | 2 weeks  | AI-powered component detection               |
| **Phase 4** | 2 weeks  | Performance optimization + advanced features |
| **Phase 5** | 1 week   | UI/UX + ecosystem integration                |

**Total Estimated Timeline: 7 weeks**

---

## 🚦 Current Status

- ✅ **Phase 1 COMPLETED**: Core service infrastructure and MVP transformers fully implemented
- ✅ **5 Core Components**: page, section, text, headline, image transformations working
- ✅ **Service Registration**: Integrated with service registry and available system-wide
- ✅ **Testing Suite**: Comprehensive tests covering all transformation scenarios
- 🎯 **Next Milestone**: Phase 2 - Rich Text Processing & Design Intent (Ready to start!)

### 📈 Usage

The service is now available throughout the application:

```typescript
import { serviceRegistry } from "@/registry/service-registry";

// Get the service
const storyblokToIRF = serviceRegistry.get("storyblokToIRF");

// Transform a Storyblok story to IRF
const result = await storyblokToIRF.transformStoryblokToIRF(storyblokStory, {
  includeMetadata: true,
  extractPlainText: true,
});

if (result.success) {
  console.log("IRF Layout:", result.irfLayout);
} else {
  console.error("Transformation errors:", result.errors);
}
```

---

## 📚 Resources

- [IRF Schema Documentation](../architecture/SERVICE_ARCHITECTURE.md)
- [Storyblok API Documentation](https://www.storyblok.com/docs/api)
- [Existing IRF-to-Storyblok Service](../../src/domains/irf/services/IRFToStoryblokService/)
- [Component Registry Patterns](../../src/domains/irf/services/)
