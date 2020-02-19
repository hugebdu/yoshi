import path from 'path';
import arg from 'arg';
import bfj from 'bfj';
import { runWebpack } from 'yoshi-common/build/webpack-utils';
import {
  printBuildResult,
  printBundleSizeSuggestion,
} from 'yoshi-common/build/print-build-results';
import { copyTemplates } from 'yoshi-common/build/copy-assets';
import { BUILD_DIR, TARGET_DIR, STATS_FILE } from 'yoshi-config/build/paths';
import { inTeamCity, isWebWorkerBundle } from 'yoshi-helpers/build/queries';
import * as telemetry from 'yoshi-common/build/telemetry';
import fs from 'fs-extra';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
} from '../webpack.config';
import { cliCommand } from '../bin/yoshi-app';

const join = (...dirs: Array<string>) => path.join(process.cwd(), ...dirs);

const build: cliCommand = async function(argv, config) {
  await telemetry.buildStart(config);

  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--analyze': Boolean,
      '--stats': Boolean,
      '--source-map': Boolean,

      // Aliases
      '-h': '--help',
    },
    { argv },
  );

  const {
    '--help': help,
    '--analyze': isAnalyze,
    '--stats': shouldEmitWebpackStats,
    '--source-map': forceEmitSourceMaps,
  } = args;

  if (help) {
    console.log(
      `
      Description
        Compiles the application for production deployment

      Usage
        $ yoshi-app build

      Options
        --help, -h      Displays this message
        --analyze       Run webpack-bundle-analyzer
        --stats         Emit webpack's stats file on "target/webpack-stats.json"
        --source-map    Emit bundle source maps
    `,
    );

    process.exit(0);
  }

  await Promise.all([
    fs.emptyDir(join(BUILD_DIR)),
    fs.emptyDir(join(TARGET_DIR)),
  ]);

  await copyTemplates();

  if (inTeamCity()) {
    const petriSpecs = await import('yoshi-common/build/sync-petri-specs');
    const wixMavenStatics = await import('yoshi-common/build/maven-statics');

    await Promise.all([
      petriSpecs.default({
        config: config.petriSpecsConfig,
      }),
      wixMavenStatics.default({
        clientProjectName: config.clientProjectName,
        staticsDir: config.clientFilesPath,
      }),
    ]);
  }

  const clientDebugConfig = createClientWebpackConfig(config, {
    isDev: true,
    forceEmitSourceMaps,
  });

  const clientOptimizedConfig = createClientWebpackConfig(config, {
    isAnalyze,
    forceEmitSourceMaps,
  });

  const serverConfig = createServerWebpackConfig(config, {
    isDev: true,
  });

  let webWorkerConfig;
  let webWorkerOptimizeConfig;

  if (isWebWorkerBundle) {
    webWorkerConfig = createWebWorkerWebpackConfig(config, {
      isDev: true,
    });

    webWorkerOptimizeConfig = createWebWorkerWebpackConfig(config);
  }

  const { stats } = await runWebpack([
    clientDebugConfig,
    clientOptimizedConfig,
    serverConfig,
    webWorkerConfig,
    webWorkerOptimizeConfig,
  ]);

  const [, clientOptimizedStats, serverStats] = stats;

  if (shouldEmitWebpackStats) {
    const statsFilePath = join(STATS_FILE);

    fs.ensureDirSync(path.dirname(statsFilePath));
    await bfj.write(statsFilePath, clientOptimizedStats.toJson());
  }

  printBuildResult({ webpackStats: [clientOptimizedStats, serverStats] });
  printBundleSizeSuggestion();
};

export default build;
