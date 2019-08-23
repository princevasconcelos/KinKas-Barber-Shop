import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import User from '../models/User';
import Appointment from '../models/Appointment';

class SchedulerController {
  /**
   * Agendamentos do prestador de serviço
   */
  async index(req, res) {
    /**
     * definir a data de hoje como padrão
     * pra nao ter de enviar a queryString
     */
    const { date } = req.query;

    const parsedDate = parseISO(date);

    const isUserAProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!isUserAProvider) {
      return res.status(401).json({
        error: 'User is a not a provider',
      });
    }

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new SchedulerController();
