import {
	ALIAS,
	ALIAS_VALUE_REGEX,
	ALIAS_WITH_VALUE,
} from './constants';
import type { ParsedArguments } from './types';

/**
 * Parses a single CLI token and returns a normalized representation
 * describing its semantic meaning (flag, value, negation, etc).
 *
 * This function does not validate against a command schema; it only
 * classifies the token structure.
 */
export function parseToken(token: string): ParsedArguments {
	// Remove surrounding whitespace to ensure reliable matching
	const trimmed = token.trim();

	/**
	 * Case 0: End of flags marker (`--`)
	 * Signals that all following tokens must be treated as positional arguments.
	 */
	if (trimmed === '--') {
		return {
			original: token,
			isEndOfFlags: true,
		};
	}

	/**
	 * Case 1: Boolean negation (`--no-key`)
	 * Represents a disabled boolean flag.
	 */
	if (trimmed.startsWith('--no-')) {
		return {
			key: trimmed.slice(5),
			isFlag: true,
			isNegation: true,
			original: token,
		};
	}

	/**
	 * Case 2: Long flag with explicit value (`--key=value`)
	 */
	if (trimmed.startsWith('--') && trimmed.includes('=')) {
		const [keyPart = '', valPart = ''] = trimmed.split(ALIAS_VALUE_REGEX);
		return {
			key: keyPart.substring(2),
			value: valPart,
			isFlag: true,
			original: token,
		};
	}

	/**
	 * Case 3: Long flag without value (`--key`)
	 */
	if (trimmed.startsWith('--')) {
		return {
			key: trimmed.substring(2),
			isFlag: true,
			original: token,
		};
	}

	/**
	 * Case 4: Short alias with explicit value (`-a=23`)
	 */
	if (ALIAS_WITH_VALUE.test(trimmed)) {
		const [keyPart = '', valPart = ''] = trimmed.split(ALIAS_VALUE_REGEX);
		return {
			key: keyPart.substring(1),
			value: valPart,
			isFlag: true,
			original: token,
		};
	}

	/**
	 * Case 5: Simple short alias (`-a`)
	 */
	if (ALIAS.test(trimmed)) {
		return {
			key: trimmed.substring(1),
			isFlag: true,
			original: token,
		};
	}

	/**
	 * Fallback: Unrecognized or positional token
	 */
	return {
		original: token,
	};
}
