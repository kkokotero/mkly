import type { Argument, Option } from './types';

/**
 * Default configuration for an argument.
 *
 * This constant defines the base behavior for arguments when no explicit
 * configuration is provided by the user. By default, the argument is treated
 * as a boolean type.
 *
 * It can be used as a fallback or starting point when building or normalizing
 * argument definitions.
 */
export const DEFAULT_ARGUMENT: Argument<'boolean'> = {
	type: 'boolean',
};

/**
 * Default configuration for an option.
 *
 * This constant represents the default behavior for options when no specific
 * configuration is supplied. By default, the option is interpreted as a
 * boolean value.
 *
 * It serves as a shared baseline that can be extended or overridden by
 * user-defined option settings.
 */
export const DEFAULT_OPTION: Option<'boolean'> = {
	type: 'boolean',
};
