const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router
  .get('/', viewController.getOverview)
  .get('/tour/:slug', viewController.getTour)
  .get('/login', viewController.getLoginForm);

module.exports = router;
