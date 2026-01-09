import { CLI } from 'mkly';

const cli = new CLI('vite-like', '0.1.0');

cli
	.command('init')
	.description('Initialize a project')
	.option('template', {
		type: 'string',
		defaultValue: 'basic',
	})
	.action((_, opts) => {
		console.log(`Initializing project with template: ${opts.template}`);
	});

cli
	.command('build')
	.description('Build the project')
	.option('watch', { type: 'boolean', defaultValue: false })
	.option('minify', { type: 'boolean', defaultValue: true })
	.action((_, opts) => {
		console.log('Building with options:', opts);
	});

cli
	.command('dev')
	.description('Start dev server')
	.option('port', { type: 'number', defaultValue: 3000 })
	.action((_, opts) => {
		console.log(`Dev server running on port ${opts.port}`);
	});

cli.run();
