const express = require('express');

const ctrl = require('../../controllers/signup');

const { validateBody, authenticate, upload } = require('../../middlewares');

const { schemas } = require('../../models/user');

const router = express.Router();

router.post('/signup', validateBody(schemas.signupSchema), ctrl.signup);
router.get('/verify/:verificationToken', ctrl.verify);
router.post('/verify', validateBody(schemas.reverifySchema), ctrl.reverify);
router.post('/login', validateBody(schemas.loginSchema), ctrl.login);
router.get('/current', authenticate, ctrl.getCurrent);
router.post('/logout', authenticate, ctrl.logout);
router.patch(
  '/',
  authenticate,
  validateBody(schemas.updateSubscriptionSchema),
  ctrl.updateSubscription
);

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  ctrl.updateAvatar
);

module.exports = router;
