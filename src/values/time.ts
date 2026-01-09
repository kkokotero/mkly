/** biome-ignore-all lint/suspicious/noAssignInExpressions: Necessary */
/** biome-ignore-all lint/suspicious/noAssignInExpressions: Regex exec requires assignment in condition */

import { ParsingError } from "@src/exceptions";

/**
 * Represents a time value parsed from either a duration string or a date string.
 *
 * Supported inputs include:
 * - Duration strings: "5s", "1h30m", "2d", "500ms"
 * - Date strings: "2025-12-28 14:00", "2025/12/28"
 *
 * Internally, all values are normalized and stored as milliseconds.
 * When a date is provided, the value represents the difference in milliseconds
 * between the parsed date and the current time.
 */
export class Time {
	/** Original input string */
	readonly raw: string;

	/** Normalized numeric value in milliseconds */
	readonly value: number; // milliseconds

	/**
	 * Creates a new Time instance from a string input.
	 *
	 * @param input - A duration string or date string
	 * @throws ParsingError if the input is empty or cannot be parsed
	 */
	constructor(input: string) {
		if (input.trim() === '') {
			throw new ParsingError('Time must be a non-empty string', {
				hint: 'Provide a valid time duration or date string.',
			});
		}

		this.raw = input;
		this.value = Time.parseToMs(input);
	}

	/** Time expressed in milliseconds */
	get ms(): number {
		return this.value;
	}

	/** Time expressed in seconds */
	get seconds(): number {
		return this.value / 1_000;
	}

	/** Time expressed in minutes */
	get minutes(): number {
		return this.value / 60_000;
	}

	/** Time expressed in hours */
	get hours(): number {
		return this.value / 3_600_000;
	}

	/** Time expressed in days */
	get days(): number {
		return this.value / 86_400_000;
	}

	/** Returns true if the time value is exactly zero */
	get isZero(): boolean {
		return this.value === 0;
	}

	/** Returns true if the time value is greater than zero */
	get isPositive(): boolean {
		return this.value > 0;
	}

	/**
	 * Returns a string representation in milliseconds.
	 *
	 * Example: "1500ms"
	 */
	toString(): string {
		return `${this.value}ms`;
	}

	/**
	 * JSON serialization hook.
	 * Returns the numeric millisecond value.
	 */
	toJSON(): number {
		return this.value;
	}

	/**
	 * Factory helper that normalizes different input types into a Time instance.
	 *
	 * @param input - A Time instance or a string
	 * @throws TypeError if the input type is invalid
	 */
	static parse(input: unknown): Time {
		if (input instanceof Time) return input;
		if (typeof input !== 'string') {
			throw new TypeError('Invalid Time value');
		}
		return new Time(input);
	}

	/* ------------------------------------------------------------------ */
	/* Validation                                                         */
	/* ------------------------------------------------------------------ */

	/**
	 * Checks whether a value is a valid Time string.
	 *
	 * Valid examples:
	 * - "5s", "1h30m", "2d"
	 * - "2025-12-28 14:00"
	 * - "2025/12/28"
	 *
	 * Invalid examples:
	 * - "1..5s"
	 * - "10"
	 * - "abc"
	 *
	 * @param input - Value to validate
	 */
	static isValid(input: unknown): boolean {
		if (typeof input !== 'string') return false;
		if (input.trim() === '') return false;

		const trimmed = input.trim();

		// Valid date string
		if (Time.parseDate(trimmed) !== null) {
			return true;
		}

		// Valid duration string
		const durationRegex = /(\d+(?:\.\d+)?)(ms|s|m|h|d|w|mo|y)/g;

		let match: RegExpExecArray | null;
		let found = false;

		while ((match = durationRegex.exec(trimmed)) !== null) {
			found = true;

			// Numeric part must be finite
			if (!Number.isFinite(Number(match[1]))) {
				return false;
			}
		}

		return found;
	}

	// ──────────────────────────────────────────────
	// Internals
	// ──────────────────────────────────────────────

	/**
	 * Parses a time string and converts it into milliseconds.
	 * Tries date parsing first, then duration parsing.
	 *
	 * @param input - Raw input string
	 * @throws ParsingError if the input cannot be parsed
	 */
	private static parseToMs(input: string): number {
		const trimmed = input.trim();

		const dateMs = Time.parseDate(trimmed);
		if (dateMs !== null) {
			return dateMs;
		}

		const durationMs = Time.parseDuration(trimmed);
		if (durationMs !== null) {
			return durationMs;
		}

		throw new ParsingError(
			'Invalid Time format.',
			{
				hint: 'Provide a valid time duration (e.g., "5s", "1h30m") or date string (e.g., "2025-12-28 14:00").',
				received: [input],
				examples: ['5s', '1h30m', '2025-12-28 14:00'],
			},
		);
	}

	/**
	 * Attempts to parse a date string and returns the time difference
	 * in milliseconds relative to the current time.
	 *
	 * @param input - Date string
	 * @returns Milliseconds until the date, or null if invalid
	 */
	private static parseDate(input: string): number | null {
		const normalized = input
			.replace(/\//g, '-')
			.replace(
				/^(\d{2})-(\d{2})-(\d{2,4})/,
				(_, d, m, y) =>
					y.length === 2 ? `20${y}-${m}-${d}` : `${y}-${m}-${d}`,
			);

		const date = new Date(normalized);
		if (!isNaN(date.getTime())) {
			return date.getTime() - Date.now();
		}

		return null;
	}

	/**
	 * Parses a duration string and converts it into milliseconds.
	 * Supports multiple units in a single expression (e.g., "1h30m").
	 *
	 * @param input - Duration string
	 * @returns Total milliseconds, or null if invalid
	 */
	private static parseDuration(input: string): number | null {
		const regex = /(\d+(?:\.\d+)?)(ms|s|m|h|d|w|mo|y)/g;

		let match: RegExpExecArray | null;
		let total = 0;
		let found = false;

		while ((match = regex.exec(input)) !== null) {
			found = true;
			const value = Number(match[1]);
			const unit = match[2] ?? 'ms';

			total += value * Time.unitToMs(unit);
		}

		return found ? total : null;
	}

	/**
	 * Converts a time unit into its equivalent in milliseconds.
	 *
	 * @param unit - Time unit identifier
	 * @throws ParsingError if the unit is not supported
	 */
	private static unitToMs(unit: string): number {
		switch (unit) {
			case 'ms': return 1;
			case 's':  return 1_000;
			case 'm':  return 60_000;
			case 'h':  return 3_600_000;
			case 'd':  return 86_400_000;
			case 'w':  return 604_800_000;
			case 'mo': return 2_629_800_000; // Approximate month (30.44 days)
			case 'y':  return 31_557_600_000; // Average year
			default:
				// Defensive branch
				throw new ParsingError('Unsupported Time unit', {
					received: [unit],
					expected: ['ms', 's', 'm', 'h', 'd', 'w', 'mo', 'y'],
					hint: 'Use a valid time unit.',
					examples: ['5s', '1h', '2d'],
				});
		}
	}
}
