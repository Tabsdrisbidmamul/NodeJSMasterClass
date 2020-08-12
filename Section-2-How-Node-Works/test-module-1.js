/**
 * There are 2 ways of exporting classes and functions, that is through names declaration and anonymous declaration
 * 
 * Named Declaration
 *  - Here we write the function/ class declaration as normal, then we simply assign the exports property in module to that named function/ class
 * 
 *Anonymous Declaration
    - Its writing an anonymous function/ class that is being assigned to the exports property in module
 */

// Named declaration
// class Calculator {
//   add(a, b) {
//     return a + b;
//   }

//   multiple(a, b) {
//     return a * b;
//   }

//   divide(a, b) {
//     return a / b;
//   }
// }

// module.exports = Calculator

// Anonymous Declaration
module.exports = class {
  add(a, b) {
    return a + b;
  }

  multiple(a, b) {
    return a * b;
  }

  divide(a, b) {
    return a / b;
  }
};
