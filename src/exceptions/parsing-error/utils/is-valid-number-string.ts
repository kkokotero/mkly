/**
 * Checks whether a string represents a valid numeric value.
 *
 * Supported formats:
 * - Integers: "1", "-1"
 * - Decimals with leading digits: "3.14"
 *
 * Explicitly rejected formats:
 * - Multiple decimal points: "1.2.3"
 * - Missing integer part: ".5"
 * - Trailing decimal point: "3."
 *
 * This function is intentionally strict to avoid ambiguous
 * or partially valid numeric representations, which is
 * especially useful for parsing user or CLI input.
 *
 * @param value - The string to validate.
 * @returns True if the string is a valid number representation, otherwise false.
 */
export function isValidNumberString(value: string): boolean {
	return /^-?\d+(\.\d+)?$/.test(value);
}
