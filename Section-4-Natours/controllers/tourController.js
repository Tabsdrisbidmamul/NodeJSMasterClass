const fs = require('fs');

// get the tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

// ROUTING HANDLERS
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

/**
 * To specify a variable - so a unique identifier for the URL parameter - so in this case there are different tours and to identify a tour we assign a unique identifier to it - thus in the URL we can do so by using the the colon (:) followed by the variable name - so we used the variable name id, can be var or x or anything -> :id
 *
 * We can have multiple identifiers we simply need to separate them with forward slashes then a unique variable name /api/v1/tours/:id/:var/:x etc
 *
 * We can specify optical parameters we place a question mark (?) at the end of the variable name so /api/v1/tours/:id? would mean that the tour id is optional now
 */

exports.getTour = (req, res) => {
  // console.log(req.params);

  /**
   * We use req.params to return specific parts of the URL - and in this case we have a named variable within the the resource that we have created - so we simply call req.params then access the id property to get back the ID from the end-user path
   */

  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        message: 'New Tour Created',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  const id = Number(req.params.id);
  const getTourIndex = tours.findIndex((t) => t.id === id);

  const updatedTour = Object.assign(tours[getTourIndex], req.body);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        message: 'Tour Updated',
        data: {
          tour: updatedTour,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = Number(req.params.id);
  const getTourIndex = tours.findIndex((t) => t.id === id);

  tours.splice(getTourIndex, 1);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(204).json({
        status: 'success',
        message: 'Tour Deleted',
        data: null,
      });
    }
  );
};
