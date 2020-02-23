import { startServerFileParser } from '../src/start-server-file-parser';

const scriptsWithoutEntry = {
  start: 'yoshi start',
};

const scriptsWithServer = {
  start: 'yoshi start --server=server.js',
};

const scriptsWithEntry = {
  start: 'yoshi start --entry-point=entryPoint.js',
};

describe('Server Entry Parser', () => {
  it('should return null if packageJSON scripts is missing', () => {
    expect(startServerFileParser({})).toEqual(null);
  });

  it('should return nothing if --server and --entry-point is missing in the commands', () => {
    expect(startServerFileParser({ scripts: scriptsWithoutEntry })).toEqual(
      null,
    );
  });

  it('should return entry point when --server command is found', () => {
    expect(startServerFileParser({ scripts: scriptsWithServer })).toEqual(
      'server.js',
    );
  });

  it('should return entry point when --entry-point is found', () => {
    expect(startServerFileParser({ scripts: scriptsWithEntry })).toEqual(
      'entryPoint.js',
    );
  });
});
