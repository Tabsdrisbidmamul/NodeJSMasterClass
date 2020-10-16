const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .get('/', authController.isLoggedIn, viewController.getOverview)
  .get('/myAccount', authController.protect, viewController.getAccount)
  .get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
  .get('/login', authController.isLoggedIn, viewController.getLoginForm);

module.exports = router;
