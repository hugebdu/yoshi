import { IWidgetControllerConfig } from '@wix/native-components-infra/dist/es/src/types/types';
import { createInstances, objectPromiseAll, fetchFrameworkData } from './utils';

let frameworkData: any;

type ControllerDescriptor = {
  id: string | null;
  method: Function;
};

const getFirstDescriptor = (descriptors: Array<ControllerDescriptor>) => {
  if (descriptors.length === 1) {
    return descriptors[0];
  }
};

const getDescriptorForConfig = (
  type: string,
  descriptors: Array<ControllerDescriptor>,
) => {
  return (
    descriptors.find(descriptor => descriptor.id === type) ||
    getFirstDescriptor(descriptors)
  );
};

export const createControllers = (
  createController: Function,
  initApp: Function,
) => {
  return createControllersWithDescriptors(
    [
      {
        method: createController,
        id: null,
      },
    ],
    initApp,
  );
};

export const createControllersWithDescriptors = (
  controllerDescriptors: Array<ControllerDescriptor>,
  initApp: Function,
) => (controllerConfigs: Array<IWidgetControllerConfig>) => {
  const wrappedControllers = controllerConfigs.map(controllerConfig => {
    // [Platform surprise] `type` here, is a widgetId. :(
    const { appParams, platformAPIs, wixCodeApi, type } = controllerConfig;
    const conrollerDescriptor:
      | ControllerDescriptor
      | undefined = getDescriptorForConfig(type, controllerDescriptors);

    if (!conrollerDescriptor) {
      throw new Error(`Desctiptor for widgetId: ${controllerConfig.type} was not found. Please create a .component.json file for current widget`);
    }

    initializeExperiments();

    const appData = initApp({
      controllerConfigs,
      frameworkData,
      appParams,
      platformAPIs,
      wixCodeApi,
    });

    const { setProps } = controllerConfig;

    const setState = (newState: any) => {
      const updatedState = {
        ...context.state,
        ...newState,
      };

      // Track state
      context.state = updatedState;

      // Run state change callback
      wrappedController.then((userController: any) => {
        if (userController.stateChange) {
          userController.stateChange();
        }
      });

      // Update render cycle
      return setProps({ state: updatedState });
    };

    const context = {
      state: {},
      setState,
    };

    const userControllerPromise = conrollerDescriptor.method.call(context, {
      controllerConfig,
      frameworkData,
      appData,
    });

    const wrappedController = Promise.resolve(userControllerPromise).then(
      (userController: any) => {
        return {
          ...userController,
          pageReady: async (...args: Array<any>) => {
            const awaitedFrameworkData = await objectPromiseAll(frameworkData);

            // TODO: export by property (methods, state) so we won't have conflicting props
            setProps({
              __publicData__: controllerConfig.config.publicData,
              ...awaitedFrameworkData,
              // Set initial state
              state: context.state,
              // Set methods
              methods: userController.methods,
            });

            // Optional `pageReady`
            if (userController.pageReady) {
              return userController.pageReady(setProps, ...args);
            }
          },
          exports: userController.corvid,
        };
      },
    );
    return wrappedController;
  });

  return wrappedControllers;
};

const initializeExperiments = () => {
  frameworkData = fetchFrameworkData();

  // TODO: Generalize
  frameworkData.experimentsPromise = frameworkData.experimentsPromise.then(
    (experiments: any) => createInstances({ experiments }),
  );
};

export const initAppForPage = async () =>
  // initParams,
  // platformApis,
  // scopedSdkApis,
  // platformServicesApis,
  {};
