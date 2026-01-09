import characters from "mauw/characters";
import color from "mauw/colors";
import { calcType } from "./calc-type";

/**
 * Formats a list of values as a comma-separated, colorized string.
 *
 * Each item is converted to a string, wrapped in quotes, and passed
 * through the provided colorizing function.
 *
 * Example output:
 *   "a", "b", "c"
 *
 * @param items - List of values to format.
 * @param colorize - Function used to apply color or styling to each value.
 * @returns A formatted, comma-separated string.
 */
export const formatList = (
	items: unknown[],
	colorize: (v: string) => string,
) =>
	items.map((item) => colorize(`"${String(item)}"`)).join(', ');

/**
 * Formats a list of received values with their inferred types.
 *
 * Each value is displayed as:
 *   "<value>" → (<type>)
 *
 * Where:
 * - The value is colorized using the provided function.
 * - The arrow and type annotation are styled using dim, bold formatting.
 * - The type is inferred using `calcType`.
 *
 * Example output:
 *   "123" → (number), "abc" → (string)
 *
 * @param items - List of received values.
 * @param colorize - Function used to apply color or styling to each value.
 * @returns A formatted, comma-separated string with type annotations.
 */
export const formatReceived = (
	items: unknown[],
	colorize: (v: string) => string,
) =>
	items
		.map(
			(item) =>
				colorize(`"${String(item)}"`) +
				' ' +
				color.reset.dim.bold(
					`${characters.arrowRight} (${calcType(item)})`,
				),
		)
		.join(', ');

/**
 * Formats example values for display in help or error messages.
 *
 * Each example is colored using a consistent cyan style and
 * joined into a comma-separated string.
 *
 * Example output:
 *   example1, example2, example3
 *
 * @param examples - List of example strings.
 * @returns A formatted, comma-separated string of examples.
 */
export const formatExamples = (examples: string[]) =>
	examples.map((ex) => color.cyan(ex)).join(', ');
