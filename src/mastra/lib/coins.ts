export type CoinType = "cp" | "sp" | "gp";

export const coinValueMap: Record<CoinType, number> = {
  cp: 1,
  sp: 10,
  gp: 100,
};

export function convertCoins(
  amount: number,
  from: CoinType,
  to: CoinType
): number {
  const fromValue = coinValueMap[from];
  const toValue = coinValueMap[to];
  const baseCp = amount * fromValue;
  const converted = baseCp / toValue;
  return Number.isInteger(converted)
    ? converted
    : parseFloat(converted.toFixed(2));
}

export function parseCoinString(input: string): {
  amount: number;
  type: CoinType;
} {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(`Invalid coin string: ${input}`);
  }
  const amount = Number(parts[0]);
  const type = parts[1] as CoinType;
  if (
    isNaN(amount) ||
    !Object.prototype.hasOwnProperty.call(coinValueMap, type)
  ) {
    throw new Error(`Invalid coin string: ${input}`);
  }
  return { amount, type };
}
