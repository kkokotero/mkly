import { CLI } from 'mkly';

const cli = new CLI('git-like', '1.0.0');

const remote = cli.command('remote').description('Manage remotes');

remote
	.command('add')
	.argument('name', { type: 'string' })
	.argument('url', { type: 'string' })
	.action((args) => {
		console.log(`Remote ${args.name} added at ${args.url}`);
	});

cli.run();
