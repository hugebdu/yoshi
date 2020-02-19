import { serverEntryParser } from '../src/server-entry-parser';

const scriptsWithoutEntry = {
  start: 'yoshi start',
  pretest: 'yoshi build',
  test: 'yoshi test',
  posttest: 'yoshi lint',
  release: 'yoshi release',
};

const scriptsWithServer = {
  start: 'yoshi start --server=server.js',
  pretest: 'yoshi build',
  test: 'yoshi test',
  posttest: 'yoshi lint',
  release: 'yoshi release',
};

const scriptsWithOtherServerFlag = {
  start: 'something else --server=server.js',
  pretest: 'yoshi build',
  test: 'yoshi test',
  posttest: 'yoshi lint',
  release: 'yoshi release',
};

const scriptsWithEntry = {
  start: 'yoshi start --entry-point=entryPoint.js',
  pretest: 'yoshi build',
  test: 'yoshi test',
  posttest: 'yoshi lint',
  release: 'yoshi release',
};

describe('Server Entry Parser', () => {
  it('should return null if packageJSON scripts is missing', () => {
    expect(serverEntryParser({})).toEqual(null);
  });

  it('should ignore unrelated --server and --entry-point commands', () => {
    expect(serverEntryParser({ scripts: scriptsWithOtherServerFlag })).toEqual(
      null,
    );
  });

  it('should return nothing if --server and --entry-point is missing in the commands', () => {
    expect(serverEntryParser({ scripts: scriptsWithoutEntry })).toEqual(null);
  });

  it('should return entry point when --server command is found', () => {
    expect(serverEntryParser({ scripts: scriptsWithServer })).toEqual(
      'server.js',
    );
  });

  it('should return entry point when --entry-point is found', () => {
    expect(serverEntryParser({ scripts: scriptsWithEntry })).toEqual(
      'entryPoint.js',
    );
  });
});
