import t from '../template';

describe('template', () => {
  it('generated primitive templates w/o params', () => {
    const generateTemplate = t<{}>`
      const a = 1
    `;
    expect(generateTemplate({}).trim()).toBe('const a = 1');
  });

  it('generated primitive templates with params', () => {
    const generateTemplate = t<{ name: string }>`
      const name = ${({ name }) => name}
    `;
    expect(generateTemplate({ name: 'artem' }).trim()).toBe(
      'const name = artem',
    );
  });
});
