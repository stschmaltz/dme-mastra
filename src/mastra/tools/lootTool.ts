import { createTool } from "@mastra/core";
import { z } from "zod";
import magicItemsJson from "./5e-SRD-Magic-Items.json";

/* ───────── helpers ───────── */

function rollDice(dice: string): number {
  // "3d6" → random 3‑18
  const [countStr, facesStr] = dice.toLowerCase().split("d");
  const count = parseInt(countStr, 10);
  const faces = parseInt(facesStr, 10);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.ceil(Math.random() * faces);
  return total;
}

function pickWeighted<T extends { weight: number }>(list: T[]): T {
  const total = list.reduce((n, i) => n + i.weight, 0);
  let r = Math.random() * total;
  for (const entry of list) {
    if ((r -= entry.weight) <= 0) return entry;
  }
  return list[0]; // safety
}

/* ───────── coin table (DMG‑style individual treasure by CR band) ───────── */

const coinTable: Record<
  number,
  { cp?: string; sp?: string; gp?: string; pp?: string }
> = {
  0: { cp: "5d6", sp: "4d6", gp: "3d6" }, // CR 0‑4
  5: { sp: "4d6", gp: "4d6" }, // CR 5‑10
  11: { gp: "6d6", pp: "3d6" }, // CR 11‑16
  17: { gp: "8d6", pp: "8d6" }, // CR 17+
};

/* ───────── magic‑item tables ───────── */

// Define a type for the new item structure
interface LootItemVariant {
  index: string;
  name: string;
  url: string;
}
interface LootItem {
  index: string;
  name: string;
  equipment_category: { index: string; name: string; url: string };
  rarity: { name: string };
  variants: LootItemVariant[];
  variant: boolean;
  desc: string[];
  image: string;
  url: string;
}

const items: LootItem[] = magicItemsJson as LootItem[];

/* ───────── Mastra tool ───────── */

export const lootTool = createTool({
  id: "generateLoot",
  description:
    "Return flavour‑rich D&D 5e loot based on CR, rarity and itemType. Outputs coins by denomination and 0‑N magic items.",
  inputSchema: z.object({
    cr: z.number().int().min(0).max(30),
    rarity: z.enum(["common", "uncommon", "rare", "very_rare", "legendary"]),
    itemType: z.enum(["weapon", "armor", "potion", "scroll", "any"]),
  }),
  outputSchema: z.object({
    coins: z.object({
      cp: z.number(),
      sp: z.number(),
      gp: z.number(),
      pp: z.number(),
    }),
    items: z
      .array(
        z.object({
          index: z.string(),
          name: z.string(),
          equipment_category: z.object({
            index: z.string(),
            name: z.string(),
            url: z.string(),
          }),
          rarity: z.object({ name: z.string() }),
          variants: z.array(
            z.object({ index: z.string(), name: z.string(), url: z.string() })
          ),
          variant: z.boolean(),
          desc: z.array(z.string()),
          image: z.string(),
          url: z.string(),
        })
      )
      .optional(),
  }),

  execute: async ({ context }) => {
    const band =
      Object.keys(coinTable)
        .map(Number)
        .reverse()
        .find((k) => context.cr >= k) ?? 0;
    const row = coinTable[band];

    const coins = {
      cp: row.cp ? rollDice(row.cp) : 0,
      sp: row.sp ? rollDice(row.sp) : 0,
      gp: row.gp ? rollDice(row.gp) : 0,
      pp: row.pp ? rollDice(row.pp) : 0,
    };

    // Map input itemType to equipment_category.name
    const typeMap: Record<string, string[]> = {
      weapon: ["Weapon"],
      armor: ["Armor"],
      potion: ["Potion"],
      scroll: ["Scroll"],
      any: ["Weapon", "Armor", "Potion", "Scroll", "Wondrous Item"],
    };
    const allowedTypes = typeMap[context.itemType];
    const filtered = items.filter(
      (item) =>
        allowedTypes.includes(item.equipment_category.name) &&
        item.rarity.name.toLowerCase() === context.rarity.replace("_", " ")
    );
    const n = Math.min(3, Math.floor(Math.random() * (context.cr / 5 + 1)));
    const picked: LootItem[] = [];
    for (let i = 0; i < n; i++) {
      if (filtered.length === 0) break;
      picked.push(filtered[Math.floor(Math.random() * filtered.length)]);
    }
    return {
      coins,
      items: picked.length ? picked : undefined,
    };
  },
});
