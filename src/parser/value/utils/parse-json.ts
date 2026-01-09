import { ParsingError } from '@src/exceptions';

/**
 * Regular expression that matches forbidden JavaScript tokens.
 * These tokens are disallowed to prevent code execution or access
 * to runtime/global objects.
 */
const FORBIDDEN_TOKENS =
	/\b(function|class|new|return|process|require|import|export|eval|this|global|window)\b/;

/**
 * Set of forbidden object keys to prevent prototype pollution
 * and other security issues.
 */
const FORBIDDEN_KEYS = new Set([
	'__proto__',
	'prototype',
	'constructor',
]);

/**
 * Checks whether a value is a plain JavaScript object.
 *
 * A plain object:
 * - Is of type "object"
 * - Is not null
 * - Is not an array
 * - Has Object.prototype as its prototype
 *
 * @param value - The value to check.
 * @returns True if the value is a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, any> {
	if (typeof value !== 'object' || value === null) return false;
	if (Array.isArray(value)) return false;
	return Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Converts a simple JavaScript object literal into valid JSON
 * WITHOUT executing any code.
 *
 * This function performs a best-effort normalization by:
 * - Rejecting unsafe JavaScript tokens
 * - Removing wrapping parentheses
 * - Converting single quotes to double quotes
 * - Quoting unquoted object keys
 * - Removing trailing commas
 *
 * @param input - The raw JavaScript-like object string.
 * @returns A JSON-compatible string.
 *
 * @throws {ParsingError}
 * Thrown when unsafe JavaScript syntax is detected.
 */
function jsObjectToJson(input: string): string {
	if (FORBIDDEN_TOKENS.test(input)) {
		throw new ParsingError('Unsafe JavaScript object', {
			received: [input],
			hint: 'Functions, classes, or runtime expressions are not allowed.',
		});
	}

	return input
		.trim()
		// Remove wrapping parentheses
		.replace(/^\(/, '')
		.replace(/\)$/, '')
		// Convert single quotes to double quotes
		.replace(/'/g, '"')
		// Quote unquoted object keys
		.replace(
			/([{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g,
			'$1"$2":',
		)
		// Remove trailing commas
		.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Recursively sanitizes an object to ensure it only contains
 * safe keys and allowed value types.
 *
 * - Disallows dangerous keys (e.g. "__proto__", "constructor")
 * - Allows primitives, arrays, and plain objects
 * - Recursively sanitizes nested plain objects
 *
 * @param obj - The object to sanitize.
 * @returns A new, sanitized object.
 *
 * @throws {ParsingError}
 * Thrown when an invalid key or value type is found.
 */
function sanitizeObject(obj: Record<string, any>): Record<string, any> {
	const clean: Record<string, any> = Object.create(null);

	for (const [key, value] of Object.entries(obj)) {
		if (FORBIDDEN_KEYS.has(key)) {
			throw new ParsingError('Invalid JSON key', {
				received: [key],
				hint: `Key "${key}" is not allowed for security reasons.`,
			});
		}

		if (typeof value === 'object' && value !== null) {
			if (Array.isArray(value)) {
				clean[key] = value;
			} else if (isPlainObject(value)) {
				clean[key] = sanitizeObject(value);
			} else {
				throw new ParsingError('Invalid value type', {
					received: [String(value)],
					hint: 'Only plain objects, arrays and primitives are allowed.',
				});
			}
		} else {
			clean[key] = value;
		}
	}

	return clean;
}

/**
 * Parses a string into a safe, sanitized plain object.
 *
 * Parsing strategy:
 * 1. Attempt to parse the input as strict JSON.
 * 2. If that fails, attempt to normalize a JavaScript object literal
 *    into valid JSON and parse again.
 * 3. Validate that the root value is a plain object.
 * 4. Recursively sanitize the object to prevent unsafe keys or values.
 *
 * @param input - The raw input string.
 * @returns A sanitized plain object.
 *
 * @throws {ParsingError}
 * Thrown when parsing fails, the syntax is invalid, or the result
 * is not a plain object.
 */
export function parseJson(input: string): Record<string, any> {
	let parsed: unknown;

	try {
		// First attempt: strict JSON parsing
		parsed = JSON.parse(input);
	} catch {
		try {
			// Fallback: normalize JavaScript object literal syntax
			const normalized = jsObjectToJson(input);
			parsed = JSON.parse(normalized);
		} catch {
			throw new ParsingError('Invalid object syntax', {
				expected: ['{"key": "value"}', "{ key: 'value' }"],
				received: [input],
				examples: [
					'{"name": "John", "age": 30}',
					"{ name: 'Jane', age: 25 }",
				],
				hint: 'Only plain JavaScript object literals are allowed.',
			});
		}
	}

	// Ensure the root value is a plain object
	if (!isPlainObject(parsed)) {
		throw new ParsingError('Invalid root value', {
			expected: ['Plain object'],
			received: [typeof parsed],
		});
	}

	return sanitizeObject(parsed);
}
