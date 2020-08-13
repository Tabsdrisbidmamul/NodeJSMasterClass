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

const readFileAsyncAwait = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    console.log(`Dog Breed: ${data}`);

    const res = await superAgent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    console.log(`Message: ${res.body.message}\nSuccess: ${res.body.status}`);

    await writeFilePromise('dog-image.txt', res.body.message);
    console.log(`Random Dog Breed saved to file`);
  } catch (e) {
    console.log(e);
    throw e;
  }
  return '2: READY 🐶';
};

(async () => {
  try {
    console.log('1: Will get Dog pics!');
    const x = await readFileAsyncAwait();
    console.log(x);
    console.log('3: Done getting Dog pics!');
  } catch (e) {
    console.log('Something went wrong 🔥');
  }
})();

/*
console.log('1: Will get Dog pics!');
readFileAsyncAwait()
  .then((x) => {
    console.log(x);
    console.log('3: Done getting Dog pics!');
  })
  .catch((e) => {
    console.log('Something went wrong');
  });
*/

/*
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
*/
