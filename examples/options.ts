import { CLI } from 'mkly';

const cli = new CLI('options-cli', '1.0.0');

cli
	.command('build')
	.description('Builds the project')
	.option('minify', {
		type: 'boolean',
		alias: ['m', 'min'],
		defaultValue: false,
	})
	.option('target', {
		type: 'number',
		defaultValue: 18,
	})
	.action((_, opts) => {
		console.log('Options:', opts);
	});

cli.run();
