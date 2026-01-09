import { ParsingError } from '@src/exceptions';

/**
 * Parses a string input into a number.
 *
 * The input is converted using the built-in `Number` constructor.
 * If the result is `NaN`, the input is considered invalid.
 *
 * @param input - The raw string value to parse.
 * @returns The parsed numeric value.
 *
 * @throws {ParsingError}
 * Thrown when the input cannot be converted to a valid number.
 * The error includes example numeric values and a usage hint.
 */
export function parseNumber(input: string): number {
	const n = Number(input);

	// Validate that the parsed value is a valid number
	if (Number.isNaN(n)) {
		throw new ParsingError(`Invalid number: ${input}`, {
			received: [input],
			examples: ['42', '-3.14', '0'],
			hint: 'Use a numeric value like 0, 1, -1 or 3.14',
		});
	}

	return n;
}
