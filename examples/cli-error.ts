import { CLI } from 'mkly';

const cli = new CLI('options-cli', '1.0.0');

cli
  .command('build')
  .description('Builds the project')
  .option('minify')
  .option('minify') // Duplicate option to trigger an error
  .action((_, opts) => {
    console.log('Options:', opts);
  });

cli.run();
