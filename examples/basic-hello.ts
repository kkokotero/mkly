import { CLI } from 'mkly';

const cli = new CLI('greeter', '1.0.0');

cli
	.command('greet')
	.description('Greets a person')
	.argument('name', { type: 'string' })
	.argument('age', { type: 'number' })
	.action((args) => {
		console.log(`Hello ${args.name}, you are ${args.age} years old`);
	});

// cli.run(); // Use this line to run with default process arguments (Automatically uses parsing from process.argv by default)
cli.run(process.argv.slice(2));
