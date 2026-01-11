/**
 * Matches a short alias that explicitly assigns a value using `=`.
 *
 * Example:
 *  - "-o=output.txt"
 *  - "-p=3000"
 */
export const ALIAS_WITH_VALUE = /^-(\w+)=(.*)$/s;

/**
 * Matches a generic alias starting with `-` followed by at least
 * one additional character.
 *
 * Example:
 *  - "-a"
 *  - "-output"
 *  - "-x123"
 */
export const ALIAS = /^-\w+$/;

/**
 * Extracts the value part of an alias assignment.
 * Everything after the first `=` is captured.
 *
 * Example:
 *  - "-o=output.txt" → "output.txt"
 *  - "-p=3000"       → "3000"
 */
export const ALIAS_VALUE_REGEX = /=(.*)/s;
