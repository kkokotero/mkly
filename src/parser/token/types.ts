/**
 * Represents a normalized result of a parsed CLI argument.
 *
 * This interface is used internally after raw command-line tokens
 * have been analyzed and classified.
 */
export interface ParsedArguments {
  /**
   * The argument key or name, without leading dashes.
   *
   * Examples:
   *  - "--output"   → "output"
   *  - "-o"         → "o"
   */
  key?: string;

  /**
   * The parsed value associated with the argument.
   *
   * Can be:
   *  - string  → value provided explicitly (e.g. "--port=3000")
   *  - boolean → true/false for flags or negations
   */
  value?: string | boolean;

  /**
   * Indicates whether the argument is a boolean flag.
   *
   * Example:
   *  - "--verbose"
   */
  isFlag?: boolean;

  /**
   * Indicates whether the argument represents a negated flag.
   *
   * Example:
   *  - "--no-cache"
   */
  isNegation?: boolean;

  /**
   * The original raw token as received from the CLI input.
   *
   * Example:
   *  - "--port=3000"
   *  - "-abc"
   */
  original?: string;

  /**
   * Indicates whether the argument is a grouped short alias.
   *
   * Example:
   *  - "-abc" → equivalent to "-a -b -c"
   */
  isGrouped?: boolean;

  /**
   * Indicates the special end-of-flags marker.
   * After this token, all arguments are treated as positional.
   *
   * Example:
   *  - "--"
   */
  isEndOfFlags?: boolean;
}
