import User from '../models/User';
import Notification from '../schemas/NotificationSchema';

class NotificationController {
  async index(req, res) {
    const isAProvider = User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!isAProvider) {
      return res.status(401).json({
        error: 'Only providers can load notifications',
      });
    }

    const notification = await Notification.find({
      user: req.userId,
    })
      .sort({
        createdAt: 'desc',
      })
      .limit(20);

    return res.json(notification);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      {
        new: true,
      }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
