import type { Path, Size, Time } from '@values/index';

/**
 * Maps supported value type identifiers to their corresponding
 * runtime TypeScript types.
 *
 * This map is used to strongly type parsed values based on a
 * declared value kind.
 */
export type ValueMap = {
	// Core types

	/**
	 * Boolean value.
	 * Examples: true, false, "true", "false", 0, 1, "yes", "no", "on", "off"
	 */
	boolean: boolean;

	/**
	 * String value.
	 * Examples: "example", example
	 */
	string: string;

	/**
	 * Numeric value.
	 * Examples: "123", 123, "12.34", 12.34
	 */
	number: number;

  /**
   * Choice value from a predefined set of strings.
   * Examples: "red", "green", "blue"
   */
  choice: string[];

	// Derived types

	/**
	 * File system path.
	 * Examples: "./example", "./example/index.ts", "/usr/bin/node"
	 */
	path: Path;

	/**
	 * Time duration value.
	 * Examples: "5s", "1m", "2h", "300ms"
	 */
	time: Time;

	/**
	 * Size value.
	 * Examples: "10kb", "5mb", "1gb"
	 */
	size: Size;

	// Special types

	/**
	 * JSON object.
	 * Examples: "{ x: 2 }", '{"x":2}', { x: 2 }
	 */
	json: Record<string, any>;

	// Array types

	/**
	 * Array of boolean values.
	 * Examples: true,false,"true",0,1, [1, true, "false"]
	 */
	booleanArray: boolean[];

	/**
	 * Array of string values.
	 * Examples: a,b,c, "hello","world", ["a", "b", "c"]
	 */
	stringArray: string[];

	/**
	 * Array of numeric values.
	 * Examples: 1,2,3, "1","2", [1, 2, 3]
	 */
	numberArray: number[];

	/**
	 * Array of path values.
	 * Examples: "./a,./b", "/usr/bin", ["./a", "./b"]
	 */
	pathArray: Path[];

	/**
	 * Array of time values.
	 * Examples: 5s,1m, "2h", ["5s", "1m"]
	 */
	timeArray: Time[];

	/**
	 * Array of size values.
	 * Examples: 10kb,5mb, "1gb", ["10kb", "5mb"]
	 */
	sizeArray: Size[];
};

/**
 * Resolves the concrete TypeScript type for a given value key.
 */
export type Value<Value extends keyof ValueMap> = ValueMap[Value];

/**
 * Union type of all supported value keys.
 */
export type ValueKey = keyof ValueMap;
