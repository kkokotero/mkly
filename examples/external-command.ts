import { CLI, Command } from 'mkly';

const cli = new CLI('git-like', '1.0.0');

const remote = cli.command('remote').description('Manage remotes');

const add = new Command('add')
	.argument('name', { type: 'string' })
	.argument('url', { type: 'string' })
	.action((args) => {
		console.log(`Remote ${args.name} added at ${args.url}`);
	});

const remove = new Command()
  .argument('name', { type: 'string' })
  .action((args) => {
    console.log(`Remote ${args.name} removed`);
  });

remote.command('remove', remove);
remote.command('add', add);

cli.run();
