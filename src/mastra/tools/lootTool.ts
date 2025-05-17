// src/lootTool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { cosmetics, trinkets, potions } from "./lootTables";
import { coinsPerPlayer } from "./coinTool";

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export const lootTool = createTool({
  id: "lootTool",
  description:
    "Generates coins and SRD items, and combines them with pre-generated random items. For LLM-generated random items, use randomItemTool first.",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
    srdItemCount: z.number().int().min(1).max(10).default(2),
    randomItems: z
      .array(z.object({ item: z.string(), description: z.string() }))
      .default([])
      .describe(
        "Array of pre-generated random items, each with item name and description"
      ),
    context: z.string().optional(),
  }),
  async execute(ctx) {
    const { context, partyLevel, srdItemCount, randomItems } = ctx.context;
    const coinRolls = coinsPerPlayer(partyLevel);

    const srdPool = [
      ...cosmetics,
      ...trinkets,
      ...potions
        .filter((p) => ["Common", "Uncommon", "Varies"].includes(p.rarity))
        .map((p) => p.name),
    ];

    const items = Array.from({ length: srdItemCount }, () => pick(srdPool));

    const coinEntries = [
      { level: "low", coins: coinRolls.low },
      { level: "mid", coins: coinRolls.mid },
      { level: "high", coins: coinRolls.high },
    ];

    const result = [
      ...coinEntries,
      ...items.map((item) => ({ item, source: "official" })),
      ...randomItems.map((ri) => ({
        item: ri.item,
        source: "random",
        description: ri.description,
      })),
      ...(context ? [{ note: `Theme: ${context}` }] : []),
    ];

    return result;
  },
});
