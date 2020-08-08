const fs = require('fs'); // ran 2nd
const crypto = require('crypto');

const start = Date.now();
/**
 * This constant determines the number of threads in the Thread Pool
 * In Windows - we have to set the ThreadPool first before running any Node Scripts
 *
 * We have to do this via NPM scripts
 * - "start": "set UV_THREADPOOL_SIZE=1 & node event-loop.js"
 *
 */
process.env.UV_THREADPOOL_SIZE = 1;

setTimeout(() => console.log('Timer 1 finished'), 0);
setImmediate(() => console.log('Immediate 1 finished'));

fs.readFile('test-file.txt', (err, data) => {
  console.log('I/O finished');
  console.log('-'.repeat(40));
  setTimeout(() => console.log('Timer 2 finished'), 0);
  setTimeout(() => console.log('Timer 3 finished'), 3000);
  setImmediate(() => console.log('Immediate 2 finished'));

  process.nextTick(() => console.log('Process.nextTick'));

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password encrypted');
  });

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password encrypted');
  });

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password encrypted');
  });

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password encrypted');
  });
});

console.log('Hello from the top-level code'); // ran 1st
