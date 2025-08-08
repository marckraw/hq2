import type { AgentInterface } from "../interfaces/AgentInterface";
import type { AgentPlan, AgentPlanStep, SubthreadMessage } from "../types";

export class HermesAgent implements AgentInterface {
  id = "hermes";
  name = "Hermes";
  description = "Communication & documentation specialist";
  
  private thoughts: string[] = [];
  
  canHandle(input: string): boolean {
    const communicationKeywords = ["document", "explain", "communicate", "write", "report", "announce", "stakeholder", "release notes"];
    return communicationKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }
  
  getConfidence(input: string): number {
    const lowerInput = input.toLowerCase();
    let confidence = 0.5;
    
    if (lowerInput.includes("document") || lowerInput.includes("documentation")) confidence += 0.3;
    if (lowerInput.includes("communicate") || lowerInput.includes("explain")) confidence += 0.2;
    if (lowerInput.includes("write") || lowerInput.includes("report")) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }
  
  async respond(input: string): Promise<string> {
    this.thoughts = [
      "Analyzing communication requirements...",
      "Identifying target audiences...",
      "Structuring information for clarity..."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return "I'll create comprehensive documentation that clearly explains the technical concepts to all stakeholders, with appropriate detail levels for different audiences.";
  }
  
  createPlan(input: string, availableAgents: string[]): AgentPlan {
    const steps: AgentPlanStep[] = [];
    
    // If technical understanding needed
    if (input.includes("technical") || input.includes("api") || input.includes("code")) {
      steps.push({
        agent: "valkyrie",
        task: "Provide technical details and code examples",
        tools: ["code_analyzer", "api_documenter"]
      });
    }
    
    // If architecture documentation needed
    if (input.includes("architecture") || input.includes("system") || input.includes("design")) {
      steps.push({
        agent: "odin",
        task: "Provide architectural diagrams and design rationale",
        dependsOn: steps.length > 0 ? [steps[0].agent] : undefined
      });
    }
    
    // Always do communication analysis
    steps.push({
      agent: this.id,
      task: "Create clear, audience-appropriate documentation",
      tools: ["markdown_generator", "diagram_creator", "template_engine"],
      dependsOn: steps.length > 0 ? steps.map(s => s.agent) : undefined
    });
    
    // If release or announcement
    if (input.includes("release") || input.includes("announce") || input.includes("stakeholder")) {
      steps.push({
        agent: this.id,
        task: "Prepare stakeholder communications and announcements",
        dependsOn: [steps[steps.length - 1].agent]
      });
    }
    
    return {
      steps,
      strategy: steps.length > 2 ? "mixed" : "sequential",
      expectedDuration: steps.length * 1500
    };
  }
  
  async executeTask(task: string, context?: any): Promise<SubthreadMessage> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let content = "";
    let tools: string[] = [];
    let confidence = 0.90;
    
    if (task.includes("documentation")) {
      content = `Documentation structure created:

# API Documentation

## Overview
Comprehensive guide to our RESTful API with examples and best practices.

## Authentication
- OAuth 2.0 flow with JWT tokens
- API key authentication for server-to-server
- Rate limiting: 1000 requests/hour per user

## Endpoints

### User Management
- \`GET /api/v1/users\` - List users (paginated)
- \`POST /api/v1/users\` - Create new user
- \`GET /api/v1/users/{id}\` - Get user details
- \`PUT /api/v1/users/{id}\` - Update user
- \`DELETE /api/v1/users/{id}\` - Delete user

## Error Handling
All errors follow RFC 7807 (Problem Details for HTTP APIs)

## Examples
Includes curl, JavaScript, Python, and Go examples for each endpoint.`;
      tools = ["markdown_generator", "api_documenter", "example_generator"];
      confidence = 0.94;
    } else if (task.includes("stakeholder")) {
      content = `Stakeholder communication prepared:

**Executive Summary** (1 page)
- Project status: On track for Q2 delivery
- Budget utilization: 68% (within projections)
- Key achievements: Core functionality complete
- Risks: Minor - resource availability in June

**Technical Summary** (for engineering leaders)
- Architecture: Microservices with 99.9% SLA
- Performance: 150ms p99 latency achieved
- Security: SOC2 compliance ready
- Tech debt: Reduced by 30%

**User Impact Summary** (for product team)
- New features enable 3x faster workflows
- User satisfaction projected to increase 40%
- Training materials prepared
- Rollout plan includes gradual migration`;
      tools = ["template_engine", "report_generator"];
      confidence = 0.92;
    } else if (task.includes("release notes")) {
      content = `Release Notes v2.5.0

## 🎉 New Features
- **Multi-factor Authentication**: Enhanced security with TOTP support
- **Real-time Notifications**: Instant updates via WebSocket
- **Advanced Search**: Filter by date, status, and custom fields
- **Bulk Operations**: Process up to 1000 items simultaneously

## 🚀 Improvements
- Page load time reduced by 40%
- Memory usage optimized (30% reduction)
- API response compression enabled
- Database query optimization

## 🐛 Bug Fixes
- Fixed: Login timeout after 15 minutes (#234)
- Fixed: CSV export missing unicode characters (#567)
- Fixed: Dashboard widgets not refreshing (#789)
- Fixed: Mobile navigation overlap (#345)

## 📝 Breaking Changes
- API v1 deprecated (use v2)
- Changed authentication header format
- Removed legacy XML endpoints`;
      tools = ["changelog_generator", "version_tracker"];
      confidence = 0.96;
    } else {
      content = `Communication task completed: ${task}. Clear, concise documentation prepared for all audiences.`;
      tools = ["general_documenter"];
    }
    
    return {
      id: `${this.id}-${Date.now()}`,
      fromAgent: this.id,
      content,
      timestamp: new Date(),
      tools,
      confidence
    };
  }
  
