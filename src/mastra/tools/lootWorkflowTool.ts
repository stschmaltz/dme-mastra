import { createTool } from "@mastra/core";
import { lootGenerationWorkflow } from "../workflows/lootWorkflow";

export const lootWorkflowTool = createTool({
  id: "lootWorkflowTool",
  description: "Runs the lootGenerationWorkflow and returns the loot array.",
  inputSchema: lootGenerationWorkflow.triggerSchema,
  async execute(ctx) {
    const { start } = lootGenerationWorkflow.createRun();
    const result = await start({ triggerData: ctx.context });
    return result.results.formatLoot;
  },
});
