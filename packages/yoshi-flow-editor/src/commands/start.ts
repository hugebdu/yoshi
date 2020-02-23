import path from 'path';
import arg from 'arg';
import fs from 'fs-extra';
import chalk from 'chalk';
import DevEnvironment from 'yoshi-common/build/dev-environment';
import { TARGET_DIR, BUILD_DIR } from 'yoshi-config/build/paths';
import { cliCommand } from '../cli';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
} from '../webpack.config';
import {
  buildEditorPlatformEntries,
  buildViewerScriptEntry,
  webWorkerExternals,
} from '../buildEditorEntires';

const join = (...dirs: Array<string>) => path.join(process.cwd(), ...dirs);

const start: cliCommand = async function(argv, config, model) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--server': String,
      '--url': String,
      '--production': Boolean,
      '--debug': Boolean,
      '--debug-brk': Boolean,
    },
    { argv },
  );

  const {
    '--help': help,
    '--url': url,
    '--production': shouldRunAsProduction,
  } = args;

  if (help) {
    console.log(
      `
      Description
        Starts the application in development mode

      Usage
        $ yoshi-app start

      Options
        --help, -h      Displays this message
        --url           Opens the browser with the supplied URL
        --production    Start using unminified production build
        --debug         Allow app-server debugging
        --debug-brk     Allow app-server debugging, process won't start until debugger will be attached
    `,
    );

    process.exit(0);
  }

  console.log(chalk.cyan('Starting development environment...\n'));

  if (shouldRunAsProduction) {
    process.env.BABEL_ENV = 'production';
    process.env.NODE_ENV = 'production';
  }

  await Promise.all([
    fs.emptyDir(join(BUILD_DIR)),
    fs.emptyDir(join(TARGET_DIR)),
  ]);

  const clientConfig = createClientWebpackConfig(config, {
    isDev: true,
    isHot: config.hmr as boolean,
    customEntry: buildEditorPlatformEntries(model),
  });

  const serverConfig = createServerWebpackConfig(config, {
    isDev: true,
    isHot: true,
  });

  const webWorkerConfig = createWebWorkerWebpackConfig(config, {
    isDev: true,
    isHot: true,
    customEntry: buildViewerScriptEntry(model),
    webWorkerExternals,
  });

  const devEnvironment = await DevEnvironment.create({
    webpackConfigs: [clientConfig, serverConfig, webWorkerConfig],
    https: config.servers.cdn.ssl,
    webpackDevServerPort: config.servers.cdn.port,
    appName: config.name,
    serverFilePath: require.resolve('yoshi-flow-editor/build/server/server.js'),
    startUrl: url ||
      config.startUrl || [
        `https://localhost:3000/editor/todo`,
        'https://localhost:3000/settings/todo',
      ],
    enableClientHotUpdates: Boolean(config.hmr),
    createEjsTemplates: config.experimentalBuildHtml,
  });

  await devEnvironment.start();
};

export default start;
