import { ParsingError } from '@src/exceptions';
import type { Value, ValueKey } from './types';
import { parseBoolean } from './utils/parse-boolean';
import { parseNumber } from './utils/parse-number';
import { Path, Size, Time } from '@src/values';
import { parseJson } from './utils/parse-json';
import { parseList } from './utils/parse-list';
import { parseChoice } from './utils/parse-choice';

/**
 * Coerces a positional argument value based on its declared type.
 *
 * If the argument has a type, the raw string value is parsed and
 * converted to the corresponding runtime value. Otherwise, the
 * raw value is returned as-is.
 *
 * @param arg - The argument definition.
 * @param raw - The raw string value provided by the user.
 * @returns The coerced argument value.
 */
export function coerceArgument(arg: any, raw: string, choices: string[] = []) {
	return arg.type ? parseValue(arg.type, raw, choices) : raw;
}

/**
 * Coerces an option value based on its declared type.
 *
 * Boolean options may already be provided as boolean values
 * (e.g. flags). In that case, the value is returned directly.
 *
 * @param opt - The option definition.
 * @param raw - The raw value provided by the user.
 * @returns The coerced option value.
 */
export function coerceOption(opt: any, raw: string | boolean, choices: string[] = []) {
	if (typeof raw === 'boolean') return raw;

	return opt.type ? parseValue(opt.type, raw, choices) : raw;
}

/**
 * Parses and converts a string value into a strongly typed value
 * based on the provided value type key.
 *
 * @param type - The target value type.
 * @param value - The raw string value to parse.
 * @returns The parsed and coerced value.
 *
 * @throws {ParsingError}
 * Thrown when the value type is unsupported or parsing fails.
 */
export function parseValue<Type extends ValueKey>(
	type: Type,
	value: string,
  choices: string[] = []
): Value<Type> {
	switch (type) {
		case 'boolean':
			return parseBoolean(value) as Value<Type>;

    case 'choice':
      return parseChoice(value, choices) as Value<Type>;

		case 'string':
			return value as Value<Type>;

		case 'number':
			return parseNumber(value) as Value<Type>;

		case 'path':
			return new Path(value) as Value<Type>;

		case 'time':
			return new Time(value) as Value<Type>;

		case 'size':
			return new Size(value) as Value<Type>;

		case 'json':
			return parseJson(value) as Value<Type>;

		case 'booleanArray':
			return parseList(value).map(parseBoolean) as Value<Type>;

		case 'numberArray':
			return parseList(value).map(parseNumber) as Value<Type>;

		case 'pathArray':
			return parseList(value).map((v) => new Path(v)) as Value<Type>;

		case 'timeArray':
			return parseList(value).map((v) => new Time(v)) as Value<Type>;

		case 'sizeArray':
			return parseList(value).map((v) => new Size(v)) as Value<Type>;

		case 'stringArray':
			return parseList(value).map((v) => v.trim()) as Value<Type>;

		default:
			throw new ParsingError(`Unsupported value type: ${type}`, {
				received: [type],
				hint: 'Ensure the value type is correct and supported.',
			});
	}
}
