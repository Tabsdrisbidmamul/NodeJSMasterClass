const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// ROUTING
const router = express.Router();

// At every response where we check an id within the path, it will run a check to see if the id is not greater than the tours array length, if it is then return a response that will end the request-response cycle before getting to the main route handlers
// router.param('id', tourController.checkID);

/**
 * To add multiple middleware handlers to routes request methods, we add it to the argument list in the request method, of course the order matters - so if we were to have a handler that error checks and another that processes result, we have the error checker first and the processor afterwards
 *  - .post(tourController.checkBody, tourController.createTour);
 */

// ROUTE: /api/v1/tours

/**
 * ALIAS ROUTE
 * We have to place any alias or routes that we do not expect an id lookup or user placing a variable into the route at the
 *  - TOP
 *  - BEFORE VARIABLE ROUTES
 *
 * That is because Express will think that it is an id lookup or variable route
 */
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(authController.protect, tourController.createTour);

router
  .route('/:id')
  .get(authController.protect, tourController.getTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(authController.protect, tourController.deleteTour);

module.exports = router;
