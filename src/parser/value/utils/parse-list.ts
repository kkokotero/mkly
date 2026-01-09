import { ParsingError } from '@src/exceptions';

/**
 * Parses a comma-separated string into a list of strings.
 *
 * The input may optionally be wrapped in square brackets.
 * Examples of valid inputs:
 * - "a, b, c"
 * - "apple, banana, cherry"
 * - "[value1, value2, value3]"
 *
 * Leading and trailing whitespace is ignored, and empty values
 * are filtered out from the result.
 *
 * @param input - The raw input string to parse.
 * @returns An array of trimmed, non-empty strings.
 *
 * @throws {ParsingError}
 * Thrown when the input is empty or contains only whitespace.
 */
export function parseList(input: string): string[] {
	// Remove leading and trailing whitespace
	const trimmed = input.trim();

	// Remove surrounding brackets if present
	const list =
		trimmed.startsWith('[') && trimmed.endsWith(']')
			? trimmed.slice(1, -1)
			: trimmed;

	// Validate non-empty input after normalization
	if (!list) {
		throw new ParsingError('Input string is empty or whitespace only', {
			expected: [
				'12,34,56',
				'apple, banana, cherry',
				'["value1", "value2", "value3"]',
			],
			received: [input],
		});
	}

	// Split by commas, trim values, and remove empty entries
	return list
		.split(',')
		.map((v) => v.trim())
		.filter(Boolean);
}
