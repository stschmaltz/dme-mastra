import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { lootTool } from "../tools";
// randomItemTool is removed, randomItemAgent will be accessed via context
import { randomItemAgent } from "../agents/random-item-agent";

// Define the schema for the data that triggers the workflow
const lootWorkflowTriggerSchema = z.object({
  partyLevel: z.number().int().min(1).max(20).default(3),
  srdItemCount: z.number().int().min(1).max(10).default(2),
  randomItemCount: z.number().int().min(0).max(10),
  context: z.string().optional(),
});

// Step 1: Generate Random Items
const generateRandomItemsStep = new Step({
  id: "generateRandomItems",
  execute: async ({ context }) => {
    const { partyLevel, randomItemCount, context: theme } = context.triggerData;
    if (randomItemCount === 0) {
      return { randomItems: [] };
    }
    let prompt = `Generate ${randomItemCount} unique, non-SRD fantasy items for a party level of ${partyLevel}.`;
    if (theme) {
      prompt += ` The theme is "${theme}".`;
    }
    prompt += ` Ensure the output is ONLY a JSON array of strings, with each string being an item name.`;
    let items: string[] = [];
    try {
      const result = await randomItemAgent.generate(prompt);
      if (result && typeof result.text === "string") {
        items = JSON.parse(result.text);
      }
    } catch {
      items = [];
    }
    return { randomItems: items.slice(0, randomItemCount) };
  },
});

// Step 2: Generate SRD Items and Coins, then combine
const compileLootStep = new Step({
  id: "compileLoot",
  execute: async ({ context }) => {
    const { partyLevel, srdItemCount, context: theme } = context.triggerData;
    const { randomItems } = context.getStepResult("generateRandomItems") || {
      randomItems: [],
    };
    if (!lootTool || typeof lootTool.execute !== "function") {
      throw new Error("lootTool or its execute method is not available.");
    }
    const loot = await lootTool.execute({
      context: { partyLevel, srdItemCount, randomItems, context: theme },
      id: lootTool.id,
      description: lootTool.description,
      inputSchema: lootTool.inputSchema,
    });
    return { loot };
  },
});

// Step 3: Format the output
const formatLootStep = new Step({
  id: "formatLoot",
  execute: async ({ context }) => {
    const prev = context.getStepResult("compileLoot") || {};
    const loot = prev.loot || prev.finalLootResult || prev.output || prev || [];
    if (loot && Array.isArray(loot)) {
      return loot;
    }
    if (loot && typeof loot === "object") {
      for (const value of Object.values(loot)) {
        if (Array.isArray(value)) return value;
      }
    }
    return [];
  },
});

// Define the Workflow
export const lootGenerationWorkflow = new Workflow({
  name: "loot-generation-workflow",
  triggerSchema: lootWorkflowTriggerSchema,
});

// Chain the steps
lootGenerationWorkflow
  .step(generateRandomItemsStep)
  .then(compileLootStep)
  .then(formatLootStep)
  .commit();

// Example of how to potentially run this (conceptual)
/*
async function runWorkflow(input: z.infer<typeof lootWorkflowTriggerSchema>) {
  const { start } = lootGenerationWorkflow.createRun();
  try {
    const result = await start({ triggerData: input });
    if (result.status === 'success') {
      return result.results.compileLoot.output.finalLootResult;
    }
    throw new Error(`Workflow failed: ${result.status}`);
  } catch (e) {
    console.error("Error running lootGenerationWorkflow:", e);
    throw e;
  }
}
*/
