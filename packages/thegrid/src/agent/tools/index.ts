import { toolRegistry } from "./registry/toolRegistry";
import { createImageTool } from "./createImage.tool";
import { analyzeYoutubeTool } from "./analyzeYoutube.tool";
import { evaluateResponseTool } from "./planning/evaluateResponse.tool";
import { userLogger } from "../../utils/logger";

// Register core tools immediately
userLogger.log("[tools/index] 🔧 Registering core tools...");
toolRegistry.register(createImageTool);
toolRegistry.register(analyzeYoutubeTool);
toolRegistry.register(evaluateResponseTool);

// Delegation tools are created on-demand but we need to ensure the factory is available
export { createDelegationTool } from "./delegationTools";

// Single clean export
export { toolRegistry };