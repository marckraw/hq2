import type { AgentInterface } from "../interfaces/AgentInterface";
import type { AgentPlan, AgentPlanStep, SubthreadMessage } from "../types";

export class OdinAgent implements AgentInterface {
  id = "odin";
  name = "Odin";
  description = "Architecture & strategic planning";
  
  private thoughts: string[] = [];
  
  canHandle(input: string): boolean {
    const architectureKeywords = ["architecture", "design", "strategy", "plan", "roadmap", "scale", "microservice", "system design"];
    return architectureKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }
  
  getConfidence(input: string): number {
    const lowerInput = input.toLowerCase();
    let confidence = 0.5;
    
    if (lowerInput.includes("architecture") || lowerInput.includes("design")) confidence += 0.3;
    if (lowerInput.includes("strategy") || lowerInput.includes("roadmap")) confidence += 0.3;
    if (lowerInput.includes("plan") || lowerInput.includes("scale")) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }
  
  async respond(input: string): Promise<string> {
    this.thoughts = [
      "Analyzing system architecture...",
      "Evaluating scalability patterns...",
      "Considering best practices and trade-offs..."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return "Based on architectural analysis, I recommend a microservices approach with event-driven communication. This provides the scalability and flexibility needed for your growth projections.";
  }
  
  createPlan(input: string, availableAgents: string[]): AgentPlan {
    const steps: AgentPlanStep[] = [];
    
    // Always start with strategic analysis
    steps.push({
      agent: this.id,
      task: "Analyze architectural requirements and constraints",
      tools: ["architecture_analyzer", "pattern_matcher", "tech_stack_evaluator"]
    });
    
    // For implementation details, consult Valkyrie
    if (input.includes("implement") || input.includes("build") || input.includes("code")) {
      steps.push({
        agent: "valkyrie",
        task: "Evaluate technical implementation complexity",
        dependsOn: [steps[0].agent]
      });
    }
    
    // For timeline planning
    if (input.includes("when") || input.includes("timeline") || input.includes("roadmap")) {
      steps.push({
        agent: "chronos",
        task: "Create detailed timeline with milestones",
        dependsOn: [steps[0].agent]
      });
    }
    
    // For system readiness
    if (input.includes("production") || input.includes("deploy") || input.includes("scale")) {
      steps.push({
        agent: "heimdall",
        task: "Assess current system capacity and readiness",
        dependsOn: [steps[0].agent]
      });
    }
    
    // For documentation
    if (input.includes("document") || input.includes("communicate") || availableAgents.includes("hermes")) {
      steps.push({
        agent: "hermes",
        task: "Prepare architecture documentation and diagrams",
        dependsOn: steps.map(s => s.agent)
      });
    }
    
    // Final synthesis
    steps.push({
      agent: this.id,
      task: "Synthesize recommendations into actionable strategy",
      dependsOn: steps.slice(0, -1).map(s => s.agent)
    });
    
    return {
      steps,
      strategy: "mixed", // Some parallel, some sequential
      expectedDuration: steps.length * 2000
    };
  }
  
  async executeTask(task: string, context?: any): Promise<SubthreadMessage> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let content = "";
    let tools: string[] = [];
    let confidence = 0.88;
    
    if (task.includes("architectural requirements")) {
      content = `Architecture analysis complete:
      
**Current State**: Monolithic application with 250K daily active users
**Growth Projection**: 1M users within 12 months
**Key Requirements**:
- High availability (99.99% uptime)
- Sub-200ms response times
- Horizontal scalability
- Multi-region support

**Recommended Architecture**:
- Microservices with API Gateway
- Event-driven communication (Kafka/RabbitMQ)
- CQRS for read/write separation
- Container orchestration with Kubernetes`;
      tools = ["architecture_analyzer", "capacity_planner"];
      confidence = 0.92;
    } else if (task.includes("synthesize")) {
      content = `Strategic Architecture Plan:

**Phase 1 - Foundation (Months 1-2)**
- Extract authentication service
- Set up API Gateway
- Implement service discovery

**Phase 2 - Core Services (Months 3-4)**
- Separate user, product, order services
- Implement event bus
- Add distributed tracing

**Phase 3 - Scale & Optimize (Months 5-6)**
- Add caching layer (Redis)
- Implement CQRS
- Set up multi-region deployment

Each phase maintains backward compatibility with gradual migration path.`;
      tools = ["strategy_synthesizer", "migration_planner"];
      confidence = 0.95;
    } else if (task.includes("pattern")) {
      content = `Design patterns recommendation:
- **API Gateway Pattern**: Central entry point for all clients
- **Circuit Breaker**: Fault tolerance between services
- **Event Sourcing**: Audit trail and replay capability
- **Saga Pattern**: Distributed transaction management
- **BFF Pattern**: Optimized backends for different clients`;
      tools = ["pattern_library", "best_practices_db"];
      confidence = 0.90;
    } else {
      content = `Strategic analysis for: ${task}. Recommended approach aligns with industry best practices and your specific constraints.`;
      tools = ["general_analyzer"];
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
    
    let synthesis = "# Strategic Architecture Recommendation\n\n";
    
    // Add primary analysis
    const primaryAnalysis = myResponses.find(r => r.content.includes("Architecture analysis"));
    if (primaryAnalysis) {
      synthesis += "## System Analysis\n" + primaryAnalysis.content + "\n\n";
    }
    
    // Incorporate other agents' insights
    if (otherResponses.length > 0) {
      synthesis += "## Multi-Perspective Analysis\n\n";
      
      otherResponses.forEach(response => {
        if (response.fromAgent === "valkyrie") {
          synthesis += "### Technical Implementation Assessment\n" + response.content + "\n\n";
        } else if (response.fromAgent === "chronos") {
          synthesis += "### Timeline & Milestones\n" + response.content + "\n\n";
        } else if (response.fromAgent === "heimdall") {
          synthesis += "### Infrastructure Readiness\n" + response.content + "\n\n";
        } else if (response.fromAgent === "hermes") {
          synthesis += "### Documentation Plan\n" + response.content + "\n\n";
        }
      });
    }
    
    // Final strategic recommendation
    const finalRec = myResponses.find(r => r.content.includes("Strategic"));
    if (finalRec) {
      synthesis += "## Implementation Strategy\n" + finalRec.content + "\n\n";
    }
    
    synthesis += "## Next Steps\n";
    synthesis += "1. Review and approve the architectural design\n";
    synthesis += "2. Set up proof of concept for critical components\n";
    synthesis += "3. Create detailed technical specifications\n";
    synthesis += "4. Begin Phase 1 implementation\n";
    
    return synthesis;
  }
  
  getInternalThoughts(): string[] {
    return this.thoughts;
  }
  
  getAvailableTools(): string[] {
    return [
      "architecture_analyzer",
      "pattern_matcher",
      "tech_stack_evaluator",
      "capacity_planner",
      "cost_estimator",
      "migration_planner",
      "dependency_mapper",
      "security_assessor"
    ];
  }
}