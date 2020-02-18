import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import arg from 'arg';
import chalk from 'chalk';
import openBrowser from 'yoshi-common/build/open-browser';
import normalizeDebuggingArgs from 'yoshi-common/build/normalize-debugging-args';
import ServerProcess from 'yoshi-common/build/server-process';
import serveHandler from 'serve-handler';
import { getUrl as getTunnelUrl } from 'yoshi-common/build/utils/suricate';
import { Config } from 'yoshi-config/build/config';
import { cliCommand } from '../bin/yoshi-app';

async function startCdn(config: Config) {
  const port = config.servers.cdn.port;
  const isSsl = config.servers.cdn.ssl;
  const staticsDir = path.resolve(process.cwd(), 'dist', 'statics');

  const server = isSsl ? httpsCdn() : httpCdn();
  await new Promise(resolve => server.listen(port, resolve));

  return { kill: () => server.close() };

  function serverFn(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    serveHandler(req, res, { public: staticsDir });
  }

  function httpCdn() {
    console.log(`running http cdn`);
    const http = require('http');
    return http.createServer(serverFn);
  }

  function httpsCdn() {
    // const https = require('https');
    // const paths = getCdnCertificatePaths();
    // const cert = fs.readFileSync(paths.cert, 'utf8');
    // const key = fs.readFileSync(paths.key, 'utf8');
    // const passphrase = '1234';
    // return https.createServer({ cert, key, passphrase }, serverFn);
  }
}

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

  console.log(chalk.cyan('Starting the envinronment...\n'));

  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';

  normalizeDebuggingArgs();

  const serverProcess = await ServerProcess.create({
    serverFilePath,
    suricate: config.suricate,
    appName: config.name,
  });

  await serverProcess.initialize();

  await startCdn(config);

  const actualStartUrl = config.suricate
    ? getTunnelUrl(config.name)
    : url || 'http://localhost:3000';

  openBrowser(actualStartUrl);
};

export default serve;
