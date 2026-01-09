import { Size, Path, Time } from '@values/index';
import { isValidNumberString } from './is-valid-number-string';

/**
 * Builds a string representation of an array type based on the
 * calculated types of its elements.
 *
 * Each unique element type is inferred using `calcType` and then
 * combined into a generic-like format:
 *
 *   array<number, string>
 *
 * @param values - Array of unknown values to analyze.
 * @returns A string describing the inferred array type.
 */
const buildArrayType = (values: unknown[]): string => {
	const types = new Set(values.map(calcType));
	return `array<${[...types].join(', ')}>`;
};

/**
 * Infers the logical type of a value and returns it as a string.
 *
 * This function is designed to work with both runtime values and
 * string representations of values (such as CLI input).
 *
 * Supported return values include:
 * - Primitive types: null, number, nan, string, boolean, function, object, undefined
 * - Domain-specific types: size, time, path
 * - Composite types: array<...>
 *
 * @param value - The value whose type should be inferred.
 * @returns A string describing the inferred type.
 */
export function calcType(value: unknown): string {
	// Explicit null check
	if (value === null) return 'null';

	// Runtime arrays
	if (Array.isArray(value)) {
		return buildArrayType(value);
	}

	// Numbers and NaN
	if (typeof value === 'number') {
		return Number.isNaN(value) ? 'nan' : 'number';
	}

	// String-based inference (common for user or CLI input)
	if (typeof value === 'string') {
		const trimmed = value.trim();

		// Explicit string literals: "text" or 'text'
		if (
			(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
			(trimmed.startsWith("'") && trimmed.endsWith("'"))
		) {
			return 'string';
		}

		// Inline object representation: { a: 1 }
		if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
			return 'object';
		}

		// Inline array representation: [1, 2, "a"]
		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			const values = trimmed
				.slice(1, -1)
				.split(',')
				.map((v) => v.trim());

			return buildArrayType(values);
		}

		// CSV-like values: 1,2,3 or 1,"a",true
		if (trimmed.includes(',')) {
			const values = trimmed.split(',').map((v) => v.trim());
			return buildArrayType(values);
		}

		// Primitive number detection
		if (isValidNumberString(trimmed)) return 'number';

		// Domain-specific validation (checked before falling back to string)
		if (Size.isValid(trimmed)) return 'size';
		if (Time.isValid(trimmed)) return 'time';
		if (
			Path.isValid(trimmed) &&
			(trimmed.includes('/') || trimmed.includes('\\'))
		)
			return 'path';

		// Default string fallback
		return 'string';
	}

	// Other primitive and structural types
	if (typeof value === 'boolean') return 'boolean';
	if (typeof value === 'function') return 'function';
	if (typeof value === 'object') return 'object';

	// Fallback for undefined and unhandled cases
	return 'undefined';
}
