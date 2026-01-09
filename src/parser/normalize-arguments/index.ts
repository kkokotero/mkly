/**
 * Normalizes CLI arguments across different JavaScript runtimes.
 *
 * This function removes runtime-specific entries (such as the runtime binary
 * and script path) so that the returned array contains only the user-defined
 * CLI arguments.
 *
 * It supports Node.js, Bun, and Deno, and also works with manually provided
 * argument arrays.
 *
 * @param args - The raw arguments array, typically `process.argv`
 * @returns A normalized array of CLI arguments
 */
export function normalizeArguments(args: string[]): string[] {
	// If there are no arguments, return as-is
	if (args.length === 0) return args;

	/**
	 * Node.js runtime
	 *
	 * When the input array is exactly `process.argv`, the first two entries are:
	 *  - The Node.js executable path
	 *  - The executed script path
	 *
	 * These are removed to keep only user-provided arguments.
	 */
	if (
		typeof process !== 'undefined' &&
		Array.isArray(process.argv) &&
		args === process.argv
	) {
		return args.slice(2);
	}

	/**
	 * Bun runtime (direct invocation)
	 *
	 * Bun usually prepends the runtime binary and script path.
	 * If the first argument contains "bun", remove the first two entries.
	 */
	if (
		typeof (globalThis as any).Bun !== 'undefined' &&
		args.length >= 2 &&
		args[0]?.includes('bun')
	) {
		return args.slice(2);
	}

	/**
	 * Deno runtime
	 *
	 * Deno already provides a clean arguments array, so no normalization
	 * is required.
	 */
	if (typeof (globalThis as any).Deno !== 'undefined') {
		return args;
	}

	/**
	 * Generic runtime detection
	 *
	 * Handles cases where arguments include:
	 *  - A runtime binary (node, bun, deno)
	 *  - A script file (.js, .mjs, .cjs, .ts)
	 *
	 * If detected, the first two entries are removed.
	 */
	if (
		args.length >= 2 &&
		(args[0]?.includes('node') ||
			args[0]?.includes('bun') ||
			args[0]?.includes('deno') ||
			args[1]?.endsWith('.js') ||
			args[1]?.endsWith('.mjs') ||
			args[1]?.endsWith('.cjs') ||
			args[1]?.endsWith('.ts'))
	) {
		return args.slice(2);
	}

	// Fallback: return arguments unchanged
	return args;
}
