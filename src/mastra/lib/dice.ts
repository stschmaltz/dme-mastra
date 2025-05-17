function rollDice(dice: string) {
  const [num, sides] = dice.split("d").map(Number);
  return Array.from(
    { length: num },
    () => Math.floor(Math.random() * sides) + 1
  ).reduce((a, b) => a + b, 0);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { rollDice, randomInt };
