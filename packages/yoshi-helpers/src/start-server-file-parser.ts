import arg from 'arg';
import { PackageJson } from 'type-fest';

export function startServerFileParser(packageJSON: PackageJson) {
  if (!packageJSON?.scripts?.start) {
    return null;
  }

  const { '--server': serverEntry } = arg(
    {
      '--server': String,
      '--entry-point': '--server',
    },
    {
      argv: packageJSON.scripts.start.split(' '),
    },
  );

  return serverEntry || null;
}
