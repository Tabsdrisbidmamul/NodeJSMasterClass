const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router
  .get('/', viewController.getOverview)
  .get('/tour/:slug', viewController.getTour);

module.exports = router;
