import { ParsingError } from "@src/exceptions";

export function parseChoice(input: string, choices: string[]): string {
  const trimmed = input.trim();
  if (choices.includes(trimmed)) {
    return trimmed;
  }
  throw new ParsingError(
    `Invalid choice: ${input}`,
    {
      expected: choices,
      received: [input],
      hint: `Valid choices are: ${choices.join(', ')}`
    }
  );
}
