import express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';

/**
 * deixa as mensagens de error mais bonitas
 */
import Youch from 'youch';

/**
 * Por padrão, o node nao envia os errros dentro do async/await
 * Pra funcionar, precisa adicionar essa lib
 * Usada para enviar os erros pro sentry
 * essa lib precisa ser importanda antes das rotas
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
    this.exceptionHandler();
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();

      return res.status(500).json(errors);
    });
  }
}

export default new App().server;
