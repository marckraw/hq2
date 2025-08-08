import { useState, useCallback } from "react";
import type { Message } from "../_components/AgentV3/types";
import { AVAILABLE_AGENTS } from "../_components/AgentV3/types";

let mockMessageIdCounter = 0;

const MOCK_RESPONSES = {
  chronos: [
    "Based on my time analysis, this would be best scheduled for next Tuesday at 2 PM when you have a clear calendar slot.",
    "I've calculated the optimal timeline: Phase 1 should take 2 weeks, Phase 2 approximately 3 weeks, with a buffer of 1 week for testing.",
    "Looking at historical patterns, similar tasks have taken between 3-5 days. I recommend allocating 4 days for this.",
    "The deadline is in 72 hours. Breaking this down: 24 hours for planning, 36 hours for execution, and 12 hours for review.",
    "For the Q2 roadmap, I suggest a 12-week timeline:\n- Weeks 1-3: Planning and design\n- Weeks 4-8: Core development\n- Weeks 9-10: Testing and refinement\n- Weeks 11-12: Deployment and monitoring",
    "Analyzing your team's velocity: You complete an average of 45 story points per sprint. This feature is estimated at 120 points, so expect 2.5-3 sprints.",
    "Critical path analysis shows the authentication system must be completed by April 15th to avoid blocking other features. I've identified 3 parallel workstreams.",
  ],
  valkyrie: [
    "I've analyzed your code. The issue is on line 42 - you're missing a null check before accessing the user object. Here's the fix:\n```js\nif (user && user.permissions) {\n  // your code here\n}\n```",
    "The performance bottleneck is in the nested loops at lines 156-178. Consider using a Map for O(1) lookups instead of Array.find().",
    "I've identified 3 potential security vulnerabilities: SQL injection risk, missing input validation, and exposed API keys. Let me walk you through the fixes.",
    "Your test coverage is at 67%. I recommend adding unit tests for the UserService and integration tests for the API endpoints.",
    "Architecture analysis complete. Current monolith has 847 tight coupling points. I recommend extracting 5 bounded contexts:\n- User Management\n- Order Processing  \n- Inventory Control\n- Reporting\n- Notifications",
    "The memory leak is caused by event listeners not being cleaned up in the WebSocket handler. Here's the fix:\n```js\ncomponentWillUnmount() {\n  this.socket.removeAllListeners();\n  this.socket.close();\n}\n```",
    "Code complexity analysis: 15 functions exceed cognitive complexity threshold of 10. Refactoring these will improve maintainability by ~40%.",
  ],
  heimdall: [
    "System monitoring shows CPU usage at 78%, memory at 45%. The spike occurred after the deployment at 14:32 UTC.",
    "I'm observing unusual network traffic from IP 192.168.1.42. 15,000 requests in the last hour - possible DDoS attempt.",
    "All systems operational. Database response time: 12ms, API latency: 45ms, Cache hit rate: 94%.",
    "I've detected a pattern: errors increase by 300% every Monday at 9 AM. This correlates with your weekly batch job.",
    "Production metrics for the last 24 hours:\n- Uptime: 99.97%\n- Average response time: 127ms\n- Error rate: 0.03%\n- Active users: 15,234\n- Database connections: 45/100",
    "Anomaly detected: Memory usage growing at 2.3MB/hour. At current rate, you'll hit the limit in 18 hours. Likely cause: unclosed database connections in the worker process.",
    "Deployment readiness check:\n✅ All health checks passing\n✅ Rollback plan verified\n⚠️ Database migrations pending (3)\n❌ Load balancer not configured for blue-green\n\nRisk level: MEDIUM",
  ],
  odin: [
    "Strategic analysis complete. Your architecture needs 3 key improvements:\n1. Implement CQRS to separate read/write concerns\n2. Add event sourcing for audit trail\n3. Introduce API gateway for microservices",
    "I've designed a migration strategy from monolith to microservices:\nPhase 1: Extract authentication (2 weeks)\nPhase 2: Separate payment processing (3 weeks)\nPhase 3: Modularize inventory (4 weeks)\nEach phase includes rollback capabilities.",
    "System design recommendation: Use event-driven architecture with Kafka for inter-service communication. This will reduce coupling by 60% and improve scalability.",
    "Based on your requirements, I recommend a hybrid approach:\n- PostgreSQL for transactional data\n- MongoDB for product catalog\n- Redis for caching\n- Elasticsearch for search\nThis provides optimal performance for each use case.",
  ],
  hermes: [
    "I'll create comprehensive documentation covering:\n1. API endpoints with examples\n2. Authentication flow diagrams\n3. Error codes and handling\n4. Integration guide\n5. Troubleshooting section",
    "Release notes for v2.5.0:\n### New Features\n- Multi-factor authentication\n- Real-time notifications\n- Advanced search filters\n\n### Improvements  \n- 40% faster page loads\n- Reduced memory usage\n\n### Bug Fixes\n- Fixed login timeout issue\n- Resolved data export errors",
    "I've prepared the stakeholder communication:\n- Executive summary (1 page)\n- Technical deep-dive (5 pages)\n- Risk assessment matrix\n- Timeline visualization\n- Budget breakdown\nAll tailored to your audience's technical level.",
    "Documentation audit results: 34% of your API endpoints lack examples, 56% have outdated response schemas. I've prioritized updates based on usage analytics.",
  ],
};

