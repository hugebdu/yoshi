process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

import path from 'path';
import fs from 'fs';
import loadConfig from 'yoshi-config/loadConfig';
import { ServerProcess } from 'yoshi-common/build/server-process';
import { startCDN } from 'yoshi-common/build/cdn';
import { getServerStartFile } from 'yoshi-helpers/build/server-start-file';
import { serverStartFileParser } from 'yoshi-helpers/build/server-start-file-parser';
import { STATICS_DIR } from 'yoshi-config/build/paths';

const serve = async function() {
  return new Promise(async (resolve, reject) => {
    const config = loadConfig();

    const packageJSON = require(path.resolve(process.cwd(), 'package.json'));
    const serverFilePath =
      serverStartFileParser(packageJSON) ?? getServerStartFile();

    if (
      !fs.existsSync(STATICS_DIR) ||
      fs.readdirSync(STATICS_DIR).length === 0
    ) {
      reject(
        `Warning: You are running yoshi serve but your statics directory is empty. You probably need to run npx yoshi build before running the serve command`,
      );
      return;
    }

    const serverProcess = new ServerProcess({
      serverFilePath,
      appName: config.name,
    });

    const servers = await Promise.all([
      serverProcess.initialize(),
      startCDN(config),
    ]);

    resolve(() => {
      return Promise.all([
        serverProcess.close(),
        new Promise(resolve => servers[1].close(resolve)),
      ]);
    });
  });
};

export default serve;
