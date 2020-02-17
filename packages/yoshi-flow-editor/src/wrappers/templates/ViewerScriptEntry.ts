import t from './template';

export type TemplateControllerConfig = {
  id: string | null;
  controllerFileName: string;
};

type Opts = {
  viewerScriptWrapperPath: string;
  initAppPath: string;
  controllersMeta: Array<TemplateControllerConfig>;
};

const getControllerVariableName = (index: number) => `controller${index}`;

const importsForControllers = t<{
  controllersMeta: Array<TemplateControllerConfig>;
}>`
  ${({ controllersMeta }) => {
    return controllersMeta
      .map((controller, i) => {
        return `import ${getControllerVariableName(i)} from '${
          controller.controllerFileName
        }';`;
      })
      .join('\n');
  }}
`;

const controllerConfigs = t<{
  controllersMeta: Array<TemplateControllerConfig>;
}>`${({ controllersMeta }) =>
  controllersMeta
    .map(
      (controller, i) =>
        `{ method: ${getControllerVariableName(i)}, id: ${
          controller.id ? `"${controller.id}"` : controller.id
        } }`,
    )
    .join(', ')}`;

export default t<Opts>`
  import {createControllersWithDescriptors, initAppForPage as initAppForPageWrapper} from '${({
    viewerScriptWrapperPath,
  }) => viewerScriptWrapperPath}';

  import userInitApp from '${({ initAppPath }) => initAppPath}';
  ${({ controllersMeta }) => importsForControllers({ controllersMeta })}

  export const initAppForPage = initAppForPageWrapper;
  export const createControllers = createControllersWithDescriptors([${({
    controllersMeta,
  }) => controllerConfigs({ controllersMeta })}], userInitApp);
`;
