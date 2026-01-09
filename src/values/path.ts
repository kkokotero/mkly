import { ParsingError } from '@src/exceptions';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Wrapper around filesystem paths that provides:
 * - Validation
 * - Normalization and resolution
 * - Convenience accessors
 * - Safe file reading utilities
 *
 * This class is intended to be used in parsing and CLI contexts,
 * where rich errors and predictable behavior are preferred.
 */
export class Path {
	/** Raw input provided by the user */
	readonly raw: string;

	/** Resolved absolute path */
	readonly value: string;

	constructor(input: string) {
		if (input.trim() === '') {
			throw new ParsingError('Path must be a non-empty string', {
				hint: 'Provide a valid file or directory path.',
			});
		}

		this.raw = input;
		this.value = path.resolve(input);
	}

	/** Whether the path exists in the filesystem */
	get exists(): boolean {
		return fs.existsSync(this.value);
	}

	/** Whether the path points to a file */
	get isFile(): boolean {
		try {
			return fs.statSync(this.value).isFile();
		} catch {
			return false;
		}
	}

	/** Whether the path points to a directory */
	get isDirectory(): boolean {
		try {
			return fs.statSync(this.value).isDirectory();
		} catch {
			return false;
		}
	}

	/** File or directory name */
	get basename(): string {
		return path.basename(this.value);
	}

	/** Directory name */
	get dirname(): string {
		return path.dirname(this.value);
	}

	/** File extension (empty string if none) */
	get extname(): string {
		return path.extname(this.value);
	}

	/** Normalized (OS-safe) path */
	get normalized(): string {
		return path.normalize(this.value);
	}

	/** Absolute path */
	get absolute(): string {
		return this.value;
	}

	/**
	 * Reads the file contents at this path.
	 *
	 * This method:
	 * - Ensures the path exists
	 * - Ensures the path points to a file
	 * - Throws a `ParsingError` with a helpful message on failure
	 *
	 * @param encoding - File encoding (defaults to "utf8").
	 * @returns The file contents as a string.
	 */
	read(encoding: BufferEncoding = 'utf8'): string {
		if (!this.exists) {
			throw new ParsingError('File does not exist', {
				received: [this.value],
				hint: 'Check that the path is correct and the file exists.',
			});
		}

		if (!this.isFile) {
			throw new ParsingError('Path does not point to a file', {
				received: [this.value],
				hint: 'Provide a path to a readable file.',
			});
		}

		try {
			return fs.readFileSync(this.value, { encoding });
		} catch (_error) {
			throw new ParsingError('Failed to read file', {
				received: [this.value],
				hint: 'Check file permissions and encoding.',
			});
		}
	}

	toString(): string {
		return this.value;
	}

	toJSON(): string {
		return this.value;
	}

	/**
	 * Parses an unknown value into a `Path` instance.
	 *
	 * @param input - Value to parse.
	 * @returns A `Path` instance.
	 */
	static parse(input: unknown): Path {
		if (input instanceof Path) return input;
		if (typeof input !== 'string') {
			throw new TypeError('Invalid Path value');
		}
		return new Path(input);
	}

	/* ------------------------------------------------------------------ */
	/* Validation                                                         */
	/* ------------------------------------------------------------------ */

	/**
	 * Checks whether a value is a valid path string.
	 *
	 * Valid examples:
	 * ✔ "./file.txt"
	 * ✔ "../src/index.ts"
	 * ✔ "/usr/bin/node"
	 * ✔ "C:\\Users\\name\\file.txt"
	 *
	 * Invalid examples:
	 * ✖ ""
	 * ✖ 123
	 * ✖ null
	 *
	 * @param input - Value to validate.
	 * @returns True if the value is a valid path string.
	 */
	static isValid(input: unknown): boolean {
		if (typeof input !== 'string') return false;
		if (input.trim() === '') return false;

		// Disallow null bytes (security / fs APIs)
		if (input.includes('\0')) return false;

		try {
			// path.resolve will throw on very broken inputs
			path.resolve(input);
			return true;
		} catch {
			return false;
		}
	}
}
