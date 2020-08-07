const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

/***
 * FILES READ AND WRITE
 */

// // Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log("File Written");

// Non-blocking, asynchronous way
// fs.readFile('./txt/start.txt', 'utf8', (err1, data1) => {
//     if (err1) return console.log('ERROR');

//     fs.readFile(`./txt/${data1}.txt`, 'utf8', (err2, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf8', (err3, data3) => {
//             console.log(data3);

//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf8', err => {
//                 console.log('Your file has been written');
//             });

//         });
//     });
// });
// console.log('Will read file!');

/***
 * SERVER
 */

/* Helper functions */
// in modules

// Read in the Templates
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf8'
);

// Read in and Parse JSON file
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf8');
const dataObj = JSON.parse(data);

// Slugify the URLs - to get the last trailing part and we can then make a reader-friendly string from it
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

// Create Server
const server = http.createServer((req, res) => {
  const { query, pathname: pathName } = url.parse(req.url, true);

  // Overview Page (Home Page)
  if (pathName === '/' || pathName === '/overview') {
    // Telling the client what content we are giving back to them
    res.writeHeader(200, { 'Content-type': 'text/html' });

    // Create a new array with the Parsed Templated, then covert entire array to a String object
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');

    // plug in the String object into the HTML
    const output = tempOverview.replace('{ %PRODUCT_CARDS% }', cardsHtml);

    // Respond the final HTML to the client
    res.end(output);

    // Products Page (For a specific product)
  } else if (pathName === '/product') {
    // Tell Client this is a HTML doc
    res.writeHeader(200, { 'Content-type': 'text/html' });

    // Get the position of the Product from the array - the id and array position are the same
    const product = dataObj[query.id];

    // Parse the String with JSON values and plug it in and return it as a HTML String
    const output = replaceTemplate(tempProduct, product);

    // Respond to the client with the String HTML
    res.end(output);

    // Request API Page and information
  } else if (pathName === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // Not Found Page 404
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

// Start listening for requests for server on port 8000 on IP localhost
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
