// src/lootTool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { cosmetics, trinkets, potions } from "./lootTables";

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export const lootTool = createTool({
  id: "lootTool",
  description:
    "Generates coins and SRD items, and combines them with pre-generated random items. For LLM-generated random items, use randomItemTool first.",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
    srdItemCount: z.number().int().min(1).max(10).default(2), // SRD items only
    // randomItemCount is removed as we now expect randomItems array directly
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
    /* coins: ~2d6 × level, 30 % chance gp else sp */
    const coins =
      `${(Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)) * partyLevel}` +
      ` ${Math.random() < 0.3 ? "gp" : "sp"}`;

    const srdPool = [
      ...cosmetics,
      ...trinkets,
      ...potions
        .filter((p) => ["Common", "Uncommon", "Varies"].includes(p.rarity))
        .map((p) => p.name),
    ];

    const items = Array.from({ length: srdItemCount }, () => pick(srdPool));

    // Convert the input random item strings to the expected object format
    const formattedRandomItems = randomItems.map((item) => ({ item }));

    const result = [
      { coins },
      ...items.map((item) => ({ item })),
      ...formattedRandomItems, // Use the pre-generated and formatted random items
      ...(context ? [{ note: `Theme: ${context}` }] : []),
    ];

    return result;
  },
});
