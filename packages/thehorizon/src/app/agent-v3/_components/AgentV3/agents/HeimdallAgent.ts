import type { AgentInterface } from "../interfaces/AgentInterface";
import type { AgentPlan, AgentPlanStep, SubthreadMessage } from "../types";

export class HeimdallAgent implements AgentInterface {
  id = "heimdall";
  name = "Heimdall";
  description = "All-seeing system observer";
  
  private thoughts: string[] = [];
  
  canHandle(input: string): boolean {
    const monitoringKeywords = ["system", "monitor", "performance", "crash", "error", "deploy", "production", "metrics"];
    return monitoringKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }
  
  getConfidence(input: string): number {
    const lowerInput = input.toLowerCase();
    let confidence = 0.5;
    
    if (lowerInput.includes("system") || lowerInput.includes("monitor")) confidence += 0.3;
    if (lowerInput.includes("crash") || lowerInput.includes("error")) confidence += 0.2;
    if (lowerInput.includes("performance") || lowerInput.includes("metrics")) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }
  
  async respond(input: string): Promise<string> {
    this.thoughts = [
      "Scanning system metrics...",
      "Analyzing performance patterns...",
      "Checking error logs and anomalies..."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return "System analysis complete. All services are operational with normal performance metrics. No anomalies detected in the last 24 hours.";
  }
  
  createPlan(input: string, availableAgents: string[]): AgentPlan {
    const steps: AgentPlanStep[] = [];
    
    // Start with system analysis
    steps.push({
      agent: this.id,
      task: "Monitor system metrics and identify anomalies",
      tools: ["metrics_collector", "log_analyzer", "alert_monitor"]
    });
    
    // If debugging needed, consult Valkyrie
    if (input.includes("debug") || input.includes("fix") || input.includes("error")) {
      steps.push({
        agent: "valkyrie",
        task: "Analyze code for potential issues and fixes",
        dependsOn: [steps[0].agent]
      });
    }
    
    // If timeline analysis needed
    if (input.includes("when") || input.includes("timeline") || input.includes("history")) {
      steps.push({
        agent: "chronos",
        task: "Analyze event timeline and patterns",
        dependsOn: [steps[0].agent]
      });
    }
    
    // If architecture concerns
    if (input.includes("scale") || input.includes("architecture") || input.includes("design")) {
      steps.push({
        agent: "odin",
        task: "Evaluate system architecture and scalability",
        dependsOn: steps.map(s => s.agent)
      });
    }
    
    return {
      steps,
      strategy: steps.length > 2 ? "mixed" : "sequential",
      expectedDuration: steps.length * 1800
    };
  }
  
  async executeTask(task: string, context?: any): Promise<SubthreadMessage> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    let content = "";
    let tools: string[] = [];
    let confidence = 0.85;
    
    if (task.includes("monitor")) {
      content = `System metrics analyzed:
- CPU: 45% avg (peaks at 78%)
- Memory: 6.2GB/16GB used
- Network: 125 Mbps in/out
- Disk I/O: 45 MB/s read, 32 MB/s write
- Error rate: 0.02% (within normal range)`;
      tools = ["prometheus", "grafana", "datadog"];
      confidence = 0.92;
    } else if (task.includes("anomal")) {
      content = `Anomaly detection results:
⚠️ Spike in API response time at 14:32 UTC (250ms → 1.2s)
⚠️ Increased memory allocation in worker-3 process
✅ All other metrics within expected ranges`;
      tools = ["anomaly_detector", "pattern_analyzer"];
      confidence = 0.88;
    } else if (task.includes("readiness")) {
      content = `Deployment readiness assessment:
✅ All health checks passing
✅ Database migrations verified
✅ Rollback plan in place
⚠️ Consider increasing replica count for high traffic
Risk level: LOW`;
      tools = ["health_checker", "deployment_validator"];
      confidence = 0.95;
    } else {
      content = `Monitoring task completed: ${task}. All systems functioning within normal parameters.`;
      tools = ["general_monitor"];
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
    
    let synthesis = "## System Analysis Report\n\n";
    
    // Add monitoring data
    const monitoringData = myResponses.find(r => r.content.includes("metrics"));
    if (monitoringData) {
      synthesis += "### Current System Status\n" + monitoringData.content + "\n\n";
    }
    
    // Add insights from other agents
    otherResponses.forEach(response => {
      if (response.fromAgent === "valkyrie") {
        synthesis += "### Code Analysis\n" + response.content + "\n\n";
      } else if (response.fromAgent === "chronos") {
        synthesis += "### Timeline Analysis\n" + response.content + "\n\n";
      } else if (response.fromAgent === "odin") {
        synthesis += "### Architecture Recommendations\n" + response.content + "\n\n";
      }
    });
    
    // Final recommendations
    synthesis += "### Recommendations\n";
    synthesis += "Based on comprehensive system analysis:\n";
    synthesis += "1. " + (originalQuery.includes("crash") ? "Implement the identified fixes immediately\n" : "Continue monitoring current metrics\n");
    synthesis += "2. Set up alerts for the identified warning signs\n";
    synthesis += "3. Schedule regular system health reviews\n";
    
    return synthesis;
  }
  
  getInternalThoughts(): string[] {
    return this.thoughts;
  }
  
  getAvailableTools(): string[] {
    return [
      "prometheus", 
      "grafana", 
      "datadog", 
      "log_analyzer", 
      "metrics_collector",
      "anomaly_detector",
      "alert_monitor",
      "health_checker"
    ];
  }
}