import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { lootTool } from "../tools";
import { randomItemAgent } from "../agents/random-item-agent";

const generateRandomItemsStep = createStep({
  id: "generateRandomItems",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
    srdItemCount: z.number().int().min(1).max(10).default(5),
    randomItemCount: z.number().int().min(0).max(10).default(5),
    context: z.string().optional(),
    lootQuality: z
      .enum(["basic", "standard", "good", "major", "legendary"])
      .default("standard"),
  }),
  outputSchema: z.object({
    randomItems: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    const {
      partyLevel,
      randomItemCount,
      context: theme,
      lootQuality,
    } = inputData;
    if (randomItemCount === 0) {
      return { randomItems: [] };
    }
    const themeText = theme ? ` The theme is "${theme}".` : "";
    const qualityText = lootQuality
      ? ` The loot quality is "${lootQuality}".`
      : "";
    const prompt = `Generate ${randomItemCount} unique, non-SRD fantasy items for a party level of ${partyLevel}.${themeText}${qualityText} Ensure the output is ONLY a JSON array of objects, each object having three required string properties (item, description, rarity) and one optional string property (effects) containing minor game effects.`;
    try {
      const result = await randomItemAgent.generate(prompt, {
        modelSettings: {
          temperature: 0.8,
        },
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

const compileLootStep = createStep({
  id: "compileLoot",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20),
    srdItemCount: z.number().int().min(1).max(10),
    context: z.string().optional(),
    randomItems: z.array(z.any()),
  }),
  outputSchema: z.object({
    loot: z.any(),
  }),
  execute: async ({ inputData }) => {
    const { partyLevel, srdItemCount, context: theme, randomItems } = inputData;

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

const formatLootStep = createStep({
  id: "formatLoot",
  inputSchema: z.object({
    loot: z.any(),
  }),
  outputSchema: z.array(z.any()),
  execute: async ({ inputData }) => {
    const prev = inputData;
    const loot = prev.loot || prev || [];
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

export const lootGenerationWorkflow = createWorkflow({
  id: "loot-generation-workflow",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
    srdItemCount: z.number().int().min(1).max(10).default(5),
    randomItemCount: z.number().int().min(0).max(10).default(5),
    context: z.string().optional(),
    lootQuality: z
      .enum(["basic", "standard", "good", "major", "legendary"])
      .default("standard"),
  }),
  outputSchema: z.array(z.any()),
})
  .then(generateRandomItemsStep)
  .map(async ({ inputData, getInitData }) => {
    const initData = getInitData();
    return {
      partyLevel: initData.partyLevel,
      srdItemCount: initData.srdItemCount,
      context: initData.context,
      randomItems: inputData.randomItems,
    };
  })
  .then(compileLootStep)
  .then(formatLootStep)
  .commit();
