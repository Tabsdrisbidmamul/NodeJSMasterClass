const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

/**
 * SCHEMA
 * The schema can be seen as us first defining what the document (table) fields will be initially
 *
 * HOW TO DO IT
 * We use the constructor mongoose.Schema() and pass in an object which will contain the field names and their values will be their type, uniqueness, required.. etc.
 *
 * type:= we can have the type simply equal to Javascript basic data types, but to customize, we wrap it around an object and give those attributes truthy/falsy values
 */

/**
 * VALIDATION AND SANITIZATION
 * Validating the data is a must to ensure that we don't have Strings where an Integer should be in the document Schema or we will run into errors
 *
 * Sanitizing the data, we must never ever accept user input direct and commit it to the DB
 *
 * VALIDATION
 * Checking for the user input:
 *  - right format for the each field according to the document schema
 *  - all the required fields are completed
 *
 * SANITIZATION
 * To ensure that:
 *  - inputted data is clean - no malicious code
 *    - removing unwanted characters or even code from the input fields
 *
 * HOW TO
 * Mongoose supplies built-in validators for different data types
 * all schema fields can have required added to them
 *
 * we specify the field name:
 *  - being a key called required
 *  - Its value is an array with two items:
 *    - true and a String that will be its error message
 *
 *  - required: [true, 'A tour must have a name']
 *
 * SYNTAX
 * validateName: {
 *  values: [],
 *  message: ''
 * }
 *
 *  SHORTHAND
 *
 * validateName: [value, message]
 *
 * String
 *  - minlength
 *  - maxlength
 *
 * Numbers
 *  - min
 *  - max
 * 
 * CUSTOM VALIDATORS
 * We can write our validators by using setting a function to the key named validate
 * 
 * The function has access to the current value that was passed to the field in the schema, and the function is simply a predicate that it must return a true or false
 * 
 * The 'this' refers to a newly created document, and not to an existing one
 * 
 * *INTERNAL TO MONGOOSE {VALUE} IS THE VALUE *
 * 
 *  - validate: [
        function (val) {
          return val < this.price;
        },
        'Discounted price {VALUE} is greater than the actual price',
      ],
 * 
 */

/**
 * SETTER FUNCTION
 * The set attribute within a schema field is a key that has a callback function as its value and its argument will take the current value that the field would have when updated or created
 *
 * From here we can process on the data that we have - so we can round values here as an example
 * 
 * ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater than 1.0'],
      max: [5, 'Rating must be lesser than 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
 * 
 */

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must not have a maximum of 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters'],
      validate: [
        function (val) {
          return validator.isAlpha(val.split(' ').join(''));
        },
        'A tour name must only contain letters',
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater than 1.0'],
      max: [5, 'Rating must be lesser than 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: [
        function (val) {
          return val < this.price;
        },
        'Discounted price {VALUE} is greater than the actual price',
      ],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },
    images: [String],
    /* { timestamps: true } : creates 2 fields createdAt and UpdatedAt fields for us down below is how make them manually

    To hide fields permanently, we can do so in the schema, by having the select field set to false
     */
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
  // { timestamps: true }
);

/**
 * INDEXES
 * Indexes are essentially a list of records sorted based on a field and are stored in some Object in the DB. So when we query the DB on a field that has been indexed - Mongo will look at the index list first and be cable to locate the record very quickly than compared to not having an index and thus scanning every document in the collection.
 *
 * DO(s) AND DON'T(s)
 * 1. Never over do it with indexes, they consume resources in the DB
 * 2. Never assign indexes on collections that have a high write/read ratio (so more writing then reading)
 * 3. Every time the collection is updated the indexes have to be updated as well so again never assign indexes on high write/read ratio collections
 *
 * ONE IS DONE FOR YOU
 * The _id field generated by Mongo is indexed - so when we query via _id, we are not querying documents but rather almost a hashed value of where the document is stored in the DB - on disk
 *
 * TO CREATE
 * We place these indexes on our schema and passing in an key-value object with a value
 *  key: field
 *  value: +1 - ASC ORDER
 *         -1 - DESC ORDER
 *
 * schema.index(Object)
 *
 * SINGLE INDEX
 * A single index is where we give a single field to be an index, this is useful when ou think that the said field will be queried a lot
 *  - tourSchema.index({ price: 1 });
 *
 * COMPOUND INDEX
 * Like a compound attribute, we can make a compound index of more than 1 fields, and just like writing a filter object, we simply add on the field into the object
 *  - tourSchema.index({ price: 1, ratingsAverage: -1 });
 *
 * UNIQUE INDEX
 * We can have an index be unique by setting the unique option in the options object to true
 *  - reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
 *
 */

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

