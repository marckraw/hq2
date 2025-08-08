/**
 * Test script to verify the refactored GeneralAgent works correctly
 */

import { createGeneralAgent } from ".";
import { generalAgentConfig } from "./general.config";

async function testGeneralAgent() {
  console.log("Testing refactored GeneralAgent...\n");

  try {
    // 1. Test agent creation
    console.log("1. Creating GeneralAgent...");
    const agent = await createGeneralAgent();
    console.log("✅ Agent created successfully");

    // 2. Test metadata
    console.log("\n2. Testing metadata...");
    const metadata = agent.getMetadata();
    console.log("Agent ID:", metadata.id);
    console.log("Agent Name:", metadata.name);
    console.log("Capabilities:", metadata.capabilities);
    console.log("✅ Metadata retrieved successfully");

    // 3. Test simple string input
    console.log("\n3. Testing simple string input...");
    try {
      const response = await agent.act({
        messages: [{ role: "user", content: "What is 2+2?" }],
      });
      console.log("Response:", response);
      console.log("✅ Simple input handled successfully");
    } catch (error) {
      console.error("❌ Simple input failed:", error);
    }

    // 4. Test complex input format
    console.log("\n4. Testing complex input format...");
    try {
      const complexResponse = await agent.act({
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: "Hello, how are you?" },
        ],
        tools: [], // Agent will use its configured tools
      });
      console.log("Response:", complexResponse);
      console.log("✅ Complex input handled successfully");
    } catch (error) {
      console.error("❌ Complex input failed:", error);
    }

    // 5. Check configuration
    console.log("\n5. Checking agent configuration...");
    console.log("Can delegate:", generalAgentConfig.orchestration?.canDelegate);
    console.log("Can be called:", generalAgentConfig.orchestration?.callable);
    console.log("Available tool categories:");
    console.log(
      "  - Builtin:",
      generalAgentConfig.tools.builtin.length,
      "tools"
    );
    console.log(
      "  - Custom:",
      generalAgentConfig.tools.custom?.length || 0,
      "tools"
    );
    console.log("  - MCP:", generalAgentConfig.tools.mcp?.length || 0, "tools");
    console.log(
      "  - Agents:",
      generalAgentConfig.tools.agents?.length || 0,
      "agents"
    );

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
  }
}

// Run the test
testGeneralAgent().catch(console.error);
