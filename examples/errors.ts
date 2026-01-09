import { CLI } from 'mkly';

const cli = new CLI('math', '1.0.0');

cli
	.command('divide')
	.argument('a', { type: 'number' })
	.argument('b', { type: 'number' })
	.action((args) => {
		if (args.b === 0) {
			throw new Error('Division by zero is not allowed');
		}

		console.log(args.a / args.b);
	});

cli.run();
