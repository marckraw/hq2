import type { AgentInterface } from "../interfaces/AgentInterface";
import type { AgentPlan, AgentPlanStep, SubthreadMessage } from "../types";

export class ValkyrieAgent implements AgentInterface {
  id = "valkyrie";
  name = "Valkyrie";
  description = "Code warrior & debugger";
  
  private thoughts: string[] = [];
  
  canHandle(input: string): boolean {
    const codeKeywords = ["debug", "error", "bug", "code", "implement", "fix", "build", "develop", "test"];
    return codeKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }
  
  getConfidence(input: string): number {
    const lowerInput = input.toLowerCase();
    let confidence = 0.5;
    
    // Strong indicators
    if (lowerInput.includes("debug") || lowerInput.includes("error")) confidence += 0.3;
    if (lowerInput.includes("implement") || lowerInput.includes("build")) confidence += 0.2;
    if (lowerInput.includes("test") || lowerInput.includes("fix")) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }
  
  async respond(input: string): Promise<string> {
    this.thoughts = [
      "Analyzing code patterns...",
      "Checking for common issues...",
      "Formulating solution approach..."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return "I've identified the issue in the authentication flow. The token refresh logic has a race condition. Here's my recommended fix with proper error handling.";
  }
  
  createPlan(input: string, availableAgents: string[]): AgentPlan {
    const steps: AgentPlanStep[] = [];
    
    // Start with problem analysis
    steps.push({
      agent: this.id,
      task: "Analyze technical requirements and identify potential issues",
      tools: ["code_analyzer", "dependency_checker"]
    });
    
    // If system monitoring needed
    if (input.includes("performance") || input.includes("system") || input.includes("production")) {
      steps.push({
        agent: "heimdall",
        task: "Monitor system metrics and identify bottlenecks",
        dependsOn: [steps[0].agent]
      });
    }
    
    // If timeline needed
    if (input.includes("when") || input.includes("schedule") || input.includes("plan")) {
      steps.push({
        agent: "chronos",
        task: "Estimate timeline and identify scheduling constraints",
        dependsOn: [steps[0].agent]
      });
    }
    
    // Synthesis step
    steps.push({
      agent: this.id,
      task: "Synthesize findings and create implementation plan",
      dependsOn: steps.slice(0, -1).map(s => s.agent)
    });
    
    return {
      steps,
      strategy: steps.length > 2 ? "mixed" : "sequential",
      expectedDuration: steps.length * 1500
    };
  }
  
  async executeTask(task: string, context?: any): Promise<SubthreadMessage> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let content = "";
    let tools: string[] = [];
    
    if (task.includes("analyze")) {
      content = "Code analysis complete. Found 3 areas for improvement: error handling, async flow, and type safety.";
      tools = ["code_analyzer", "ast_parser"];
    } else if (task.includes("synthesize")) {
      content = "Based on all inputs, I recommend a phased refactoring approach with comprehensive test coverage.";
      tools = ["solution_synthesizer"];
    } else {
      content = `Completed task: ${task}. Results are positive with minor concerns about edge cases.`;
      tools = ["general_analyzer"];
    }
    
    return {
      id: `${this.id}-${Date.now()}`,
      fromAgent: this.id,
      content,
      timestamp: new Date(),
      tools,
      confidence: 0.9
    };
  }
  
  synthesize(originalQuery: string, plan: AgentPlan, responses: SubthreadMessage[]): string {
    const myResponses = responses.filter(r => r.fromAgent === this.id);
    const otherResponses = responses.filter(r => r.fromAgent !== this.id);
    
    let synthesis = "## Technical Analysis & Recommendations\n\n";
    
    // Add own primary analysis
    const primaryAnalysis = myResponses.find(r => r.content.includes("analysis"));
    if (primaryAnalysis) {
      synthesis += "### Code Analysis\n" + primaryAnalysis.content + "\n\n";
    }
    
    // Add insights from other agents
    if (otherResponses.length > 0) {
      synthesis += "### Additional Considerations\n\n";
      otherResponses.forEach(response => {
        if (response.fromAgent === "heimdall") {
          synthesis += "**System Impact**: " + response.content + "\n\n";
        } else if (response.fromAgent === "chronos") {
          synthesis += "**Timeline**: " + response.content + "\n\n";
        }
      });
    }
    
    // Final recommendation
    const finalRec = myResponses.find(r => r.content.includes("recommend"));
    if (finalRec) {
      synthesis += "### Implementation Plan\n" + finalRec.content;
    }
    
    return synthesis;
  }
  
  getInternalThoughts(): string[] {
    return this.thoughts;
  }
  
  getAvailableTools(): string[] {
    return ["code_analyzer", "debugger", "test_runner", "performance_profiler", "dependency_checker"];
  }
}