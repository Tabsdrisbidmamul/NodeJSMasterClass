const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
// const reviewController = require('../controllers/reviewController');

// ROUTING
const router = express.Router();

/**
 * EMBED ROUTES
 * These are routes that instead of using query strings, we instead create routes that actually make sense in the front-end
 *
 * EXAMPLE
 * A logged in user, should be able to click on a tour and then write a review
 *
 * We extract the user information from the req.body.user (from when we store the user in the body)
 *
 * We extract the tourId from the URL params
 * 
 * 
 * SIMPLE BAD EXAMPLE
 * The code here works, but the problem is we have this bit of code thats and functions very similar to the one in reviewRoutes, so we can actually reuse it 
 * router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );
 *
 *
 * GOOD EXAMPLE
 * We can use mounting - just like we have done in app.js, we can do the same as well with this, we specify the route and then the route handler like so - and just like we have a nicely decoupled route handlers
 * 
 * router.use('/:tourId/reviews', reviewRouter);
 * 
 * Only problem is the :tourId is not accessible in the reviewRoutes anymore
 * 
 * HOW TO FIX?
 * We set the option to mergeParams to true in the router
 * 
 * WE USE mergeParams
 * mergeParams basically tells Express that the route should have access to all of the previous routes parameter ids
 *  
 * // ROUTING in reviewsRoutes.js
   const router = express.Router({ mergeParams: true });
 *  
 * This tells NodeJS that this route should have access to the previous routes parameters
 * 
 * 
 */

/**
 * EXAMPLES OF EMBED ROUTES
 * POST tours/1287jhsg/reviews
 * GET tours/1287jhsg/reviews
 * GET tours/1287jhsg/reviews/sjhfg55jsh
 */

router.use('/:tourId/reviews', reviewRouter);

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
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// The old qay (Query String)
// /tours-within?distance=233&center=-40,45&unit=mi

// The good way (Embedded)
// /tours-within/233?center/-40,45/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
