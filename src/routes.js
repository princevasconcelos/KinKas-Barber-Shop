import express from 'express';

import User from './app/models/User';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('chegou');
  const user = await User.create({
    name: 'prince',
    email: 'praas@email.com',
    password_hash: '2d2jd2j8d2j',
  });

  console.log(user);

  return res.json({
    message: 'ok',
  });
});

export default router;
