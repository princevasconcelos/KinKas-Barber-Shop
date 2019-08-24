import express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';

/**
 * Por padrão, o node nao envia os errros dentro do async/await
 * Pra funcionar, precisa adicionar essa lib
 * Usada para enviar os erros pro sentry
 */
import 'express-async-errors';

import sentryConfig from './config/sentry';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }
}

export default new App().server;
