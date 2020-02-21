import viewerScriptEntry from '../ViewerScriptEntry';

describe('ViewerScriptEntry template', () => {
  it('generates correct template with single controller', () => {
    const generateControllerEntryContent = viewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/button/controller.ts',
          id: '123',
        },
      ],
      initAppPath: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });

  it('generates correct template with multiple controllers', () => {
    const generateControllerEntryContent = viewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/todo/controller.ts',
          id: '123',
        },
        {
          controllerFileName: 'project/src/components/todo/controller.ts',
          id: '567',
        },
      ],
      initAppPath: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });

  it('generates correct template w/o controllers', () => {
    const generateControllerEntryContent = viewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [],
      initAppPath: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });
});
