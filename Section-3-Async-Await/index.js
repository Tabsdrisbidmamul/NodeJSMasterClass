const fs = require('fs');
const superAgent = require('superagent');

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject({ readMessage: 'File Was Not Found!' });
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject({ writeMessage: 'Could Write File' });
      resolve('Success');
    });
  });
};

readFilePromise(`${__dirname}/dog.txt`)
  .then((data) => {
    console.log(`Dog Breed: ${data}`);
    return superAgent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .catch((readMessage) => {
    console.log(readMessage);
  })
  .then((res) => {
    console.log(`Message: ${res.body.message}\nSuccess: ${res.body.status}`);
    return writeFilePromise('dog-image.txt', res.body.message);
  })
  .catch((writeMessage) => {
    console.log(writeMessage);
  })
  .then(() => {
    console.log(`Random Dog Breed saved to file`);
  })
  .catch(() => console.log('Something went wrong'));
