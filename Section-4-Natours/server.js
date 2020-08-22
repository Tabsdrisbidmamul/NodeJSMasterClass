const app = require('./app');
// START SERVER

console.log(process.env);

const port = 3000;
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