/**
 * EMBEDDING
 * This is where we keep the documents within the container document, so the contained documents do exist elsewhere - but if one has to be updated, then they have to be updated in those 2 places
 *
 * SYNTAX
 * filedName: Array
 *
 * guides: Array
 *
 * We use a pre save middleware to populate the document with the embedded documents
 * 
 * 
 * tourSchema.pre('save', async function (next) {
   this.guides = await Promise.all(this.guides.map((id) => User.findById(id)));
   next();
 });
 *
 * 
 */

/**
 * REFERENCING
 * Basically primary and foreign keys in a DB
 * 2 types of referencing: Parent and Child referencing
 * 
 * PARENT REFERENCING
 * The parent document will hold references to every document that is useful, and such will store a reference to every single of its child document - meaning that the parent knows its children
 * 
 * Parent Referencing: We store each document reference in an array, and we write it like this:
 * 
 * guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      }],
 * 
 * This field will contain an array of User documents
 * 
 * HOW?
 * We specify 2 fields, the type and the ref
 * type: will say how to uniquely identify it - so its _id
 * ref: which Model to look for the data in - we write the model name how we wrote it in the Schema - so title-ized
 * 
 * CHILD REFERENCING
 * Child referencing is where the child will store a reference to its parent document, but the parent will not know its children.
 * 
 * Literally the exact same syntax as PARENT REFERENCING in the Schema, but to populate it we have to use a virtual, so a field that is not persisted in the Schema
 * 
 * EXPLAINED IN VIRTUALS TO POPULATE
 * 
 * tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
  });
 * 
 * And as this is a special case where we usually are populating on when one tour is retrieved, we go to the handler for getTour, and chain .populate() onto with the virtual field name as the lookup
 * 
 * We use JS Promise.all to await all the promise objects within the array that was returned from map()
 * 
 */

/**
 * QUERY.PROTOTYPE.POPULATE
 *
 * The populate method allows the referencing to actually work, because it will find the document in said model and then retrieve those documents from that model and then populate (so embed) the documents into the container documents (the one that is doing the referencing)
 *
 * Populates behind the scene actually are running their own query, so having multiple populates can hinder performance, so minimize to 2 levels
 */

/**
 * VIRTUALS
 * These are fields within the Collection Schema that are not persistent - meaning, that they are not saved directly into the DB's hardware storage. They can be seen as almost as prototypes in JS - that every document has access to these helper functions - but are not actually part of the document itself - in turn saving storage space
 * 
 * HOW TO
 * We usually add the virtuals after the creation of the schema - just like prototypes in JS objects
 * 
 *  - We use the virtual() method on the schema instance and the argument passed is the virtuals name in a String, 
 * 
 *  - We then use the get() method on the virtuals method (chaining methods) adn we pass in a callback function - written using the normal function was not using arrow function
 * 
 *  - Here we can compute statistical values and return them after use
 *  - tourSchema.virtual('durationWeeks').get(function () {
      return this.duration / 7;
      });
 *
 * HAVE THEM OUTPUT WITH DOCUMENTS
 * We have to pass in these options to the schema as its second argument
 *  - {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
 * 
 * VIRTUALS TO POPULATE
 * If we did child referencing within a parent schema - obviously the parent will have no idea of its children, and most of the time it is okay - but when we need to reference back to the child - we have to use virtuals to do so
 * 
 * Like normal referencing we have to specify the ref, as normal, to the Model it should get data from
 * 
 * We then have to write 2 new fields, foreignField and localField 
 * foreignField will point to the field within the Model that we referenced where the parent Schema (this, being the Tours)
 * 
 * And the localField being how to relate back to them - so in this case we used their _id(s) to do, so we write _id
 * 
 */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

