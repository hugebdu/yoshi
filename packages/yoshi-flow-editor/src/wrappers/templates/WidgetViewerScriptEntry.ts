import t from './template';

type Opts = Record<
  'viewerScriptWrapperPath' | 'controllerFileName' | 'initAppPath',
  string
>;

export default t<Opts>`
  import {createControllers as createControllersWrapper, initAppForPage as initAppForPageWrapper} from '${({
    viewerScriptWrapperPath,
  }) => viewerScriptWrapperPath}';
  import userController from '${({ controllerFileName }) =>
    controllerFileName}';
  import userInitApp from '${({ initAppPath }) => initAppPath}';

  export const initAppForPage = initAppForPageWrapper;
  export const createControllers = createControllersWrapper(userController, userInitApp);
`;
