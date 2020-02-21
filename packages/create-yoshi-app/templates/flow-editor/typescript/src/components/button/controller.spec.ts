import LaboratoryTestkit from '@wix/wix-experiments/dist/src/laboratory-testkit';
import { ExperimentsBag } from '@wix/wix-experiments';
import { EXPERIMENTS_SCOPE } from '../../config/constants';
import createAppController, { ControllerConfig } from './controller';

export function mockExperiments(scope: string, experiments: ExperimentsBag) {
  new LaboratoryTestkit()
    .withScope(scope)
    .withBaseUrl(window.location.href)
    .withExperiments(experiments)
    .start();
}

describe('createAppController', () => {
  it('should call setProps with data', async () => {
    mockExperiments(EXPERIMENTS_SCOPE, { someExperiment: 'true' });
    const setPropsSpy = jest.fn();
    const appParams = {
      baseUrls: {
        staticsBaseUrl: 'http://some-static-url.com',
      },
    };
    const language = 'en-US';
    const formFactor: string = 'Desktop';
    const experiments = { someExperiment: 'true' };
    const mobile = formFactor === 'Mobile';
    const controllerConfig: ControllerConfig = {
      appParams,
      setProps: setPropsSpy,
      wixCodeApi: {
        window: {
          formFactor,
          multilingual: {
            isEnabled: false,
          },
        },
        site: {
          language,
        },
      },
    };

    const controller = await createAppController({ controllerConfig });

    await controller.pageReady();

    expect(setPropsSpy).toBeCalledWith({
      name: 'World',
      cssBaseUrl: appParams.baseUrls.staticsBaseUrl,
      language,
      experiments,
      mobile,
    });
  });
});