/**
 * MONGOOSE MIDDLEWARE
 * Just like in Express, Mongoose has middleware itself - and they are processed when the document is going to be saved and when it has been saved - they are also known as pre-hook and post-hook functions.
 *
 * There are 4 types of Mongoose Middleware
 *  - DOCUMENT MIDDLEWARE
 *  - QUERY MIDDLEWARE
 *  - AGGREGATE MIDDLEWARE
 *  - MODEL MIDDLEWARE
 *
 * Just Like Virtuals, we write middleware on the schema - the 'this' will refer to the currently processed document, query, aggregate or model
 *
 * Hence we use the normal function declaration and not the arrow function
 *
 * SYNTAX
 * The <hooks> can almost be seen as events
 * PRE HOOK
 * modelSchema.pre(<hook>, function(next) {})
 *
 * POST HOOK
 * modelSchema.post(<hook>, function(</hook><CURRENT_DOC|QUERY_DOCS|AGG|MODEL>, next) {})
 *
 * DOCUMENT MIDDLEWARE
 * These middlewares can act on the currently processed document either before the event is going to happen (pre()) and after the event has happened (post())
 *
 * PRE
 * Pre middleware function have access to the next() function, and just like in Express, this function is called and used to say that current middleware has finished processing and is passing the chain of command to the next middleware in the stack.
 *
 * POST
 * Post middleware function has access to the current document that has just been processed by a pre - or simply gone thorough the stack - and the next() function as well.
 *
 * So we do not have access to the 'this' keyword but rather the parameter value of the document, We still can refer back to the processed object using this, however the unless there is something of use within the object that you left from the pre hook state, its best to work with the results that the object produced
 *
 * DOCUMENT - SAVE EVENT
 * The save event will run before the .save() and .create() methods are ran - and this event will only be triggered for when the .save() and .create() methods are called
 *
 * It will not be triggered when .insertMany() is used or .insert()
 *
 * QUERY MIDDLEWARE
 * These middleware, just like DOCUMENT MIDDLEWARE, will ran before and after certain events (A Query object being executed) have taken place
 *
 * QUERY - FIND EVENT
 * This event is triggered when a Query object is being executed, but before it executes its knows from its Model that on the Schemas hook listeners that we have middleware that should run before a Query object gets executed
 *
 * In this event we have access to the current Query Object
 *  - Tour.find()
 *
 * Looking back in the tourController, we chain several Queries method on it, and just like that we can also chain Query methods on it as well within the middleware, with this we can filter out the result set to show only public access certain parts of the DB and private access privileged parts of the DB Collection
 *
 * PROBLEMS
 * With the hook event we listed
 *  - tourSchema.pre('find', function (next) {...}
 *
 * This will only be triggered for when the .find() method is called, and not the other flavours of find methods
 *  - findOne
 *  - findMany
 *
 * This is not what we want, but rather we want this middleware to run for every find variation called, so we can pass in a regex into the hook param and target all variations of find methods.
 *  - tourSchema.pre(/^find/, function (next)
 *
 * AGGREGATION MIDDLEWARE
 * These middleware will only run when an Aggregate Object is being executed (when await is called)
 *
 * Here we have access to pre and post hooks as usual
 *
 * AGGREGATE HOOK
 * This event is fired off when the aggregate() method called, and with this we have access to the aggregate pipeline - the array where we place the $group, $match operators
 *
 * In our case we want to make sure that private access DB components are not included in the aggregation, so what we have to do is exclude them from the result set, and we do this by placing a $match object before any other matches are ran.
 *
 * now the pipeline is simply an array of objects, so we can use a JS array method unshift to prepend the middleware match object to the array
 *
 * To access th pipeline, we use pipeline() method that exists on the Aggregate object
 *  - this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
 *
 *
 */

// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   // const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   // this.guides = await Promise.all(guidesPromises);

//   this.guides = await Promise.all(this.guides.map((id) => User.findById(id)));
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });

//   this.start = Date.now();
//   next();
// });

tourSchema.pre(/^find/i, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   // console.log(docs);
//   next();
// });

// AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this);
  next();
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
