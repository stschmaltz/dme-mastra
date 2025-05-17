import { createTool } from "@mastra/core";
import { z } from "zod";
import { rollDice, randomInt } from "../lib/dice";

type CoinRoll = {
  chance: number;
  dice: string;
  type: "cp" | "sp" | "ep" | "gp" | "pp";
};

type Tier = "low" | "mid" | "high" | "epic";

export const coinTables: Record<Tier, CoinRoll[]> = {
  low: [
    // CR 0-4 (party Lv 1-4-ish)
    { chance: 30, dice: "5d6", type: "cp" },
    { chance: 30, dice: "4d6", type: "sp" },
    { chance: 10, dice: "3d6", type: "ep" },
    { chance: 25, dice: "3d6", type: "gp" },
    { chance: 5, dice: "1d6", type: "pp" },
  ],
  mid: [
    // CR 5-10 (Lv 5-10)
    { chance: 30, dice: "4d6*100", type: "cp" },
    { chance: 30, dice: "6d6*10", type: "sp" },
    { chance: 10, dice: "3d6*10", type: "ep" },
    { chance: 25, dice: "4d6*10", type: "gp" },
    { chance: 5, dice: "2d6", type: "pp" },
  ],
  high: [
    // CR 11-16 (Lv 11-16)
    { chance: 20, dice: "4d6*100", type: "sp" },
    { chance: 15, dice: "1d6*100", type: "ep" },
    { chance: 40, dice: "2d6*100", type: "gp" },
    { chance: 25, dice: "1d6*10", type: "pp" },
  ],
  epic: [
    // CR 17+ (Lv 17-20)
    { chance: 15, dice: "2d6*1000", type: "ep" },
    { chance: 40, dice: "1d6*1000", type: "gp" },
    { chance: 45, dice: "2d6*100", type: "pp" },
  ],
};

export function generateCoins(partyLevel: number): string {
  const tier: Tier =
    partyLevel <= 4
      ? "low"
      : partyLevel <= 10
        ? "mid"
        : partyLevel <= 16
          ? "high"
          : "epic";

  const roll = randomInt(1, 100);
  let cursor = 0;
  const entry = coinTables[tier].find((e) => (cursor += e.chance) >= roll)!;

  const amount = rollDice(entry.dice);
  return `${amount} ${entry.type}`;
}

export const coinTool = createTool({
  id: "coinTool",
  description: "Generates random coins based on party level",
  inputSchema: z.object({
    partyLevel: z.number().int().min(1).max(20).default(3),
  }),
  async execute(ctx) {
    const { partyLevel } = ctx.context;
    const coins = generateCoins(partyLevel);
    return { coins };
  },
});
