const fs = require('fs');
const superAgent = require('superagent');

fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  console.log(`Dog Breed: ${data}`);
  superAgent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .end((err, res) => {
      if (err) return console.log(`Could not find Breed: ${data}`);
      console.log(`Message: ${res.body.message}\nSuccess: ${res.body.status}`);

      fs.writeFile('dog-image.txt', res.body.message, (err) => {
        if (err) return console.log(`Could not find Breed: ${data}`);
        console.log(`Random Dog Breed ${data} saved to file`);
      });
    });
});
