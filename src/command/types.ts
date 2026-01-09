import type { Value, ValueKey } from '@parser/value/types';

/**
 * Forces TypeScript to fully expand a type.
 *
 * This is mainly used to improve readability of complex or merged types
 * in IDE tooltips by resolving intersections into a plain object shape.
 */
export type Expand<T> = { [K in keyof T]: T[K] };

/**
 * Merges two object types into a single expanded type.
 *
 * This utility combines the properties of both types using an intersection
 * and then expands the result to produce a clean, flattened object type.
 */
export type Merge<A, B> = Expand<A & B>;

/**
 * Configuration type for a positional argument.
 *
 * @template Type - The value type key that defines how the argument is parsed.
 *
 * - `type` defines the expected value type.
 * - `description` provides human-readable documentation.
 * - `optional` determines whether the argument is required.
 * - `defaultValue` is used when the argument is not provided.
 */
export type Argument<Type extends ValueKey = ValueKey> = {
	type?: Type;
	description?: string;
	optional?: boolean;
	defaultValue?: Value<Type>;
  choices?: string[];
};

/**
 * Configuration type for a command option (flag).
 *
 * @template Type - The value type key that defines how the option is parsed.
 *
 * - `type` defines the expected value type.
 * - `alias` specifies alternative names for the option.
 * - `description` provides human-readable documentation.
 * - `optional` determines whether the option is required.
 * - `defaultValue` is used when the option is not provided.
 */
export type Option<Type extends ValueKey = ValueKey> = {
	type?: Type;
	alias?: string[];
	description?: string;
	optional?: boolean;
	defaultValue?: Value<Type>;
  choices?: string[];
};

/**
 * Determines whether a configuration object marks a value as optional.
 *
 * Evaluates to `true` if the `optional` property is explicitly set to `true`,
 * otherwise evaluates to `false`.
 */
export type IsOptional<T> = T extends { optional: true } ? true : false;

/**
 * Extracts the runtime value type from a configuration object.
 *
 * If the configuration contains a valid `type` field, this utility maps it
 * to the corresponding `Value<T>` type. Otherwise, it resolves to `never`.
 */
export type ValueFromConfig<C> = C extends { type: infer T }
	? T extends ValueKey
		? Value<T>
		: never
	: never;

/**
 * Builds the resulting record type for positional arguments.
 *
 * The property is marked as optional or required depending on the `optional`
 * flag in the configuration.
 *
 * @template Name - Argument name.
 * @template Config - Argument configuration object.
 */
export type ArgumentsRecord<
	Name extends string,
	Config,
> = IsOptional<Config> extends true
	? { [K in Name]?: ValueFromConfig<Config> }
	: { [K in Name]: ValueFromConfig<Config> };

/**
 * Builds the resulting record type for options (flags).
 *
 * The property is marked as optional or required depending on the `optional`
 * flag in the configuration.
 *
 * @template Name - Option name.
 * @template Config - Option configuration object.
 */
export type OptionRecord<
	Name extends string,
	Config,
> = IsOptional<Config> extends true
	? { [K in Name]?: ValueFromConfig<Config> }
	: { [K in Name]: ValueFromConfig<Config> };
