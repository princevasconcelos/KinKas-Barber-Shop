import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../lib/Mail';

class CancelationMail {
  get key() {
    /**
     * pra cada job, precisa-se de uma chave unica
     */
    return 'CancelationMail';
  }

  async handle({ data }) {
    const { appointment } = data;

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancelation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(parseISO(appointment.date), "dd 'de' MMMM', às 'H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancelationMail();
