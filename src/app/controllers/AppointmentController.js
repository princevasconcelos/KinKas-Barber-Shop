import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';

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

    return res.json(appointment);
  }
}

export default new AppointmentController();
