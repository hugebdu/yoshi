import path from 'path';
import fs from 'fs';
import arg from 'arg';
import chalk from 'chalk';
import ServerProcess from 'yoshi-common/build/server-process';
import { startCDN } from 'yoshi-common/build/cdn';
import { serverStartFileParser } from 'yoshi-helpers/build/server-start-file-parser';
import { cliCommand } from '../bin/yoshi-app';

const serve: cliCommand = async function(argv, config) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--debug': Boolean,
      '--debug-brk': Boolean,
    },
    { argv },
  );

  const { '--help': help } = args;

  const packageJSON = require(path.resolve(process.cwd(), 'package.json'));
  const serverFilePath = serverStartFileParser(packageJSON) ?? 'index.js'; // TODO use getServerEntry() call from another PR

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

  try {
    const staticsExist = fs.readdirSync(config.clientFilesPath);
    if (staticsExist.length === 0) {
      throw new Error('Empty statics');
    }
  } catch (e) {
    console.log(
      chalk.red(
        `${config.clientFilesPath} is missing. Run \`yoshi build\` and try again.`,
      ),
    );

    process.exit(1);
  }

  console.log(chalk.cyan('Starting the production environment...\n'));

  const serverProcess = await ServerProcess.create({
    serverFilePath,
    suricate: config.suricate,
    appName: config.name,
  });

  await Promise.all([serverProcess.initialize(), startCDN(config)]);

  // TODO write a console output here
};

export default serve;
