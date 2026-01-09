import color from 'mauw/colors';
import { Command } from './command';
import {
	coerceArgument,
	coerceOption,
	normalizeArguments,
	parseToken,
} from './parser';
import { CommandError } from './exceptions/command-error';

/**
 * Main CLI entry point.
 * Extends Command so the root CLI can behave like any other command,
 * including having subcommands, arguments, and options.
 */
export class CLI extends Command {
	constructor(
		name = '',
		private _version = '0.0.0',
	) {
		super(name);
	}

	/**
	 * Sets the CLI version.
	 * This value is shown when using --version or -v.
	 */
	public version(version: string): this {
		this._version = version;
		return this;
	}

	/**
	 * Runs the CLI using the provided argv array.
	 * If no argv is provided, it normalizes process.argv.
	 */
	public run(argv: string[] = normalizeArguments(process.argv)) {
		try {
			// Start from the root command (the CLI itself)
			let command: Command<any, any> = this;
			const tokens = argv.slice();

			/** 1. Resolve subcommands
			 * Iteratively consume tokens while matching registered subcommands.
			 * The deepest matching command becomes the active command.
			 */
			while (tokens.length > 0) {
				const next = tokens[0] ?? '';
				const sub = command.commands.get(next);
				if (!sub) break;

				tokens.shift();
				command = sub;
			}

			/** 2. Initialize data structures */
			const args: Record<string, any> = {};
			const options: Record<string, any> = {};

			// Positional argument definitions in order
			const positionalDefs = [...command.argumentsDef.entries()];
			let positionalIndex = 0;

			// Indicates whether "--" has been encountered
			let endOfFlags = false;

			/** 3. Process tokens */
			for (let i = 0; i < tokens.length; i++) {
				const raw = tokens[i] ?? '';
				const parsed = parseToken(raw);

				// Handle version flag
				if (parsed.key === 'version' || parsed.key === 'v') {
					console.log(color.green(`${command.name} v${this._version}`));
					process.exit(0);
				}

				// Handle help flag
				if (parsed.key === 'help' || parsed.key === 'h') {
					console.log(command.help());
					process.exit(0);
				}

				// End-of-flags marker ("--")
				if (parsed.isEndOfFlags) {
					endOfFlags = true;
					continue;
				}

				const hasPendingPositionals = positionalIndex < positionalDefs.length;

				/** ───── POSITIONAL ARGUMENT (strict validation) ───── */
				if (hasPendingPositionals) {
					const def = positionalDefs[positionalIndex];
					if (!def) {
						throw new CommandError(`Unexpected argument: ${raw}`, {
							command: command.name,
							argument: raw,
							hint: 'No more positional arguments are defined for this command.',
						});
					}

					const [name, arg] = def ?? ['', { type: 'string' }];

					// Token looks like an option
					if (parsed.isFlag && !endOfFlags) {
						// Required positional argument -> ERROR
						if (!arg.optional && arg.defaultValue === undefined) {
							throw new CommandError(
								`Expected argument <${name}>, but received option "${parsed.original}"`,
								{
									command: command.name,
									option: parsed.original,
									hint: 'This is a positional argument, not an option.',
								},
							);
						}
						// Optional positional argument -> do not consume,
						// allow it to be processed as an option
					} else {
						// Consume positional argument
						args[name] = coerceArgument(arg, raw, arg.choices);
						positionalIndex++;
						continue;
					}
				}

				/** ───── OPTION ───── */
				if (parsed.isFlag && !endOfFlags) {
          if (command.optionsDef.size === 0) {
            throw new CommandError(`Unknown option: ${parsed.original}`, {
              command: command.name,
              option: parsed.original?.replace(/^--?/, ''),
              hint: 'This command does not accept any options.',
            });
          }

          // Lookup option definition
					let opt = command.optionsDef.get(parsed.key ?? '') || undefined;

					if (!opt) {
						// Check for aliases
						for (const [name, optionDef] of command.optionsDef) {
							if (optionDef.alias?.includes(parsed.key ?? '')) {
								opt = optionDef;
								parsed.key = name; // Update key to the main option name
								break;
							}
						}
					}

					if (!opt) {
						throw new CommandError(`Unknown option: ${parsed.original}`, {
							command: command.name,
							option: parsed.original?.replace(/^--?/, ''),
							hint: 'This option is not defined for this command.',
						});
					}

					// Boolean option
					if (opt.type === 'boolean') {
						options[parsed.key ?? ''] =
							parsed.value !== undefined ? parsed.value : !parsed.isNegation;
						continue;
					}

					// Inline value (--key=value, -a=1, -a1)
					if (parsed.value !== undefined) {
						options[parsed.key ?? ''] = coerceOption(opt, parsed.value, opt.choices);
						continue;
					}

					// Value in the next token
					const next = tokens[i + 1];
					if (!next) {
						throw new CommandError(`Option "--${parsed.key}" expects a value`, {
							command: command.name,
							option: parsed.original,
							expected: command.optionsDef.get(parsed.key ?? '')?.type,
							hint: 'This option requires a value.',
						});
					}

					options[parsed.key ?? ''] = coerceOption(opt, next);
					i++;
					continue;
				}

        if (command.argumentsDef.size === 0) {
          throw new CommandError(`Unexpected argument: ${raw}`, {
            command: command.name,
            argument: raw,
            hint: 'This command does not accept positional arguments.',
          });
        }

				/** ───── LEFTOVER TOKEN ───── */
				throw new CommandError(`Unexpected argument: ${raw}`, {
					command: command.name,
					argument: raw,
					hint: 'No more positional arguments are defined for this command.',
				});
			}

			/** 4. Apply default values for arguments */
			for (const [name, arg] of command.argumentsDef) {
				if (args[name] === undefined && arg.defaultValue !== undefined) {
					args[name] = coerceArgument(arg.type, arg.defaultValue);
				}
			}

			/** 5. Apply default values for options */
			for (const [name, opt] of command.optionsDef) {
				if (options[name] === undefined && opt.defaultValue !== undefined) {
					options[name] = coerceOption(opt.type, opt.defaultValue);
				}
			}

			/** 6. Validate required arguments */
			for (const [name, arg] of command.argumentsDef) {
				const required = !arg.optional && arg.defaultValue === undefined;
				if (required && args[name] === undefined) {
					throw new CommandError(`Missing required argument: <${name}>`, {
						command: command.name,
						argument: name,
						hint: 'This argument is required.',
					});
				}
			}

			/** 7. Execute command handler */
			if (!command.handler) {
				console.log(command.help());
				return;
			}
			try {
				return command.handler(args, options);
			} catch (e) {
				// Mark errors thrown from the action itself
				(e as any).fromAction = true;
				throw e;
			}
		} catch (e) {
			// Re-throw errors from user actions unless explicitly marked as internal
			if ((e as any).fromAction && (e as any).fromKLY !== true) throw e;

			const error = e as CommandError;
			console.log(error.message);
			process.exit(1);
		}
	}
}
