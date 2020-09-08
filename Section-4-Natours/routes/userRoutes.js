const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authenticaionController');

// ROUTING
const router = express.Router();

// ROUTE: /api/v1/users/sign-up
router.post('/sign-up', authController.signup);

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
