const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ROUTING
const router = express.Router();

// ROUTE: /api/v1/users/sign-up
// ROUTE: /api/v1/users/login
router.post('/sign-up', authController.signup);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

router.patch('/update-me', authController.protect, userController.updateMe);

// ROUTE: /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
