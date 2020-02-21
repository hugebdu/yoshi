import createAppController from './controller';
import LaboratoryTestkit from '@wix/wix-experiments/dist/src/laboratory-testkit';
import { EXPERIMENTS_SCOPE } from '../../config/constants';

export function mockExperiments(scope, experiments) {
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
    const formFactor = 'Desktop';
    const experiments = { someExperiment: 'true' };
    const mobile = formFactor === 'Mobile';
    const controllerConfig = {
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

    controller.pageReady();

    expect(setPropsSpy).toBeCalledWith({
      name: 'World',
      cssBaseUrl: appParams.baseUrls.staticsBaseUrl,
      language,
      experiments,
      mobile,
    });
  });
});
