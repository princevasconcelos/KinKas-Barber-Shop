import { hash } from 'bcrypt';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const emailAlreadyExists = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (emailAlreadyExists) {
      return res.status(400).json({
        error: 'E-mail already exists',
      });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
