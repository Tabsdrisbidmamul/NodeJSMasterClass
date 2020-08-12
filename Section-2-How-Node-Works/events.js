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
 *
 * Modules
 * In Node everything can be pretty much be considered as a module - that is every JS file is a module
 *
 * Node uses the CommonJS Module System:
 *  - require()
 *  - exports or module.exports
 *
 * This is different from ES6 modules that works natively in the browser:
 *  - import and export
 *
 * In every Node file we have access to the require() function - but where does this come from?
 * Firstly we need to look at what happens when we call the require() function
 *
 *  1. Resolves and Loads: Resolves and Load the module via the argument passed to the require() function
 *
 *  2. Wrapper: It will then wrap the function into an IFFE
 *
 *  3. Execution: The IFFE is then executed
 *
 *  4. Exports: The module is then returned (exports)
 *
 *  5. Cache: The module and its code is then cached - so when we call it again - it is called from cache and not from another directory tree
 *
 * Resolves and Loads
 * There are 3 type of modules in Node
 *  1. Core modules: these are modules like 'http', 'url' 'fs' - so modules that are essential to get back-end server work to get done
 * require('http');
 *
 * 2. Developer Modules: these are modules that we write - so like the MVC architecture - we will wrap certain functionalities of code into different modules to make the code more maintainable
 * require('./lib/Controller);
 *
 * 3. 3rd party modules: modules from NPM - so like 'express', 'webpack', 'react' etc.
 * require('express)
 *
 * Node will do 4 things
 *  1. Start with Core Modules - like 'http' it automatically find and resolve the path to the core module
 *
 *  2. if the argument starts with './' or '../' it then knows that it is a Developer module and will load that file
 *
 *  3. If no file is found, it will try to find the folder with 'index.js' in it and load that instead
 *
 *  4. Else, Node will assume that it is a 3rd party module and will go to the node_modules/ and load the module from there - just like Core Modules it it does not require a path to it
 *
 * If the file cannot be found, the program will throw an error and execution of the file is stopped
 *
 *
 * Wrapper
 * This step is where Node will do its magic, (its because of this code is that we get access import of modules) Node will get the body of code from step 1. and place it within a IFFE that has these arguments
 *
 * This IFFE is especially useful - why?
 * IFFE provide another level of scope - meaning all variables declared inside the IFFE are private to the outer level so that means we can import our modules and NPM modules that many have conflicting variable names - but it will not affect how our program will run - because they are essentially private to one another
 *
 * Node provides us global access to these parameter list variables and they are use in the IFFE - meaning our code is wrapped in an IFFE and of course we get access to these parameters - its Node that pops them in as arguments depending on the module its working on
 *
 * (function(exports, require, module, __filename, __dirname) {
 *    // module code lives here
 * });
 *
 *  - require: function to require modules
 *  - module: reference to current module
 *  - exports: a reference to module.exports, used to export object from a module
 *  - __filename: the absolute path to the current module file
 *  - __dirname: the directory name of the module - its parent directory
 *
 *
 * Execution
 * The NodeJS runtime will execute the code within the wrapper function - so the wrapper function itself
 *
 *
 * Exports
 *  - The require function returns (exports) of the required module - this is again the exports variable from a wrapper function
 *
 *  - module.exports is the returned object - the most important top-level argument
 *
 *  - use module.exports to export one single variable (e.g. one class or one function module.exports = Calculator) <- it becomes a property of the module.exports Object
 *
 *  - use exports to export multiple variable names (e.g. exports.add = (a, b) => a + b) <- these become property of the exports Object
 *
 *  - This is how we export modules from one another
 *
 * Cache
 * When in import a module - the first time it is cached (in memory of course) and ran the first time - every subsequent calls to the that module - say we want to import it again then it retrieved from the cache (the first copy that was plopped into memory when first called)
 *
 *
 *
 *
 *
 *
 *
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
