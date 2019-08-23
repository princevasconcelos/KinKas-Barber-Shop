import User from '../models/User';
import * as Yup from 'yup';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

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
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, password) =>
          oldPassword ? password.required() : password
        ),
      confirmPassword: Yup.string().when(
        'password',
        (password, confirmPassword) =>
          password
            ? confirmPassword.required().oneOf([Yup.ref('password')])
            : confirmPassword
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { oldPassword, name, email } = req.body;

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
