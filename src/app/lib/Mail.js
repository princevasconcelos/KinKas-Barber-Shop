import nodemailer from 'nodemailer';
import exphbs from 'express-handlebars';
import nodemailerbhs from 'nodemailer-express-handlebars';
import { resolve } from 'path';

import mailConfig from '../../config/nodemailer';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });

    this.configureTemplates();
  }

  sendMail(msg) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...msg,
    });
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'views', 'emails');

    /**
     * compile é como ele formata a nossa mensagem
     */
    this.transporter.use(
      'compile',
      nodemailerbhs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }
}

export default new Mail();
