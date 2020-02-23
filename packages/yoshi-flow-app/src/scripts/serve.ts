import path from 'path';
import fs from 'fs';
import arg from 'arg';
import chalk from 'chalk';
import { clearConsole } from 'yoshi-helpers/build/utils';
import { ServerProcess } from 'yoshi-common/build/server-process';
import { startCDN } from 'yoshi-common/build/cdn';
import { getServerStartFile } from 'yoshi-helpers/build/server-start-file';
import { serverStartFileParser } from 'yoshi-helpers/build/server-start-file-parser';
import { STATICS_DIR } from 'yoshi-config/build/paths';
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
  const serverFilePath =
    serverStartFileParser(packageJSON) ?? getServerStartFile(); // TODO use getServerEntry() call from another PR

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
    `,
    );

    process.exit(0);
  }

  if (!fs.existsSync(STATICS_DIR) || fs.readdirSync(STATICS_DIR).length === 0) {
    console.error(
      chalk.red(`Warning:
  You are running yoshi serve but your statics directory is empty.
  You probably need to run ${chalk.bold(
    'npx yoshi build',
  )} before running the serve command`),
    );

    process.exit(1);
  }

  console.log(chalk.cyan('Starting the production environment...\n'));

  const serverProcess = new ServerProcess({
    serverFilePath,
    appName: config.name,
  });

  await Promise.all([serverProcess.initialize(), startCDN(config)]);

  clearConsole();

  console.log(
    chalk.cyan(
      `Your server is starting and should be accessible from your browser.\nYour production bundles and other static assets are served from ${config.servers.cdn.url}.`,
    ),
  );
};

export default serve;
