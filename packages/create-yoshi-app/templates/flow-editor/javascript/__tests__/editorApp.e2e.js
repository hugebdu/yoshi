describe('Editor App', () => {
  it('should display button text', async () => {
    await page.goto('https://localhost:3100/editor/button');
    await page.waitForSelector('button');

    expect(await page.$eval('button', e => e.textContent)).toEqual('click me');
  });
});
