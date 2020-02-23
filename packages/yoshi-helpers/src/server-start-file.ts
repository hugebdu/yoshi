import chalk from 'chalk';
import { existsSync, isTypescriptProject } from './queries';

const serverStartFileOrder = [
  'dev/server.ts',
  'dev/server.js',
  'index-dev.ts',
  'index-dev.js',
  'index.ts',
  'index.js',
];

export const getServerStartFile = (serverStartFileFromCLI?: string) => {
  const extension = isTypescriptProject() ? 'ts' : 'js';

  if (serverStartFileFromCLI) {
    console.log(
      chalk.yellow(
        `Deprecation warning: --server and --entry-point is going to be removed in Yoshi v5.
Please remove the flags and use these default entry points: 
  - fullstack: index-dev.${extension}
  - client:    dev/server.${extension}`,
      ),
    );
    return serverStartFileFromCLI;
  }

  const serverStartFile = serverStartFileOrder.find(file => existsSync(file));

  if (!serverStartFile) {
    throw new Error(
      `Entry point is missing! Please create the entry point:
  - fullstack: index-dev.${extension}
  - client:    dev/server.${extension}`,
    );
  }

  if (serverStartFile.split('.')[0] === 'index') {
    console.log(
      chalk.yellow(
        `Deprecation warning: ${serverStartFile} is not going to be started automatically in Yoshi v5. Please create the entry poiont:
  - fullstack: index-dev.${extension}
  - client:    dev/server.${extension}`,
      ),
    );
  }

  return serverStartFile;
};
