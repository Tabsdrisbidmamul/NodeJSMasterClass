/**
 * Node JS EventLoop, Events and Streams
 *
 * Node JS entires revolves around the Event Loop - and with this loop is how Node JS can run nearly everything on a single Thread.
 *
 * How it works?
 * In the single Thread we first:
 *  1. Initialize the program
 *  2. Execute Top-level code (synchronous code that is not in callbacks)
 *  3. Gather the required modules
 *  4. Register the event callbacks (the place where run asynchronous code)
 *  5. Start the event loop
 *    5a. If a process is too costly - then offload it into the Thread pool (by default only 4 threads maximum of 128 Threads)
 *      e.g.
 *        - File System APIS (Pretty much all of I/O so File I/O and Web I/O)
 *        - Cryptography
 *        - Compression
 *        - DNS lookups
 *    5b. If process is not too costly run in the Event Loop
 *
 *
 * Event Loop
 * All Application code that is inside callback functions (so not top-level code) are considered and ran inside the Event Loop.
 *
 * Event Driven architecture:
 *  - Events are emitted
 *  - Event Loops picks them up
 *  - Callbacks are called
 *
 * Special Rules to Event Loop
 * - process.nextTick() is always ran after the current Event process is complete
 * - setImmediate() calls are processed on Every tick (being the next iteration of the loop)
 *
 *
 * The Rules to Event Loop
 * The events run in this order (exception of special rules where they have higher priority and therefore ran first)
 *
 *  1. Expired timer callbacks (setTimeOut())
 *  2. I/O Polling and callbacks (Listening on I/O Streams for any changes so FIle and Network I/O)
 *  3. setImmediate() callbacks when you want a process to ran after the next tick
 *  4. Close callbacks - closing streams gracefully or not etc.
 *
 * Special EventLoop that is in Node core
 *  - process.nextTick(): processes to be ran straight after the current process has completed
 *  - Other micro tasks Queue: Resolved promises sit here
 *
 * Best Practices
 * - Don't block on the single Thread Event Loop
 *  - Don;t use the Sync versions of functions in fs, crypto and zlib modules in your callback functions
 *
 * - Don't perform very huge and complex calculations in (e.g. loops inside loops)
 *
 * - Be careful with JSON in large objects
 *
 * - Don't use too complex regex (e.g. nested quantifiers)
 *
 *
 * Events
 * Event Driven Architecture
 * Like in Browser where it can fire off events, Node itself has a collection of Events that can be fired off and be listened on as well.
 *
 *  - Event Emitters: These are the fired off events that Node tells us - so when a USer requests files from the server - Node will fire off the 'request' event to the server
 *  - Event Listeners: These are the code that we devs write to do something when an Event has fired off via a callback function
 *
 * Observer Pattern
 * This block consists of Event Emitters and Event Listeners
 * Where the Event Emitter emits an Event, and we can have one or more event Listeners listening on it and react accordingly to the Event via the callback function we have attached to it
 */

const EventEmitter = require('events');
const http = require('http');

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on('newSale', () => {
  console.log('There was a new sale!');
});

myEmitter.on('newSale', () => {
  console.log('Customer name: Jonas');
});

myEmitter.on('newSale', (stock) => {
  console.log(`There are now ${stock} items left in stock`);
});

myEmitter.emit('newSale', 9);

/**---------------------------------------------------------------- */
const server = http.createServer();

server.on('request', (req, res) => {
  console.log('Request received!');
  console.log(req.url);
  res.end('Request Received, Server sent this message');
});

server.on('request', (req, res) => {
  console.log('Request Received again, Server sent this message');
});

server.on('close', () => {
  console.log('Server close');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Waiting for requests...');
});
