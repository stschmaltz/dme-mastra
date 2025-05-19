import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { lootTool } from "../tools";
import { randomItemAgent } from "../agents/random-item-agent";

const lootWorkflowTriggerSchema = z.object({
  partyLevel: z.number().int().min(1).max(20).default(3),
  srdItemCount: z.number().int().min(1).max(10).default(5),
  randomItemCount: z.number().int().min(0).max(10).default(5),
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
    const themeText = theme ? ` The theme is "${theme}".` : "";
    const prompt = `Generate ${randomItemCount} unique, non-SRD fantasy items for a party level of ${partyLevel}.${themeText} Ensure the output is ONLY a JSON array of objects, each object having two string properties: item and description.`;
    try {
      const result = await randomItemAgent.generate(prompt, {
        temperature: 0.8,
      });
      if (result && typeof result.text === "string") {
        const items = JSON.parse(result.text);
        return { randomItems: items.slice(0, randomItemCount) };
      }
    } catch {
      /* noop */
    }
    return { randomItems: [] };
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

export const lootGenerationWorkflow = new Workflow({
  name: "loot-generation-workflow",
  triggerSchema: lootWorkflowTriggerSchema,
});

lootGenerationWorkflow
  .step(generateRandomItemsStep)
  .then(compileLootStep)
  .then(formatLootStep)
  .commit();
