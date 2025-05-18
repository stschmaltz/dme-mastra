// coinPocket.ts
import { randomInt } from "../lib/dice";

export type Tier = "low" | "mid" | "high" | "epic";

interface CoinBracket {
  dice: string; // e.g., "1d8+2"
  type: "cp" | "sp" | "gp"; // Removed "pp"
}

const byTier: Record<
  Tier,
  { low: CoinBracket; mid: CoinBracket; high: CoinBracket }
> = {
  low: {
    // Player Level 1-4
    low: { dice: "1d6+2", type: "sp" }, // Min: 3 sp, Avg: 5.5 sp
    mid: { dice: "4d8+4", type: "sp" }, // Min: 7 sp, Avg: 14.5 sp
    high: { dice: "1d6+1", type: "gp" }, // Min: 2 gp, Avg: 4.5 gp
  },
  mid: {
    // Player Level 5-10
    low: { dice: "3d6+5", type: "sp" }, // Min: 8 sp, Avg: 15.5 sp
    mid: { dice: "2d6+2", type: "gp" }, // Min: 4 gp, Avg: 9 gp
    high: { dice: "2d8+5", type: "gp" }, // Min: 7 gp, Avg: 14 gp
  },
  high: {
    // Player Level 11-16
    low: { dice: "2d10+10", type: "sp" }, // Min: 12 sp, Avg: 21 sp
    mid: { dice: "3d6+10", type: "gp" }, // Min: 13 gp, Avg: 20.5 gp
    high: { dice: "10d6+10", type: "gp" }, // Min: 20 gp, Avg: 45 gp
  },
  epic: {
    // Player Level 17-20
    low: { dice: "2d10+15", type: "gp" }, // Min: 17 gp, Avg: 26 gp
    mid: { dice: "10d8+20", type: "gp" }, // Min: 30 gp, Avg: 65 gp
    high: { dice: "20d6+30", type: "gp" }, // Min: 50 gp, Avg: 100 gp
  },
};

function rollDice(exp: string): number {
  const diceRegex = /(\d*)d(\d+)(?:([+-])(\d+))?/;
  const match = exp.match(diceRegex);

  if (!match) {
    console.error(`Invalid dice expression: ${exp}`);
    return 0;
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const faces = parseInt(match[2], 10);
  const operator = match[3];
  const modifier = match[4] ? parseInt(match[4], 10) : 0;

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += randomInt(1, faces);
  }

  if (operator === "+") {
    total += modifier;
  } else if (operator === "-") {
    total -= modifier;
  }

  return Math.max(0, total);
}

export function coinsPerPlayer(playerLevel: number): {
  low: string;
  mid: string;
  high: string;
} {
  const tier: Tier =
    playerLevel <= 4
      ? "low"
      : playerLevel <= 10
        ? "mid"
        : playerLevel <= 16
          ? "high"
          : "epic";

  const lowBracket = byTier[tier].low;
  const midBracket = byTier[tier].mid;
  const highBracket = byTier[tier].high;

  const lowAmt = rollDice(lowBracket.dice);
  const midAmt = rollDice(midBracket.dice);
  const highAmt = rollDice(highBracket.dice);

  return {
    low: `${lowAmt} ${lowBracket.type}`,
    mid: `${midAmt} ${midBracket.type}`,
    high: `${highAmt} ${highBracket.type}`,
  };
}
