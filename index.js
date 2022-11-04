const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
require('./gulpfile');

const port = process.argv[2] || 3000;

const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

/**
 * Runs the development build process
 */
gulp.series('dev');

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url).pathname;
  const sanitizePath = path.normalize(parsedUrl).replace(/%20/g, ' ');

  let pathname = path.join(__dirname, 'dist', sanitizePath);

  fs.exists(pathname, exist => {
    if (!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }

    fs.readFile(pathname, (err, data) => {
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const ext = path.parse(pathname).ext;

        res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });
}).listen(parseInt(port));
console.log(`Server listening on port ${port}`);