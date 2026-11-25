const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/* The heading over the pattern row: "You're matched with two patterns", only when there is more than one. */
export function matchedHeading(n: number): string | null {
  return n >= 2 ? `You're matched with ${WORDS[n] ?? n} patterns` : null;
}
