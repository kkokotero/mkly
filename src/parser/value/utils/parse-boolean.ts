import { ParsingError } from '@exceptions/parsing-error';
import { FALSE_VALUES, TRUE_VALUES } from '../constants';

/**
 * Parses a string input into a boolean value.
 *
 * The input is normalized by trimming whitespace and converting it to lowercase
 * before comparison.
 *
 * @param input - The raw string value to parse.
 * @returns `true` if the input matches any value in TRUE_VALUES,
 *          `false` if the input matches any value in FALSE_VALUES.
 *
 * @throws {ParsingError}
 * Thrown when the input does not match any known boolean representation.
 * The error includes:
 * - expected: All valid true and false string values.
 * - received: The original input value.
 * - hint: Indicates that a hint can be shown to the user.
 */
export function parseBoolean(input: string): boolean {
	// Normalize the input for a case-insensitive and whitespace-safe comparison
	const trimmed = input.trim().toLowerCase();

	// Check for known "true" values
	if (TRUE_VALUES.includes(trimmed)) {
		return true;
	}

	// Check for known "false" values
	if (FALSE_VALUES.includes(trimmed)) {
		return false;
	}

	// Throw a detailed parsing error when the value is invalid
	throw new ParsingError(
		`Invalid boolean: ${input}`,
		{
			expected: [...TRUE_VALUES, ...FALSE_VALUES],
			received: [input],
			hint: true,
		}
	);
}
