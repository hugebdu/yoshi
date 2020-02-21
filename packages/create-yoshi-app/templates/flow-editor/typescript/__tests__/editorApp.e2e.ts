describe('Editor App', () => {
  it('should display add todo on submit button', async () => {
    await page.goto('https://localhost:3100/editor/todo');
    await page.waitForSelector('button');

    expect(await page.$eval('button', e => e.textContent)).toEqual('click me');
  });
});
