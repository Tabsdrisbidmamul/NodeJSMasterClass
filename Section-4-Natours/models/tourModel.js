const mongoose = require('mongoose');

/**
 * SCHEMA
 * The schema can be seen as us first defining what the document (table) fields will be initially
 *
 * HOW TO DO IT
 * We use the constructor mongoose.Schema() and pass in an object which will contain the field names and their values will be their type, uniqueness, required.. etc.
 *
 * type:= we can have the type simply equal to Javascript basic data types, but to customize, we wrap it around an object and give those attributes truthy/falsy values
 */

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

/**
 * MODEL
 * We then use the schema we just created, and tell mongoose that this schema will be the model for our data entry
 *
 * Arguments
 *  1. The name of the document (table)
 *  2. The schema
 *
 * WHAT IS THE MODEL?
 * The model is essentially a wrapper around the schema, that allows use to do the basic CRUD operations on it
 *
 * It is common to have the model variable as uppercase, to differentiate it as  class basically
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
/**
 * USING A MODEL
 * To use a model, we actually have to instantiate the model we just created and in its constructor, we pass an object that contains key-value pairs of data entry - so the key is the field name and the value is the data
 *
 * HOW TO SAVE THE INSTANCE TO THE DB:
 * We use the instance object and use the save() method on it
 * This method returns a promise so we can do various other things to it
 *
 * However it is as simple as that, just .save() on the object instance
 *
 * ANOTHER WAY TO CREATE A DOCUMENT
 * Instead of object instance of the Model itself using the "new" operator
 * We can instead use the .create() method on the Model itself - which as well returns a Promise - so we can async and await it
 *  - const newTour = await Tour.create(req.body);
 * 
 * This has a major benefit that it is less to write, but 
 */
/* const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR: ', err);
  }); */
