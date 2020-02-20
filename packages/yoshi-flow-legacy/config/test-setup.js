Object.assign(process.env, {
  NODE_ENV: 'test',
  SRC_PATH: './src',
});

const path = require('path');
const { tryRequire } = require('yoshi-helpers/utils');
const { setupRequireHooks } = require('yoshi-common/build/require-hooks');
const { isTypescriptProject } = require('yoshi-helpers/build/queries');
const projectConfig = require('yoshi-config');
const { addHook } = require('pirates');
const { transform } = require('yoshi-server-tools/build/utils');

const ext = isTypescriptProject() && !process.env.IN_WALLABY ? 'ts' : 'js';
const mochaSetupPath = path.join(process.cwd(), 'test', `mocha-setup.${ext}`);
const setupPath = path.join(process.cwd(), 'test', `setup.${ext}`);

if (projectConfig.yoshiServer) {
  addHook(transform, {
    exts: ['.js'],
    matcher: filename => filename.endsWith('.api.js'),
  });
}

if (!process.env.IN_WALLABY) {
  setupRequireHooks();
}

require('../src/ignore-extensions');

tryRequire(mochaSetupPath);
tryRequire(setupPath);
