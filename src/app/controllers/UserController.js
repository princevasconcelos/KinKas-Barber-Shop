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

  async update(req, res) {
    const { oldPassword, name, email } = req.body;
    console.log(req.userId);

    const user = await User.findByPk(req.userId);

    // User can change email
    if (email !== user.email) {
      // Check if there is an user with that email
      const emailAlreadyExists = await User.findOne({
        where: {
          email,
        },
      });

      if (emailAlreadyExists) {
        return res.status(400).json({
          error: 'E-mail already exists',
        });
      }
    }

    // User can change password
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({
        error: 'Password doesnt match',
      });
    }

    const { id, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
