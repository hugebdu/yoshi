import fs from 'fs';
import path from 'path';
import {
  createTestkit,
  testkitConfigBuilder,
  anAppConfigBuilder,
} from '@wix/business-manager/dist/testkit';

interface TestKitConfigOptions {
  withRandomPorts: boolean;
}

const getTestKitConfig = async (
  { withRandomPorts }: TestKitConfigOptions = { withRandomPorts: false },
) => {
  const serverUrl = 'http://localhost:3200/';
  const serviceId = 'com.wixpress.{%projectName%}';

  const template = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../target/module_{%PROJECT_NAME%}.json'),
      'utf-8',
    ),
  );

  const moduleConfig = anAppConfigBuilder()
    .fromJsonTemplate(template) //  replace this line with the next once your config is merged
    // .fromModuleId('{%PROJECT_NAME%}')
    .withArtifactMapping({ [serviceId]: { url: serverUrl } })
    .build();

  let builder = testkitConfigBuilder()
    .withModulesConfig(moduleConfig)
    .autoLogin();

  if (withRandomPorts) {
    builder = builder.withRandomPorts();
  }

  return builder.build();
};

export const environment = async (envConfig?: TestKitConfigOptions) =>
  createTestkit(await getTestKitConfig(envConfig));
