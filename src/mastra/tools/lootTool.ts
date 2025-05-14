// src/lootTool.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { cosmetics, trinkets, potions } from "./lootTables";

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export const lootTool = createTool({
  id: "lootTool",
  description:
    "Coins + N items pulled ONLY from SRD cosmetics, trinkets, or common/uncommon potions.",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
    itemCount: z.number().int().min(1).max(10).default(2), // SRD items only
    context: z.string().optional(),
  }),
  async execute(ctx) {
    const { context, partyLevel, itemCount } = ctx.context;
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

    const items = Array.from({ length: itemCount }, () => pick(srdPool));

    const result = [
      { coins },
      ...items.map((item) => ({ item })),
      ...(context ? [{ note: `Theme: ${context}` }] : []),
    ];

    return result;
  },
});
