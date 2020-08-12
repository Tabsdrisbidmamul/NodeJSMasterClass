// console.log(arguments);
// console.log(require('module').wrapper);

// To get modules, we use the require() function and pass in the path or module name to retrieve the module

// module.exports
// We use capital variable names for Classes
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
/* Using destructing, we can extract the specific properties from the object returned from exports to further increase readability

See it as how we can choose what we want to import from a module when uing normal JS 
e.g. import { add, multiply } from './calculator'; */

const { Calculator, subtract } = require('./test-module-2');
const calc2 = new Calculator();
console.log(calc2.add(2, 5));
console.log(subtract(7, 2));

// Caching
/**
 * The code within the function that is imported from 'test-modules-3' is ran 3 times and thus is outputted the text three times
 *
 * But the console.log() within the module is ran only once - this is because Node will run the module once and then cache the return results of the export to memory - so when we require it again then it simply gets the return of the import from memory and not run the module again - this saves a lot of processing time as a result
 */
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();
