import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { lootTool } from "../tools";
import { randomItemAgent } from "../agents/random-item-agent";

// Schema for structured item output
const itemSchema = z.object({
  item: z.string(),
  description: z.string(),
  rarity: z.string(),
  effects: z.string().optional(),
});

const itemsArraySchema = z.array(itemSchema);

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
    includeEffects: z.boolean().default(true),
  }),
  outputSchema: z.object({
    randomItems: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    const {
      partyLevel,
      randomItemCount,
      context: location,
      lootQuality,
      includeEffects,
    } = inputData;
    if (randomItemCount === 0) {
      return { randomItems: [] };
    }
    const locationText = location
      ? ` These items are found in or at: "${location}".`
      : "";
    const qualityText = lootQuality
      ? ` The loot quality is "${lootQuality}".`
      : "";
    const effectsText = includeEffects
      ? " IMPORTANT: You MUST include an 'effects' property for EVERY item with minor D&D 5e mechanical or flavor effects. Scale effects by rarity: common items get minor effects, legendary items get powerful effects. Use proper D&D terminology (advantage, saving throws, spell names, damage types). Effects are REQUIRED for all items."
      : " Do NOT include an 'effects' property. Only include 'item', 'description', and 'rarity' properties.";
    const prompt = `Generate ${randomItemCount} unique, non-SRD fantasy items for a party level of ${partyLevel}.${locationText}${qualityText}${effectsText} Ensure the output is ONLY a JSON array of objects with properties: item, description, rarity${includeEffects ? ", effects" : ""}.`;
    console.log("Generating random items with params:", {
      partyLevel,
      randomItemCount,
      location,
      lootQuality,
    });
    try {
      const result = await randomItemAgent.generate(prompt, {
        structuredOutput: {
          schema: itemsArraySchema,
          errorStrategy: "fallback",
          fallbackValue: [],
        },
        modelSettings: {
          temperature: 0.7,
        },
      });

      if (result && result.object && Array.isArray(result.object)) {
        console.log("Generated random items:", result.object);
        return { randomItems: result.object.slice(0, randomItemCount) };
      }

      console.warn(
        "No structured output returned for items, using empty array"
      );
      return { randomItems: [] };
    } catch (error) {
      console.error("Error generating random items:", error);
      return { randomItems: [] };
    }
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
    const {
      partyLevel,
      srdItemCount,
      context: location,
      randomItems = [],
    } = inputData;

    console.log("compileLoot - inputData:", JSON.stringify(inputData));
    console.log("compileLoot - randomItems count:", randomItems.length);

    if (!lootTool || typeof lootTool.execute !== "function") {
      throw new Error("lootTool or its execute method is not available.");
    }
    // Tool expects ctx.context format
    const loot = await lootTool.execute({
      context: {
        partyLevel,
        srdItemCount,
        randomItems,
        context: location,
      },
    });
    console.log("compileLoot - loot result count:", Array.isArray(loot) ? loot.length : "not an array");
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
    includeEffects: z.boolean().default(true),
  }),
  outputSchema: z.array(z.any()),
})
  .then(generateRandomItemsStep)
  .map(async ({ inputData, getInitData }) => {
    const initData = getInitData();
    const randomItems = inputData?.randomItems ?? [];
    console.log("Map step - inputData:", JSON.stringify(inputData));
    console.log("Map step - randomItems count:", randomItems.length);
    return {
      partyLevel: initData.partyLevel,
      srdItemCount: initData.srdItemCount,
      context: initData.context,
      randomItems,
    };
  })
  .then(compileLootStep)
  .then(formatLootStep)
  .commit();
