/** biome-ignore-all lint/suspicious/noExplicitAny: Necessary */

import { CommandError } from '@src/exceptions/command-error';
import type {
	Argument,
	ArgumentsRecord,
	Merge,
	Option,
	OptionRecord,
} from './types';
import { DEFAULT_ARGUMENT, DEFAULT_OPTION } from './constants';
import color from 'mauw/colors';

/**
 * Removes ANSI escape codes from a string.
 *
 * This helper is used to calculate the real visual length of strings
 * that contain colored or styled output, ensuring proper alignment
 * in help messages.
 */
const stripAnsi = (str: string) =>
	str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: REGEX
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		'',
	);

/**
 * Represents a CLI command.
 *
 * @template Arguments - Inferred record type for positional arguments.
 * @template Options - Inferred record type for options (flags).
 *
 * A command can define:
 * - Positional arguments
 * - Options (flags)
 * - Sub-commands
 * - Aliases
 * - A description
 * - An action handler
 */
export class Command<
	Arguments extends Record<string, any> = Record<string, any>,
	Options extends Record<string, any> = Record<string, any>,
> {
	/** Registered sub-commands */
	public commands: Map<string, Command<any, any>> = new Map();

	/** Alternative names for this command */
	public aliases: Set<string> = new Set();

	/** Argument definitions for this command */
	public argumentsDef: Map<string, Argument<any>> = new Map();

	/** Option definitions for this command */
	public optionsDef: Map<string, Option<any>> = new Map();

	/** Optional description shown in help output */
	public commandDescription?: string;

	constructor(public name?: string) {}

	/** Action handler executed when the command is invoked */
	public handler?: (args: Arguments, options: Options) => unknown;

	/**
	 * Defines a new option (flag) for the command.
	 *
	 * @param name - Long name of the option.
	 * @param config - Option configuration.
	 *
	 * Throws if an option with the same name already exists.
	 */
	public option<Name extends string, Config extends Option>(
		name: Name,
		config?: Config,
	): Command<Arguments, Merge<Options, OptionRecord<Name, Config>>> {
		const options = {
			...DEFAULT_OPTION,
			...config,
		};

		if (this.optionsDef.has(name))
			throw new CommandError(`Option "--${name}" is already defined.`, {
				option: name,
				command: this.name,
				hint: 'Each option must have a unique name within the same command.',
			});

		this.optionsDef.set(name, options);
		return this as any;
	}

	/**
	 * Defines a new positional argument for the command.
	 *
	 * @param name - Argument name.
	 * @param config - Argument configuration.
	 *
	 * Enforces that required arguments cannot be declared
	 * after optional arguments.
	 */
	public argument<Name extends string, Config extends Argument>(
		name: Name,
		config?: Config,
	): Command<Merge<Arguments, ArgumentsRecord<Name, Config>>, Options> {
		const options = {
			...DEFAULT_ARGUMENT,
			...config,
		};

		if (this.argumentsDef.has(name)) {
			throw new CommandError(
				`Argument ${options.optional ? `[${name}]` : `<${name}>`} is already defined on this command.`,
				{
					argument: name,
					command: this.name,
					hint: 'Each argument must have a unique name within the same command.',
				},
			);
		}

		// Required arguments must appear before optional ones
		const isRequired = !options.optional;
		if (isRequired) {
			const hasOptionalArgs = [...this.argumentsDef.values()].some(
				(arg) => arg.optional || arg.defaultValue !== undefined,
			);
			if (hasOptionalArgs) {
				throw new CommandError(
					`Cannot define required argument "${name}" after an optional argument.`,
					{
						argument: name,
						command: this.name,
						hint: 'All required arguments must be defined before any optional arguments.',
					},
				);
			}
		}

		this.argumentsDef.set(name, options as Argument<any>);
		return this as any;
	}

	/**
	 * Registers a sub-command.
	 *
	 * @param name - Name of the sub-command.
	 * @param commad - Optional existing Command instance.
	 *
	 * Throws if a sub-command with the same name already exists.
	 */
	public command<
		A extends Record<string, any> = Record<string, any>,
		B extends Record<string, any> = Record<string, any>,
	>(name: string, commad?: Command<A, B>): Command<A, B> {
		if (this.commands.has(name)) {
			throw new CommandError(`Command "${name}" already exists.`, {
				command: this.name,
				received: [name],
				hint: 'Each sub-command must have a unique name within the same command.',
			});
		}

		const cmd = commad || new Command();
		cmd.name = name;

		this.commands.set(name, cmd);
		return cmd;
	}

	/**
	 * Registers one or more aliases for the command.
	 */
	public alias(...aliases: string[]): this {
		for (const alias of aliases) {
			this.aliases.add(alias);
		}
		return this;
	}

	/**
	 * Sets the description of the command.
	 *
	 * This description is displayed at the top of the help output
	 * and in the sub-command listing of parent commands.
	 */
	public description(description: string): this {
		this.commandDescription = description;
		return this;
	}

	/**
	 * Defines the action handler for the command.
	 *
	 * Throws if an action handler is already defined.
	 */
	public action(
		callback: (args: Arguments, options: Options) => unknown,
	): this {
		if (this.handler) {
			throw new CommandError(
				'This command already has an action handler defined.',
				{
					command: this.name,
					hint: 'Each command can only have one action handler.',
				},
			);
		}

		this.handler = callback;
		return this;
	}

	/**
	 * Generates the help output for the command.
	 *
	 * @param commandPath - Full command path used to render the usage line.
	 */
	public help(commandPath: string[] = [this.name ?? '<command>']): string {
		const lines: string[] = [];

		// Command description
		if (this.commandDescription) {
			lines.push(this.commandDescription);
			lines.push('');
		}

		// Usage section
		lines.push(color.bold('Usage:'));
		lines.push(`  ${[...commandPath, this.usage()].join(' ')}`);
		lines.push('');

		/**
		 * Helper to render aligned sections with two columns.
		 */
		const printSection = (
			header: string,
			items: { left: string; right: string }[],
		) => {
			if (items.length === 0) return;

			lines.push(color.bold(`${header}:`));

			const maxLeftWidth = items.reduce(
				(max, item) => Math.max(max, stripAnsi(item.left).length),
				0,
			);

			for (const item of items) {
				const currentLength = stripAnsi(item.left).length;
				const padding = ' '.repeat(maxLeftWidth - currentLength + 4);
				lines.push(`  ${item.left}${padding}${item.right}`);
			}
			lines.push('');
		};

		// Arguments section
		const argsList = [...this.argumentsDef].map(([name, arg]) => {
			const typeLabel = arg.type ? `<${arg.type}>` : '';

			let left: string;
			if (arg.optional) {
				left = color.yellow(`${name} ${color.dim(typeLabel)}`);
			} else {
				left = `${color.green(name)} ${color.yellow(typeLabel)}`;
			}

			const parts = [];
			if (arg.description) parts.push(color.dim(arg.description));
			if (arg.optional) parts.push(color.blue('[optional]'));
			if (arg.defaultValue !== undefined) {
				parts.push(color.dim(`[default: ${arg.defaultValue}]`));
			}

			return { left, right: parts.join(' ') };
		});

		printSection('Arguments', argsList);

		// Options section
		const optsList = [...this.optionsDef].map(([name, opt]) => {
			const short = opt.alias?.length
				? `${opt.alias.map((a) => color.cyan(`-${a}`)).join(', ')}, `
				: '    ';

			const long = color.cyan(`--${name}`);
			const valueHint =
				opt.type !== 'boolean' ? ` ${color.yellow(`<${opt.type}>`)}` : '';

			const left = `${short}${long}${valueHint}`;

			const parts = [];
			if (opt.description) parts.push(color.dim(opt.description));
			if (opt.optional) parts.push(color.blue('[optional]'));
			if (opt.defaultValue !== undefined) {
				parts.push(color.dim(`[default: ${opt.defaultValue}]`));
			}

			return { left, right: parts.join(' ') };
		});

		printSection('Options', optsList);

		// Sub-commands section
		const cmdList = [...this.commands].map(([name, cmd]) => {
			const aliases =
				cmd.aliases.size > 0
					? color.dim(`(${[...cmd.aliases].join(', ')})`)
					: '';

			return {
				left: `${color.magenta(name)} ${aliases}`,
				right: cmd.commandDescription ? color.dim(cmd.commandDescription) : '',
			};
		});

		printSection('Commands', cmdList);

		return lines.join('\n').trimEnd();
	}

	/**
	 * Builds the usage string for the command.
	 *
	 * Includes positional arguments and a generic options placeholder.
	 */
	private usage(): string {
		const args = [...this.argumentsDef.entries()].map(([name, arg]) =>
			arg.optional
				? color.dim(color.yellow(`[${name}]`))
				: color.green(`<${name}>`),
		);

		const opts = this.optionsDef.size > 0 ? color.dim('...options') : '';

		return [...args, opts].filter(Boolean).join(' ');
	}
}
