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
  /*   TIER 1-4  :  0.3 – 3.5 gp per pocket   */
  low: {
    low: { dice: "1d6+2", type: "sp" }, // 0.3 – 0.8 gp   (avg ≈ 0.55)
    mid: { dice: "2d8+4", type: "sp" }, // 0.6 – 2.0 gp   (avg ≈ 1.2)
    high: { dice: "1d4+1", type: "gp" }, // 2 – 5 gp       (avg ≈ 3.5)
  },

  /*   TIER 5-10 :  0.8 – 11 gp per pocket   */
  mid: {
    low: { dice: "2d8+4", type: "sp" }, // 0.6 – 2.0 gp   (avg ≈ 1.3)
    mid: { dice: "1d4+4", type: "gp" }, // 5 – 8 gp       (avg ≈ 6.5)
    high: { dice: "2d6+4", type: "gp" }, // 6 – 16 gp      (avg ≈ 11)
  },

  /*   TIER 11-16:  2 – 33 gp per pocket     */
  high: {
    low: { dice: "3d10+5", type: "sp" }, // 1.2 – 3.5 gp   (avg ≈ 2.1)
    mid: { dice: "1d8+12", type: "gp" }, // 13 – 20 gp     (avg ≈ 16.5)
    high: { dice: "6d6+12", type: "gp" }, // 18 – 48 gp     (avg ≈ 33)
  },

  /*   TIER 17+  :  21 – ≈ 100 gp per pocket */
  epic: {
    low: { dice: "2d10+10", type: "gp" }, // 12 – 30 gp     (avg ≈ 21)
    mid: { dice: "4d8+25", type: "gp" }, // 29 – 57 gp     (avg ≈ 43)
    high: { dice: "12d6+24", type: "gp" }, // 36 – 96 gp     (avg ≈ 66)
  },
};

// (The rest of your functions: rollDice, coinsPerPlayer remain the same)

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
