import path from 'path';
import stream from 'stream';
import child_process from 'child_process';
import chalk from 'chalk';
import waitPort from 'wait-port';
import fs from 'fs-extra';
import { getDevelopmentEnvVars } from 'yoshi-helpers/build/bootstrap-utils';
import { SERVER_LOG_FILE } from 'yoshi-config/build/paths';
import SocketServer from './socket-server';
import { createSocket as createTunnelSocket } from './utils/suricate';
import { PORT } from './utils/constants';

function serverLogPrefixer() {
  return new stream.Transform({
    transform(chunk, encoding, callback) {
      this.push(`${chalk.greenBright('[SERVER]')}: ${chunk.toString()}`);
      callback();
    },
  });
}

function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

const inspectArg = process.argv.find(arg => arg.includes('--debug'));

export class ServerProcess {
  private cwd: string;
  private serverFilePath: string;
  private nodeEnv: object;
  public child?: child_process.ChildProcess;
  public appName: string;

  constructor({
    cwd = process.cwd(),
    serverFilePath,
    appName,
    nodeEnv = {
      NODE_ENV: 'production',
    },
  }: {
    cwd?: string;
    serverFilePath: string;
    appName: string;
    nodeEnv?: object;
  }) {
    this.cwd = cwd;
    this.serverFilePath = serverFilePath;
    this.appName = appName;
    this.nodeEnv = nodeEnv;
  }

  async initialize() {
    const bootstrapEnvironmentParams = getDevelopmentEnvVars({
      port: PORT,
      cwd: this.cwd,
    });

    this.child = child_process.fork(this.serverFilePath, [], {
      stdio: 'pipe',
      execArgv: [inspectArg]
        .filter(notUndefined)
        .map(arg => arg.replace('debug', 'inspect')),
      env: {
        ...process.env,
        PORT: `${PORT}`,
        ...bootstrapEnvironmentParams,
        ...this.nodeEnv,
      },
    });

    const serverLogWriteStream = fs.createWriteStream(
      path.join(this.cwd, SERVER_LOG_FILE),
    );
    const serverOutLogStream = this.child.stdout!.pipe(serverLogPrefixer());
    serverOutLogStream.pipe(serverLogWriteStream);
    serverOutLogStream.pipe(process.stdout);

    const serverErrorLogStream = this.child.stderr!.pipe(serverLogPrefixer());
    serverErrorLogStream.pipe(serverLogWriteStream);
    serverErrorLogStream.pipe(process.stderr);

    await waitPort({
      port: PORT,
      output: 'silent',
      timeout: 20000,
    });
  }

  end() {
    this.child && this.child.kill();
  }

  async restart() {
    // @ts-ignore
    if (this.child && this.child.exitCode === null) {
      this.child.kill();

      await new Promise(resolve =>
        setInterval(() => {
          if (this.child && this.child.killed) {
            resolve();
          }
        }, 100),
      );
    }

    await this.initialize();
  }
}

export class ServerProcessWithHMR extends ServerProcess {
  public socketServer: SocketServer;
  private resolve?: (value?: unknown) => void;
  public suricate: boolean;

  constructor({
    cwd,
    serverFilePath,
    socketServer,
    suricate,
    appName,
  }: {
    cwd: string;
    serverFilePath: string;
    socketServer: SocketServer;
    suricate: boolean;
    appName: string;
  }) {
    super({
      cwd,
      serverFilePath,
      appName,
      nodeEnv: {
        HMR_PORT: `${socketServer.hmrPort}`,
        NODE_ENV: 'development',
      },
    });

    this.socketServer = socketServer;
    this.suricate = suricate;
  }

  async initialize() {
    if (this.suricate) {
      createTunnelSocket(this.appName, PORT);
    }

    await this.socketServer.initialize();

    super.initialize();

    this.socketServer.on('message', this.onMessage.bind(this));
  }

  onMessage(response: any) {
    this.resolve && this.resolve(response);
  }

  send(message: any) {
    this.socketServer.send(message);

    return new Promise(resolve => {
      this.resolve = resolve;
    });
  }

  static async create({
    cwd = process.cwd(),
    serverFilePath,
    appName,
    suricate,
  }: {
    cwd?: string;
    serverFilePath: string;
    appName: string;
    suricate: boolean;
  }) {
    const socketServer = await SocketServer.create();

    return new ServerProcessWithHMR({
      socketServer,
      cwd,
      serverFilePath,
      appName,
      suricate,
    });
  }
}
