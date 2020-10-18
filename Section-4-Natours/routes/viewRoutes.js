const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .get('/reset-password/:resetToken', viewController.getResetPasswordForm)
  .get('/', authController.isLoggedIn, viewController.getOverview)
  .get('/myAccount', authController.protect, viewController.getAccount)
  .get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
  .get('/login', authController.isLoggedIn, viewController.getLoginForm)
  .get(
    '/forgot-your-password',
    authController.isLoggedIn,
    viewController.getForgotPasswordForm
  )
  .get('/signup', authController.isLoggedIn, viewController.getSignupForm);
// .post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

module.exports = router;
