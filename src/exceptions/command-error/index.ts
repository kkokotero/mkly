import characters from 'mauw/characters';
import { color } from 'mauw/colors';
import type { CommandErrorOptions } from './types';
import {
	formatExamples,
	formatList,
	formatReceived,
} from '../parsing-error/utils/format';
import { resolveHint } from '../parsing-error/utils/resolve-hint';

/**
 * Custom error class used to represent command-related errors in a CLI.
 * It builds a formatted, human-readable error message with contextual
 * information such as command, option, argument, expected values,
 * received values, examples, and optional hints.
 */
export class CommandError extends Error {

  public readonly fromKLY = true;

	/**
	 * Creates a new CommandError instance.
	 *
	 * @param message - Main error description shown to the user.
	 * @param options - Additional metadata used to enrich the error output.
	 */
	constructor(message: string, options: CommandErrorOptions) {
		const {
			command,
			option,
			argument,
			expected = [],
			received = [],
			examples = [],
			hint,
		} = options;

		/**
		 * List of formatted text blocks that will be joined
		 * to produce the final error message.
		 */
		const blocks: string[] = [
			color.red.bold(`${characters.cross} Command Error`),
			color.red(message),
		];

		// Context
		if (command || option || argument) {
			blocks.push('', color.bold('Context:'));

			if (command) {
				blocks.push(`  Command: ${color.cyan(command)}`);
			}

			if (option) {
				blocks.push(
					`  Option: ${color.yellow(
						`${option.startsWith('--') ? '' : '--'}${option}`,
					)}`,
				);
			}

			if (argument) {
				blocks.push(`  Argument: ${color.yellow(`<${argument}>`)}`);
			}
		}

		// Expected values
		if (expected.length) {
			blocks.push(
				'',
				color.bold('Expected:'),
				`  ${formatList(expected, color.green)}`,
			);
		}

		// Example usages
		if (examples.length) {
			blocks.push(
				'',
				color.bold('Examples:'),
				`  ${formatExamples(examples)}`,
			);
		}

		// Received values
		if (received.length) {
			blocks.push(
				'',
				color.bold('Received:'),
				`  ${formatReceived(received, color.yellow)}`,
			);
		}

		// Hint resolution
		const resolvedHint = resolveHint(hint, expected, received);
		if (resolvedHint) {
			blocks.push(
				'',
				color.bold('Hint:'),
				`  ${color.cyan(resolvedHint)}`,
			);
		}

		super(blocks.join('\n'));
		this.name = 'CommandError';
	}
}
