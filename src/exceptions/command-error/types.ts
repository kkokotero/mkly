/**
 * Options used to enrich and contextualize a command-related error.
 * This interface is intended to provide structured metadata that can be
 * used to build clear, user-friendly error messages in a CLI or command parser.
 */
export interface CommandErrorOptions {
	/**
	 * Name of the command where the error occurred.
	 * Usually corresponds to the main or subcommand being executed.
	 */
	command?: string;

	/**
	 * Name of the option (flag) related to the error.
	 * Example: "--output", "-o".
	 */
	option?: string;

	/**
	 * Name of the argument related to the error.
	 * This typically refers to a positional argument.
	 */
	argument?: string;

	/**
	 * List of expected values, formats, or types.
	 * Used to explain what the parser was expecting.
	 */
	expected?: string[];

	/**
	 * List of values actually received from the user input.
	 * Useful for showing invalid or unexpected input.
	 */
	received?: string[];

	/**
	 * Example usages that demonstrate valid input.
	 * Can be displayed to help the user correct the error.
	 */
	examples?: string[];

	/**
	 * Controls whether a hint should be shown.
	 * - true: automatically generate a hint.
	 * - string: display the provided custom hint.
	 * - false or undefined: do not show a hint.
	 */
	hint?: boolean | string;
}
