import path from 'path';
import globby from 'globby';
import { getProjectArtifactId } from 'yoshi-helpers/utils';
import resolve from 'resolve';
import fs from 'fs-extra';
import { Config } from 'yoshi-config/build/config';

export interface FlowEditorModel {
  appName: string;
  appDefId: string;
  artifactId: string;
  initApp: string;
  components: Array<ComponentModel>;
}

type ComponentType = 'widget' | 'page';

export interface ComponentModel {
  name: string;
  type: ComponentType;
  fileName: string;
  controllerFileName: string;
  settingsFileName: string | null;
  id: string | null;
}

export interface ComponentConfig {
  id: string;
}

const extensions = ['.tsx', '.ts', '.js', '.json'];
function resolveFrom(dir: string, fileName: string): string | null {
  try {
    return resolve.sync(path.join(dir, fileName), {
      extensions,
    });
  } catch (error) {
    return null;
  }
}

function getComponentConfig(path: string): ComponentConfig {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export async function generateFlowEditorModel(
  config: Config,
): Promise<FlowEditorModel> {
  const artifactId = getProjectArtifactId();
  if (!artifactId) {
    throw new Error(`artifact id not provided.
    Please insert <artifactId>yourArtifactId</artifactId> in your "pom.xml"`);
  }

  const initApp = resolveFrom(path.join(process.cwd(), 'src'), 'app');
  if (!initApp) {
    throw new Error(`Missing app file.
    Please create "app.js/ts" file in "${path.resolve('./src')}" directory`);
  }

  const componentsDirectories = await globby('./src/components/*', {
    onlyDirectories: true,
    absolute: true,
  });

  const componentsModel: Array<ComponentModel> = componentsDirectories.map(
    componentDirectory => {
      const componentName = path.basename(componentDirectory);

      const widgetFileName = resolveFrom(componentDirectory, 'Widget');
      const pageFileName = resolveFrom(componentDirectory, 'Page');
      const controllerFileName = resolveFrom(componentDirectory, 'controller');
      const settingsFileName = resolveFrom(componentDirectory, 'Settings');
      const configFileName = resolveFrom(componentDirectory, '.component');
      const componentConfig =
        configFileName && getComponentConfig(configFileName);

      // Use just console.errors on current project stage. Move to errors in future.
      if (!componentConfig) {
        console.error(
          `Please specify a config (.component.json) for ${componentDirectory} directory`,
        );
      } else if (!componentConfig.id) {
        console.error(
          `Please note: You should register a widget (${componentDirectory}) in the dev-center before using it`,
        );
      }

      if (!controllerFileName) {
        throw new Error(`Missing controller file for the component in "${componentDirectory}".
        Please create "controller.js/ts" file in "${componentDirectory}" directory`);
      }
      if (!widgetFileName && !pageFileName) {
        throw new Error(`Missing widget or page file for the component in "${componentDirectory}".
        Please create either Widget.js/ts/tsx or Page.js/ts/tsx file in "${componentDirectory}" directory`);
      }

      return {
        name: componentName,
        fileName: (widgetFileName || pageFileName) as string,
        type: widgetFileName ? 'widget' : 'page',
        controllerFileName,
        settingsFileName,
        id: componentConfig ? componentConfig.id : null,
      };
    },
  );

  return {
    appName: config.name!,
    // TODO: import from named export
    appDefId: '',
    artifactId,
    initApp,
    components: componentsModel,
  };
}
