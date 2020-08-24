const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

/**
 * CONNECTING THE EXPRESS APP TO ATLAS DB
 * We import the mongoose (Which is a MongoDB driver) and we use the connect method to start the connection to the DB (in the cloud)
 *
 * CONNECT()
 * This method takes 2 arguments, the DB connection string and an object which we can define a set of rules of how the connection should be
 * 
 * Argument List
 *    1. The DB string should be kept in the environment variable list and be defined in the server file
 * 
 *  2. The object list will contain values to how the connection should be, these values should always stay like those at the bottom to ensure that the connection works
 * 
 * PROMISE
 * The connect() method returns a promise so that we can use the then() method on it process even more data if we want
 * 
 * .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((con) => console.log(con.connections));
 */

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((con) => console.log(con.connections));

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

/**
 * USING A MODEL
 * To use a model, we actually have to instantiate the model we just created and in its constructor, we pass an object that contains key-value pairs of data entry - so the key is the field name and the value is the data
 *
 * HOW TO SAVE THE INSTANCE TO THE DB:
 * We use the instance object and use the save() method on it
 * This method returns a promise so we can do various other things to it
 *
 * However it is as simple as that, just .save() on the object instance
 */
const testTour = new Tour({
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
  });
/**
 * ENVIRONMENT VARIABLES
 * There are 2 types of environment variables:
 *  - development
 *  - production
 *
 * By default Express, will start our applications in development mode
 * we can see this by logging to the terminal express.get('env')
 *
 * NODE ENV VARIABLES
 * NodeJS itself has env variables as well, we can see that by logging onto the the terminal "process.env" - which shows a log list of key value pairs
 * We can manipulate for production and development code for when launching
 *
 * HOW TO ADD ENV VARIABLES
 * We can do so in the terminal, by typing 
 *  - NODE_ENV=development node[mon] server.js
 * 
 * .env FILES
 * We can create dotenv files that are allow us to write all the ENV variables in one place and then read them into the express application to use
 * 
 * We do so like this:
  NODE_ENV=development
  PORT=3000
  USERNAME=jonas
  PASSWORD=123456

  We write the variable key name in uppercase and equal it to a value
 * 
 *  - We need the dotenv package from npm first
 *  - we import the module into the file
 *    - const dotenv = require('dotenv')
 *  - We then read in the file
 *    - dotenv.config({ path: './config.env' });
 * 
 * From there on we can use the env variables by accessing them using their key to gain access to the value
 *  - const port = process.env.PORT || 3000;
 * 
 *          or 
 * 
 *  - if (process.env.NODE_ENV === 'development') {
          app.use(morgan('dev'));
      }
 *  
 * By doing this, we can run code for development or production mode, when building the application
 *
 *
 */

// START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

/**
 * 1. We run the server script, which listens for requests on port 3000
 *
 * 2. This is in turn then enters into app.js - which is our middleware file, where the requests go through
 *
 * 3. The request will then hit the route handling, then entering the
 * [tour/user]Routes.js in turn reaching the correct HTTP request method
 *
 * 4. The request method will hit the callback functions of the route handlers which are in [tour/user]Controllers.js, thus entering that file.
 *
 * 5. In the Controllers, the res.send() -> which is json() [will call .send()] will end the request-response cycle and be ready for the next request from a client
 *
 */

/**
 * CONNECT MONGO ON TERMINAL
 * mongo "mongodb+srv://cluster0.urnf4.mongodb.net/Natours" --username Idris
 */
