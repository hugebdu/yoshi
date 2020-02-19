import Scripts from '../../../scripts';

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
  projectType: 'javascript',
});

describe('Yoshi, serve', () => {
  it('should notify is yoshi build was not run', async () => {});

  it('should return prod build when running yoshi serve', async () => {
    await scripts.build();
    await scripts.serve(async () => {
      await page.goto(scripts.serverUrl);

      const result = await page.$eval('#node-env', elm => elm.textContent);

      expect(result).toEqual('production');
    });
  });
});
