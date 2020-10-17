const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

/**
 * MULTER
 * Middleware that allows express to understand different forms being sent to the server - so we have URLEncoded, JSON and COOKIE_PARSER, so we use MULTER for multi form attributes.
 *
 * We instantiate it and pass in the directory where it is going to be stored, and pass it in as middleware in the update-me route, and the args we pass in is the field in the DB schema where it is going to be updated in
 *
 * It will also add a file property to the req packet
 */

// ROUTING
const router = express.Router();

// ROUTE: /api/v1/users/sign-up
// ROUTE: /api/v1/users/login
router.post('/sign-up', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Middleware runs in sequence, so all these routes will have to be authenticate first before getting access to the other routes
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/delete-me', userController.deleteMe);

// Only admins should be able to run these commands
router.use(authController.restrictTo('admin'));

// ROUTE: /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
