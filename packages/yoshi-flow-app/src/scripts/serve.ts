import arg from 'arg';
import chalk from 'chalk';
import openBrowser from 'yoshi-common/build/open-browser';
import normalizeDebuggingArgs from 'yoshi-common/build/normalize-debugging-args';
import ServerProcess from 'yoshi-common/build/server-process';
import { startCDN } from 'yoshi-common/build/cdn';
import { getUrl as getTunnelUrl } from 'yoshi-common/build/utils/suricate';
import { cliCommand } from '../bin/yoshi-app';

const serve: cliCommand = async function(argv, config) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--debug': Boolean,
      '--debug-brk': Boolean,
      '--url': String,
    },
    { argv },
  );

  const { '--help': help, '--url': url } = args;

  const serverFilePath = 'index-dev.js'; // TODO parse start script

  if (help) {
    console.log(
      `
      Description
        Starts the application in production mode

      Usage
        $ yoshi-app serve 

      Options
        --help, -h      Displays this message
        --debug         Allow app-server debugging
        --debug-brk     Allow app-server debugging, process won't start until debugger will be attached
        --url           Opens the browser with the supplied URL
    `,
    );

    process.exit(0);
  }

  console.log(chalk.cyan('Starting the environment...\n'));

  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';

  normalizeDebuggingArgs();

  const serverProcess = await ServerProcess.create({
    serverFilePath,
    suricate: config.suricate,
    appName: config.name,
  });

  await Promise.all([serverProcess.initialize(), startCDN(config)]);

  const actualStartUrl = config.suricate
    ? getTunnelUrl(config.name)
    : url || 'http://localhost:3000';

  openBrowser(actualStartUrl);
};

export default serve;
