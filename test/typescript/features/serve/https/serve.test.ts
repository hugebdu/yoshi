import { launch } from 'puppeteer';

import Scripts from '../../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'typescript',
});

describe('Yoshi serve https', () => {
  it('should return prod build when running yoshi serve', async () => {
    await scripts.build();

    await scripts.serve(async () => {
      const browser = await launch({ ignoreHTTPSErrors: true });

      const page = await browser.newPage();
      await page.goto(scripts.serverUrl);

      const result = await page.$eval('#node-env', elm => elm.textContent);
      expect(result).toEqual('production');

      await browser.close();
    });
  });
});