// Contextual response patterns
const CONTEXTUAL_PATTERNS = {
  roadmap: {
    valkyrie:
      "Technical implementation plan:\n1. Set up CI/CD pipeline (Week 1)\n2. Implement core authentication (Weeks 2-3)\n3. Build API endpoints (Weeks 4-6)\n4. Frontend integration (Weeks 7-8)\n5. Testing & optimization (Weeks 9-10)",
    chronos:
      "Q2 Timeline Analysis:\n- April: Foundation & Architecture (4 weeks)\n- May: Core Features Development (4 weeks)\n- June: Testing, Polish & Launch (4 weeks)\nKey milestones: MVP by May 15, Beta by June 1, Launch by June 30",
    odin: "Strategic roadmap architecture:\n- Foundation: Microservices base with Docker/K8s\n- Core Services: Auth, User, Product, Order\n- Data Layer: Event sourcing + CQRS\n- Integration: REST + GraphQL APIs\n- Monitoring: Prometheus + Grafana",
    heimdall:
      "Infrastructure roadmap checklist:\n✅ Dev environment ready\n✅ CI/CD pipeline configured\n⚠️ Staging environment (by April 15)\n⚠️ Production setup (by May 1)\n⚠️ Monitoring stack (by May 15)",
    hermes:
      "Roadmap communication plan:\n- Week 1: Kickoff announcement to all stakeholders\n- Week 4: Progress update with demo\n- Week 8: Beta testing invitation\n- Week 12: Launch announcement\nI'll prepare templates for each communication.",
  },
  debug: {
    heimdall:
      "System analysis at time of crash:\n- CPU: 94% (critical)\n- Memory: 8.7GB/10GB\n- Active connections: 1,247\n- Error spike: 14:32:15 UTC\n- Trigger: Memory allocation failure in worker-3",
    valkyrie:
      "Root cause analysis:\n1. Memory leak in WebSocket handler (line 234)\n2. Unbounded array growth in cache manager\n3. Missing cleanup in connection pool\n\nFix priority: Item #1 is causing 80% of the issue",
    chronos:
      "Crash timeline reconstruction:\n- 14:30:00 - Normal operation\n- 14:31:45 - First memory warning\n- 14:32:00 - GC pressure increases\n- 14:32:15 - OOM error, process crash\n- 14:32:17 - Auto-restart triggered",
  },
  implement: {
    valkyrie:
      "Implementation approach for authentication:\n1. JWT-based auth with refresh tokens\n2. OAuth2 integration for social logins\n3. MFA using TOTP\n4. Session management with Redis\n5. Rate limiting per user/IP",
    odin: "Authentication architecture design:\n- API Gateway handles initial auth\n- Auth service issues/validates tokens  \n- User service manages profiles\n- Session cache in Redis\n- Audit logs to Elasticsearch",
    chronos:
      "Implementation timeline:\n- Day 1-2: Database schema & models\n- Day 3-4: Core auth endpoints\n- Day 5-6: OAuth integration\n- Day 7: MFA implementation\n- Day 8-9: Testing & security audit\n- Day 10: Documentation & deployment",
  },
};

export function useMockResponses() {
  const [isGenerating, setIsGenerating] = useState(false);

  const getContextualResponse = useCallback(
    (prompt: string, agentId: string): string | null => {
      const lowerPrompt = prompt.toLowerCase();

      // Check for contextual patterns
      for (const [pattern, responses] of Object.entries(CONTEXTUAL_PATTERNS)) {
        if (lowerPrompt.includes(pattern)) {
          const agentResponse = responses[agentId as keyof typeof responses];
          if (agentResponse) return agentResponse;
        }
      }

      return null;
    },
    []
  );

  const generateResponse = useCallback(
    async (
      prompt: string,
      agentId: string,
      onChunk?: (chunk: string) => void
    ): Promise<string> => {
      setIsGenerating(true);

      // Try contextual response first
      let response = getContextualResponse(prompt, agentId);

      // Fall back to random response
      if (!response) {
        const agentResponses =
          MOCK_RESPONSES[agentId as keyof typeof MOCK_RESPONSES] ||
          MOCK_RESPONSES.chronos;
        response =
          agentResponses[Math.floor(Math.random() * agentResponses.length)];
      }

      // Simulate streaming delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      // Simulate chunked response
      if (onChunk) {
        const words = response.split(" ");
        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 50 + Math.random() * 100)
          );
          onChunk(words.slice(0, i + 1).join(" "));
        }
      }

      setIsGenerating(false);
      return response;
    },
    [getContextualResponse]
  );

  const generateMessage = useCallback(
    async (prompt: string, agentId: string): Promise<Message> => {
      const content = await generateResponse(prompt, agentId);

      return {
        id: `msg-${Date.now()}-${++mockMessageIdCounter}`,
        role: "assistant",
        content,
        agent: agentId,
        timestamp: new Date(),
      };
    },
    [generateResponse]
  );

  return {
    generateResponse,
    generateMessage,
    isGenerating,
  };
}
