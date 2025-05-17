function rollDice(dice: string) {
  const [dicePart, mulStr] = dice.split("*");
  const [num, sides] = dicePart.split("d").map(Number);
  const multiplier = mulStr ? Number(mulStr) : 1;
  const sum = Array.from(
    { length: num },
    () => Math.floor(Math.random() * sides) + 1
  ).reduce((a, b) => a + b, 0);
  return sum * multiplier;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { rollDice, randomInt };
