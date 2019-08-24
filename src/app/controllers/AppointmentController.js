import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { format } from 'date-fns'


import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notifications from '../schemas/NotificationSchema';
import Mail from '../lib/Mail';

class AppointmentController {
  /**
   * Agendamentos de um cliente
   */
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { provider_id, date } = req.body;

    const provider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!provider) {
      return res.status(401).json({
        error: 'You can only create appointment with provider',
      });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'Past date is not permitted',
      });
    }

    /**
     * Essa parte fica errada caso eu crie um agendamento
     * usando minutos. Ex: 10:40h
     */
    const hasAppointmentInHour = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (hasAppointmentInHour) {
      return res.status(400).json({
        error: 'Appointment date is not avaliable',
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /**
     * Notify provider about a new appointment
     */

    const user = await User.findByPk(req.userId);
    const formattedDate = format(hourStart, "dd 'de' MMMM', às 'H:mm'h'", {
      locale: pt,
    });

    await Notifications.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    /**
     * include é feito aqui somente para pegar o email do prestador
     * de serviço, para ser usado ao enviar o email
     */
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You dont have permission to cancel this appointment',
      });
    }

    const dateMinusTwoHours = subHours(appointment.date, 2);

    if (isBefore(dateMinusTwoHours, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments two hours before the date',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancelation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, "dd 'de' MMMM', às 'H:mm'h'", {
          locale: pt,
        })
      },
    }).catch(err => console.log(err));

    return res.json(appointment);
  }
}

export default new AppointmentController();