  synthesize(originalQuery: string, plan: AgentPlan, responses: SubthreadMessage[]): string {
    const myResponses = responses.filter(r => r.fromAgent === this.id);
    const otherResponses = responses.filter(r => r.fromAgent !== this.id);
    
    let synthesis = "# Documentation & Communication Plan\n\n";
    
    // Add technical context from other agents
    if (otherResponses.length > 0) {
      synthesis += "## Technical Context\n\n";
      
      otherResponses.forEach(response => {
        if (response.fromAgent === "valkyrie") {
          synthesis += "### Implementation Details\n" + response.content + "\n\n";
        } else if (response.fromAgent === "odin") {
          synthesis += "### Architecture Overview\n" + response.content + "\n\n";
        }
      });
    }
    
    // Add documentation deliverables
    const docResponse = myResponses.find(r => r.content.includes("Documentation"));
    if (docResponse) {
      synthesis += "## Documentation Deliverables\n" + docResponse.content + "\n\n";
    }
    
    // Add communication plan
    const commResponse = myResponses.find(r => r.content.includes("communication"));
    if (commResponse) {
      synthesis += "## Stakeholder Communications\n" + commResponse.content + "\n\n";
    }
    
    // Final recommendations
    synthesis += "## Communication Strategy\n\n";
    synthesis += "1. **Technical Documentation**: Comprehensive API docs with examples\n";
    synthesis += "2. **User Guides**: Step-by-step tutorials with screenshots\n";
    synthesis += "3. **Executive Reports**: High-level progress and impact metrics\n";
    synthesis += "4. **Release Communications**: Coordinated announcements across channels\n\n";
    synthesis += "All documentation will be version-controlled, searchable, and regularly updated.";
    
    return synthesis;
  }
  
  getInternalThoughts(): string[] {
    return this.thoughts;
  }
  
  getAvailableTools(): string[] {
    return [
      "markdown_generator",
      "diagram_creator",
      "template_engine",
      "api_documenter",
      "changelog_generator",
      "report_generator",
      "presentation_builder",
      "example_generator"
    ];
  }
}