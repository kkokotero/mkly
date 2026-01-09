import { ParsingError } from '@src/exceptions';

/**
 * Represents a data size with a raw string input and a normalized value in bytes.
 *
 * This class supports parsing human-readable size strings such as:
 * - "10kb"
 * - "5mb"
 * - "1gb"
 * - "500b"
 *
 * Internally, all values are stored as bytes.
 */
export class Size {
	/** Original input string (e.g. "10mb") */
	readonly raw: string;

	/** Normalized numeric value in bytes */
	readonly value: number; // bytes

	/**
	 * Creates a new Size instance from a string input.
	 *
	 * @param input - Size string including number and unit
	 * @throws TypeError if the input is empty
	 * @throws ParsingError if the format is invalid
	 */
	constructor(input: string) {
		if (input.trim() === '') {
			throw new TypeError('Size must be a non-empty string');
		}

		this.raw = input;
		this.value = Size.parseToBytes(input);
	}

	/** Size expressed in bytes */
	get bytes(): number {
		return this.value;
	}

	/** Size expressed in kilobytes (KB) */
	get kilobytes(): number {
		return this.value / 1_024;
	}

	/** Size expressed in megabytes (MB) */
	get megabytes(): number {
		return this.value / 1_024 ** 2;
	}

	/** Size expressed in gigabytes (GB) */
	get gigabytes(): number {
		return this.value / 1_024 ** 3;
	}

	/** Size expressed in terabytes (TB) */
	get terabytes(): number {
		return this.value / 1_024 ** 4;
	}

	/** Size expressed in petabytes (PB) */
	get petabytes(): number {
		return this.value / 1_024 ** 5;
	}

	/** Returns true if the size is exactly zero bytes */
	get isZero(): boolean {
		return this.value === 0;
	}

	/** Returns true if the size is greater than zero */
	get isPositive(): boolean {
		return this.value > 0;
	}

	/**
	 * Returns a string representation in bytes.
	 *
	 * Example: "1024B"
	 */
	toString(): string {
		return `${this.value}B`;
	}

	/**
	 * JSON serialization hook.
	 * Returns the numeric byte value.
	 */
	toJSON(): number {
		return this.value;
	}

	/**
	 * Factory helper that normalizes different input types into a Size instance.
	 *
	 * @param input - A Size instance or a size string
	 * @throws TypeError if the input is not a valid type
	 */
	static parse(input: unknown): Size {
		if (input instanceof Size) return input;
		if (typeof input !== 'string') {
			throw new TypeError('Invalid Size value');
		}
		return new Size(input);
	}

	/* ------------------------------------------------------------------ */
	/* Validation                                                         */
	/* ------------------------------------------------------------------ */

	/**
	 * Checks whether a value is a valid size string.
	 *
	 * Valid examples:
	 * - "10kb"
	 * - "5mb"
	 * - "1gb"
	 * - "0b"
	 *
	 * Invalid examples:
	 * - "1.2.3mb"
	 * - "10"
	 * - "kb"
	 *
	 * @param input - Value to validate
	 */
	static isValid(input: unknown): boolean {
		if (typeof input !== 'string') return false;
		if (input.trim() === '') return false;

		// number + unit (single decimal point allowed)
		const match = input.trim().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb|tb|pb)$/i);
		if (!match) return false;

		const value = Number(match[1]);
		return Number.isFinite(value);
	}

	// ──────────────────────────────────────────────
	// Internals
	// ──────────────────────────────────────────────

	/**
	 * Parses a size string and converts it into bytes.
	 *
	 * @param input - Size string with unit
	 * @throws ParsingError if the format or unit is invalid
	 */
	private static parseToBytes(input: string): number {
		const match = input.trim().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb|tb|pb)$/i);

		if (!match) {
			throw new ParsingError(
				'Invalid Size format. Expected "10kb", "5mb", "1gb", "2tb", "500b", etc.',
				{
					received: [input],
					hint: 'Ensure the size string includes a valid number followed by a unit (b, kb, mb, gb, tb, pb).',
					examples: ['10kb', '5mb', '1gb', '2tb', '500b'],
				},
			);
		}

		const value = Number(match[1]);
		const unit = (match[2] ?? 'kb').toLowerCase();

		switch (unit) {
			case 'b':
				return value;
			case 'kb':
				return value * 1_024;
			case 'mb':
				return value * 1_024 ** 2;
			case 'gb':
				return value * 1_024 ** 3;
			case 'tb':
				return value * 1_024 ** 4;
			case 'pb':
				return value * 1_024 ** 5;
			default:
				// This branch is defensive and should not be reachable
				throw new ParsingError('Unsupported Size unit', {
					received: [unit],
					expected: ['b', 'kb', 'mb', 'gb', 'tb', 'pb'],
					hint: 'Use one of the supported size units.',
					examples: ['10kb', '5mb', '1gb', '2tb', '500b'],
				});
		}
	}
}
