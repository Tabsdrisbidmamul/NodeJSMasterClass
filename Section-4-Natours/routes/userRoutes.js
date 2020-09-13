const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ROUTING
const router = express.Router();

// ROUTE: /api/v1/users/sign-up
// ROUTE: /api/v1/users/login
router.post('/sign-up', authController.signup);
router.post('/login', authController.login);

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
