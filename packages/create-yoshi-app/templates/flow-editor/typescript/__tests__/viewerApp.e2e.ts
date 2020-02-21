import { viewerUrl } from '../dev/sites';

describe('Viewer App', () => {
  it('should display the title text', async () => {
    await page.goto(viewerUrl);
    await page.waitForSelector('button');

    expect(await page.$eval('button', e => e.textContent)).toEqual('click me');
  });
});
