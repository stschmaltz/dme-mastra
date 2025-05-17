// src/lootTool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { cosmetics, trinkets, potions } from "./lootTables";
import { generateCoins } from "./coinTool";

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export const lootTool = createTool({
  id: "lootTool",
  description:
    "Generates coins and SRD items, and combines them with pre-generated random items. For LLM-generated random items, use randomItemTool first.",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
    srdItemCount: z.number().int().min(1).max(10).default(2),
    randomItems: z
      .array(z.string())
      .default([])
      .describe(
        "Array of pre-generated random item names, typically from randomItemTool"
      ),
    context: z.string().optional(),
  }),
  async execute(ctx) {
    const { context, partyLevel, srdItemCount, randomItems } = ctx.context;
    const coins = generateCoins(partyLevel);

    const srdPool = [
      ...cosmetics,
      ...trinkets,
      ...potions
        .filter((p) => ["Common", "Uncommon", "Varies"].includes(p.rarity))
        .map((p) => p.name),
    ];

    const items = Array.from({ length: srdItemCount }, () => pick(srdPool));

    const result = [
      { coins },
      ...items.map((item) => ({ item, source: "official" })),
      ...randomItems.map((item) => ({ item, source: "random" })),
      ...(context ? [{ note: `Theme: ${context}` }] : []),
    ];

    return result;
  },
});
