import t from './template';

type Opts = Record<
  | 'editorAppWrapperPath'
  | 'componentFileName'
  | 'controllerFileName'
  | 'initAppPath',
  string
>;

export default t<Opts>`
    import React from 'react';
    import ReactDOM from 'react-dom';
    import EditorAppWrapper from '${({ editorAppWrapperPath }) =>
      editorAppWrapperPath}';

    import Component from '${({ editorAppWrapperPath }) =>
      editorAppWrapperPath}';
    import createController from '${({ controllerFileName }) =>
      controllerFileName}';
    import initApp from '${({ initAppPath }) => initAppPath}';

    const EditorApp = EditorAppWrapper(Component, createController, initApp);

    ReactDOM.render(React.createElement(EditorApp, null), document.getElementById('root'));
`;
