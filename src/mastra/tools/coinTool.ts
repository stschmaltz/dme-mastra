// coinPocket.ts
import { randomInt } from "../lib/dice"; // randomInt(min, max) inclusive

export type Tier = "low" | "mid" | "high" | "epic";

interface CoinBracket {
  dice: string; // e.g. "1d8+2"
  type: "cp" | "sp" | "gp" | "pp";
}

const byTier: Record<
  Tier,
  { low: CoinBracket; mid: CoinBracket; high: CoinBracket }
> = {
  low: {
    // party level 1-4
    low: { dice: "1d8", type: "cp" },
    mid: { dice: "1d6+2", type: "sp" },
    high: { dice: "2d6", type: "sp" },
  },
  mid: {
    // level 5-10
    low: { dice: "1d6+4", type: "sp" },
    mid: { dice: "2d6", type: "sp" },
    high: { dice: "1d4", type: "gp" },
  },
  high: {
    // level 11-16
    low: { dice: "2d6", type: "sp" },
    mid: { dice: "1d6", type: "gp" },
    high: { dice: "1d4+1", type: "gp" },
  },
  epic: {
    // level 17-20
    low: { dice: "1d4+2", type: "gp" },
    mid: { dice: "2d4+2", type: "gp" },
    high: { dice: "1d4", type: "pp" },
  },
};

function rollDice(exp: string): number {
  const [countStr, rest] = exp.split("d");
  const [facesStr, modStr] = rest.split("+");
  const count = +countStr || 1;
  const faces = +facesStr;
  const mod = +(modStr ?? 0);
  let total = mod;
  for (let i = 0; i < count; i++) total += randomInt(1, faces);
  return total;
}

export function coinsPerPlayer(partyLevel: number): {
  low: string;
  mid: string;
  high: string;
} {
  const tier: Tier =
    partyLevel <= 4
      ? "low"
      : partyLevel <= 10
        ? "mid"
        : partyLevel <= 16
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
