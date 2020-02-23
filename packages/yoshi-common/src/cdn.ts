import fs from 'fs';
import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import serveHandler from 'serve-handler';
import { Config } from 'yoshi-config/build/config';
import { STATICS_DIR } from 'yoshi-config/build/paths';

export async function startCDN(config: Config) {
  function serverFn(req: IncomingMessage, res: ServerResponse) {
    return serveHandler(req, res, {
      public: STATICS_DIR,
      headers: [
        {
          source: '*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Origin, X-Requested-With, Content-Type, Accept',
            },
          ],
        },
      ],
    });
  }

  function httpCdn() {
    return http.createServer(serverFn);
  }

  function httpsCdn() {
    return https.createServer(
      {
        cert: fs.readFileSync(
          require.resolve('yoshi-helpers/certificates/server.cert'),
          'utf-8',
        ),
        key: fs.readFileSync(
          require.resolve('yoshi-helpers/certificates/server.key'),
          'utf-8',
        ),
        passphrase: '1234',
      },
      serverFn,
    );
  }

  const { port, ssl } = config.servers.cdn;

  const server = ssl ? httpsCdn() : httpCdn();
  await new Promise(resolve => server.listen(port, resolve));

  return server;
}
