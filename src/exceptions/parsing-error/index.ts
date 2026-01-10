import { CROSS_UNICODE } from 'mauw/characters/unicode';
import { color } from 'mauw/colors';
import { formatExamples, formatList, formatReceived } from './utils/format';
import { resolveHint } from './utils/resolve-hint';

/**
 * Error type used to represent parsing failures with rich,
 * user-friendly CLI output.
 *
 * This error formats its message as a structured, multi-line block
 * including:
 * - A clear parsing error header
 * - The main error message
 * - Expected values
 * - Example usages
 * - Received values with inferred types
 * - An optional hint (explicit or automatically generated)
 *
 * The goal is to provide actionable feedback rather than a
 * minimal error string.
 *
 * @typeParam Expected - Type of the expected values.
 * @typeParam Received - Type of the received values.
 */
export class ParsingError<
	Expected = unknown,
	Received = unknown,
> extends Error {
	public readonly fromKLY = true;

	constructor(
		message: string,
		options?: {
			/** List of expected values or formats. */
			expected?: Expected[];

			/** Values actually received by the parser. */
			received?: Received[];

			/** Example inputs that demonstrate valid usage. */
			examples?: string[];

			/**
			 * Hint behavior:
			 * - false / undefined: no hint
			 * - string: explicit hint message
			 * - true: automatic hint resolution based on similarity
			 */
			hint?: boolean | string;
		},
	) {
		const { expected = [], received = [], examples = [], hint } = options ?? {};

		// Base error blocks (header + main message)
		const blocks: string[] = [
			color.red.bold(`${CROSS_UNICODE} Parsing Error`),
			color.red(message),
		];

		// Expected values section
		if (expected.length) {
			blocks.push(
				'',
				color.bold('Expected:'),
				`  ${formatList(expected, color.green)}`,
			);
		}

		// Examples section
		if (examples.length) {
			blocks.push('', color.bold('Examples:'), `  ${formatExamples(examples)}`);
		}

		// Received values section, including inferred types
		if (received.length) {
			blocks.push(
				'',
				color.bold('Received:'),
				`  ${formatReceived(received, color.yellow)}`,
			);
		}

		// Optional hint section (explicit or automatically resolved)
		const resolvedHint = resolveHint(hint, expected, received);
		if (resolvedHint) {
			blocks.push('', color.bold('Hint:'), `  ${color.cyan(resolvedHint)}`);
		}

		// Combine all blocks into a single formatted error message
		super(blocks.join('\n'));
		this.name = 'ParsingError';
	}
}
