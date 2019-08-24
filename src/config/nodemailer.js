export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Equipe Kinkas <noreplay@kinkas.com>',
  },
};

/**
 * Amazon SES
 * Mailgun
 * Sparkpost
 * Mandril (Mailchip)
 * Gmail (limit)
 * Mailtrap (only for dev)
 */
