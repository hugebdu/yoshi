import arg from 'arg';

interface PackageJSON {
  scripts?: {
    [key: string]: string;
  };
}

export function serverEntryParser(packageJSON: PackageJSON) {
  if (!packageJSON || !packageJSON.scripts) {
    return null;
  }

  const scriptContainingEntry = Object.values(packageJSON.scripts).find(s =>
    s.includes('yoshi start'),
  );

  if (scriptContainingEntry) {
    const { '--server': serverEntry } = arg(
      {
        '--server': String,
        '--entry-point': '--server',
      },
      {
        argv: scriptContainingEntry.split(' '),
      },
    );

    return serverEntry || null;
  }

  return null;
}
