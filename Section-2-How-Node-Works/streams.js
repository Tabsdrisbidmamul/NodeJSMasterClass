const fs = require('fs');
const server = require('http').createServer();

/**
 * In the createServer method - Node will attach a request stream and respond stream (read stream and write stream) So in turn we can use these streams to send data to clients more effectively - because we send the read piece (bit) of data straight away to the user
 *
 */
server.on('request', (req, res) => {
  // Solution 1 - read in thew whole file into memory
  //   fs.readFile('test-file.txt', (err, data) => {
  //     if (err) console.log(err);
  //     res.end(data);
  //   });

  // Solution 2 - Streams
  /**
   * - Create a stream to the text file - so a persistent pipe or a link to the file and we read a chunk or bit by bit of the file into memory.
   *
   * - We then use a write stream to send each chunk (we read from the file) to the client all at the same time - so we read a piece of the file and then send that piece to the user, then we read a piece of the file again and send that piece of data back to the client.
   *
   * We keep doing this till either we have read the entire file (EOF) or the connection between host and client stops
   *
   * Handling EOF
   * - We have to make sure to close the stream once the files have been streamed to the user, so we use the "end" event listener and all we do is close the response stream (res.end()) signalling that there is no more data to be sent
   *
   * - We don't pass in anything because we have streamed all the data - so this method call is simply to close the response stream
   *
   * Handling Errors
   * - We listen on the err event on the readable stream, and we can do several things - log the error on the server side, and on the response stream (res) we can set the status code to 500 (to indicate server error) and then close the response stream by giving a message to the end-user
   *
   * Problems
   * Back pressure: Is when the readable stream is getting data back much faster than the writable stream (response stream) can output
   */

  //   const readable = fs.createReadStream('test-file.txt');
  //   readable.on('data', (chunk) => {
  //     res.write(chunk);
  //   });
  //   readable.on('end', () => {
  //     res.end();
  //   });
  //   readable.on('error', (err) => {
  //     console.log(err);
  //     res.statusCode = 500;
  //     res.end('File Not Found');
  //   });

  // Solution 3 - Pipes
  /**
   * To fix back pressure we use pipes to solve that problem.
   *
   * What are pipes?
   * a pipe function will connect 2 streams together - so in this case we are connecting a readable stream to a writable stream - this in turn will solve a stream being faster that its counterpart
   *
   * readableSource.pipe(WriteableDestination)
   *
   * WriteableDestination can be a DuplexStream or a TransformStream - but it must always be a writeable stream for it to work
   *
   * Pipe solves the issue of back pressure - however if we want a more customized approach with our streams Solution 2 - that works with the events of a stream is the best approach
   */
  const readable = fs.createReadStream('test-file.txt');
  readable.pipe(res);
});

server.listen(8000, '127.0.0.1', () => {
  console.log('listening....');
});
