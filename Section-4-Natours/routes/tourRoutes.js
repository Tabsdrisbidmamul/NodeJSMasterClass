const express = require('express');
const tourController = require('./../controllers/tourController');

// ROUTING
const router = express.Router();

// At every response where we check an id within the path, it will run a check to see if the id is not greater than the tours array length, if it is then return a response that will end the request-response cycle before getting to the main route handlers
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
